import { getProject } from "@/lib/projects";

export type MediaKind = "image" | "audio" | "video";

// Files the browser can show without GitHub's viewer, keyed by extension. The
// type is set from this table rather than trusted from upstream.
const MEDIA: Record<string, { kind: MediaKind; mime: string }> = {
  png: { kind: "image", mime: "image/png" },
  jpg: { kind: "image", mime: "image/jpeg" },
  jpeg: { kind: "image", mime: "image/jpeg" },
  gif: { kind: "image", mime: "image/gif" },
  webp: { kind: "image", mime: "image/webp" },
  avif: { kind: "image", mime: "image/avif" },
  bmp: { kind: "image", mime: "image/bmp" },
  ico: { kind: "image", mime: "image/x-icon" },
  svg: { kind: "image", mime: "image/svg+xml" },
  mp3: { kind: "audio", mime: "audio/mpeg" },
  wav: { kind: "audio", mime: "audio/wav" },
  ogg: { kind: "audio", mime: "audio/ogg" },
  flac: { kind: "audio", mime: "audio/flac" },
  m4a: { kind: "audio", mime: "audio/mp4" },
  mp4: { kind: "video", mime: "video/mp4" },
  webm: { kind: "video", mime: "video/webm" },
  mov: { kind: "video", mime: "video/quicktime" },
};

// Larger media links out to GitHub rather than streaming through the site.
export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

export function mediaOf(path: string) {
  const name = path.split("/").pop() ?? "";
  return name.includes(".") ? MEDIA[name.split(".").pop()!.toLowerCase()] ?? null : null;
}

export type Repository = { owner: string; name: string; ref: string | undefined; root: string };

/** Resolves a project's repository and a requested path, or returns the error response to send. */
export async function resolveRepositoryPath(slug: string, request: Request): Promise<{ repository: Repository; path: string; fullPath: string } | Response> {
  const config = (await getProject(slug))?.repositoryBrowser;
  if (!config) return Response.json({ error: "Repository browser is not enabled." }, { status: 404 });
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/.exec(config.url);
  if (!match) return Response.json({ error: "Invalid repository configuration." }, { status: 500 });
  const path = new URL(request.url).searchParams.get("path") || "";
  if (path.split("/").some(segment => segment === "." || segment === "..") || path.includes("\\") || path.startsWith("/")) {
    return Response.json({ error: "Invalid file path." }, { status: 400 });
  }
  const root = config.rootPath?.replace(/^\/+|\/+$/g, "") || "";
  return { repository: { owner: match[1], name: match[2], ref: config.branch, root }, path, fullPath: [root, path].filter(Boolean).join("/") };
}

export const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");
