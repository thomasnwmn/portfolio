import { isFullBlock, isFullPage } from "@notionhq/client";
import sharp from "sharp";
import { isPublishedPost, notion } from "@/lib/notion";
import { isPublishedProject } from "@/lib/projects";

type Params = { params: Promise<{ kind: string; id: string; version: string }> };

const NOTION_ID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

// Notion file URLs are signed and expire after about an hour, so the site links to
// this stable route. It resolves a fresh signed URL on each cache miss and only
// serves media belonging to published pages in the projects or blog databases.
async function resolvePublishedPage(pageId: string) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  return isFullPage(page) && (isPublishedProject(page) || isPublishedPost(page)) ? page : null;
}

async function resolveMediaUrl(kind: string, id: string): Promise<string | null> {
  if (kind === "cover") {
    const cover = (await resolvePublishedPage(id))?.cover;
    if (!cover) return null;
    return cover.type === "external" ? cover.external.url : cover.file.url;
  }
  if (kind !== "block") return null;
  const block = await notion.blocks.retrieve({ block_id: id });
  if (!isFullBlock(block)) return null;
  const media = block.type === "image" ? block.image : block.type === "video" ? block.video
    : block.type === "file" ? block.file : block.type === "pdf" ? block.pdf : null;
  if (!media) return null;
  // Walk up through columns, toggles, etc. to the page that owns this block.
  let parent = block.parent;
  for (let depth = 0; depth < 12 && parent.type === "block_id"; depth++) {
    const ancestor = await notion.blocks.retrieve({ block_id: parent.block_id });
    if (!isFullBlock(ancestor)) return null;
    parent = ancestor.parent;
  }
  if (parent.type !== "page_id" || !(await resolvePublishedPage(parent.page_id))) return null;
  return media.type === "external" ? media.external.url : media.file.url;
}

// Next's image optimizer passes animated images through untouched, so a GIF cover
// would reach phones at full size (one is ~20 MB). Re-encode animated GIFs as a
// smaller animated WebP here; the optimizer then caches the result. Still images
// pass through for the optimizer to resize.
const ANIMATED_WIDTH = 640;
async function shrinkAnimated(body: ArrayBuffer) {
  const input = sharp(body, { animated: true });
  if (((await input.metadata()).pages ?? 1) < 2) return null;
  return input.resize({ width: ANIMATED_WIDTH, withoutEnlargement: true }).webp({ quality: 65, effort: 4 }).toBuffer();
}

export async function GET(request: Request, { params }: Params) {
  const { kind, id, version } = await params;
  if (!NOTION_ID.test(id) || !/^\d+$/.test(version)) return new Response("Not found", { status: 404 });
  try {
    const mediaUrl = await resolveMediaUrl(kind, id);
    if (!mediaUrl) return new Response("Not found", { status: 404 });
    // Forward Range so <video> can seek through Notion-hosted demo files.
    const range = request.headers.get("range");
    const upstream = await fetch(mediaUrl, { headers: range ? { Range: range } : {}, cache: "no-store" });
    if (!upstream.ok || !upstream.body) return new Response("Media unavailable", { status: 502 });
    // Notion can label a GIF as image/jpeg, so sniff the file header instead of trusting the type.
    if (!range && upstream.headers.get("content-type")?.startsWith("image/")) {
      const body = await upstream.arrayBuffer();
      const isGif = new TextDecoder().decode(new Uint8Array(body, 0, Math.min(4, body.byteLength))) === "GIF8";
      const webp = isGif ? await shrinkAnimated(body).catch(() => null) : null;
      return new Response(webp ? new Uint8Array(webp) : body, { headers: {
        "Content-Type": webp ? "image/webp" : isGif ? "image/gif" : upstream.headers.get("content-type")!,
        "Cache-Control": "public, max-age=31536000, immutable",
      } });
    }
    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      // The version segment changes whenever the page/block is edited, so the bytes are immutable.
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    for (const name of ["content-length", "content-range", "accept-ranges", "content-disposition"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response("Media unavailable", { status: 502 });
  }
}
