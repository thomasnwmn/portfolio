import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const TAGS = ["posts", "projects"] as const;

function authorized(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Expires cached Notion content immediately, e.g. from a Notion database automation
// ("Send webhook") when a page is published, unpublished or edited.
//   POST /api/revalidate?tag=posts      Authorization: Bearer $REVALIDATE_SECRET
// Omit ?tag to expire both blog posts and projects.
export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const tag = new URL(request.url).searchParams.get("tag");
  if (tag && !TAGS.includes(tag as (typeof TAGS)[number])) {
    return Response.json({ error: `Unknown tag. Use one of: ${TAGS.join(", ")}.` }, { status: 400 });
  }
  const tags = tag ? [tag] : [...TAGS];
  // expire: 0 never serves the stale copy, so an unpublished page disappears on the next request.
  for (const name of tags) revalidateTag(name, { expire: 0 });
  return Response.json({ revalidated: tags });
}
