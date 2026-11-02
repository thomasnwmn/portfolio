import { encodePath, MAX_MEDIA_BYTES, mediaOf, resolveRepositoryPath } from "@/lib/repository";

// Streams an image, audio or video file from the repository so the browser can
// show it inline. Only the media types in lib/repository are served, with the
// type set from the extension, and the sandbox policy keeps an SVG opened on
// its own from running scripts on this site.
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const resolved = await resolveRepositoryPath((await params).slug, request);
  if (resolved instanceof Response) return resolved;
  const { repository, path, fullPath } = resolved;
  const media = mediaOf(path);
  if (!media) return Response.json({ error: "This file type cannot be previewed." }, { status: 415 });
  const url = `https://raw.githubusercontent.com/${repository.owner}/${repository.name}/${encodeURIComponent(repository.ref || "HEAD")}/${encodePath(fullPath)}`;
  // Range lets audio and video seek without downloading the whole file.
  const range = request.headers.get("range");
  try {
    const upstream = await fetch(url, { headers: range ? { Range: range } : {}, next: { revalidate: 300 }, signal: AbortSignal.timeout(20000) });
    if (!upstream.ok || !upstream.body) return Response.json({ error: "This file is currently unavailable." }, { status: upstream.status === 404 ? 404 : 502 });
    if (Number(upstream.headers.get("content-length") ?? 0) > MAX_MEDIA_BYTES && upstream.status !== 206) {
      return Response.json({ error: "This file is too large to preview." }, { status: 413 });
    }
    const headers = new Headers({
      "Content-Type": media.mime,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-length", "content-range", "accept-ranges", "etag"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return Response.json({ error: "Could not reach GitHub. Please try again." }, { status: 502 });
  }
}
