import { highlight } from "@/lib/highlight";
import { encodePath, MAX_MEDIA_BYTES, mediaOf, resolveRepositoryPath } from "@/lib/repository";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveRepositoryPath(slug, request);
  if (resolved instanceof Response) return resolved;
  const { repository, path, fullPath } = resolved;
  const url = new URL(`https://api.github.com/repos/${repository.owner}/${repository.name}/contents/${encodePath(fullPath)}`);
  if (repository.ref) url.searchParams.set("ref", repository.ref);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const limited = response.status === 403 || response.status === 429;
      return Response.json({ error: limited ? "GitHub is limiting requests. Please try again later or open the repository on GitHub." : "This repository or file is currently unavailable." }, { status: limited ? 429 : response.status === 404 ? 404 : 502 });
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return Response.json({ type: "directory", entries: data.map(item => ({
        name: item.name, path: repository.root ? item.path.slice(repository.root.length + 1) : item.path,
        type: item.type === "dir" ? "directory" : "file",
      })).sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1)), truncated: data.length >= 1000 });
    }
    if (data.type !== "file" || data.submodule_git_url) {
      return Response.json({ type: "unsupported", message: "This file cannot be previewed here. Open it on GitHub." });
    }
    // Images, audio and video stream from the raw route; an SVG also keeps its source for the code view.
    const media = mediaOf(path);
    const raw = `/api/repositories/${encodeURIComponent(slug)}/raw?path=${encodeURIComponent(path)}`;
    if (media && media.mime !== "image/svg+xml") {
      if (data.size > MAX_MEDIA_BYTES) return Response.json({ type: "unsupported", message: "This file is too large to preview here. Open it on GitHub." });
      return Response.json({ type: "media", kind: media.kind, url: raw, size: data.size });
    }
    // Source renders as text. Binary and large files use GitHub's viewer.
    if (data.size > 256000 || data.encoding !== "base64") {
      return Response.json({ type: "unsupported", message: "This file cannot be previewed here. Open it on GitHub." });
    }
    const bytes = Buffer.from(data.content, "base64");
    let content: string;
    try {
      content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (content.includes("\0")) throw new Error("Binary file");
    } catch {
      return Response.json({ type: "unsupported", message: "Binary files can be viewed or downloaded on GitHub." });
    }
    const { language, languageName, lines } = await highlight(content, path);
    return Response.json({ type: "file", content, language, languageName, lines, size: data.size, ...(media ? { preview: raw } : {}) });
  } catch {
    return Response.json({ error: "Could not reach GitHub. Please try again." }, { status: 502 });
  }
}
