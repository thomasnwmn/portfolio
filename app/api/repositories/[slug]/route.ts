import { getProject } from "@/lib/projects";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const config = getProject((await params).slug)?.repositoryBrowser;
  if (!config) return Response.json({ error: "Repository browser is not enabled." }, { status: 404 });
  const repository = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/.exec(config.url);
  if (!repository) return Response.json({ error: "Invalid repository configuration." }, { status: 500 });
  const path = new URL(request.url).searchParams.get("path") || "";
  if (path.split("/").some(segment => segment === "." || segment === "..") || path.includes("\\") || path.startsWith("/")) {
    return Response.json({ error: "Invalid file path." }, { status: 400 });
  }
  const root = config.rootPath?.replace(/^\/+|\/+$/g, "") || "";
  const fullPath = [root, path].filter(Boolean).join("/");
  const url = new URL(`https://api.github.com/repos/${repository[1]}/${repository[2]}/contents/${fullPath.split("/").map(encodeURIComponent).join("/")}`);
  if (config.branch) url.searchParams.set("ref", config.branch);
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
        name: item.name, path: root ? item.path.slice(root.length + 1) : item.path,
        type: item.type === "dir" ? "directory" : "file",
      })).sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1)), truncated: data.length >= 1000 });
    }
    // Render source as text only. Binary files, symlinks and large files use GitHub's viewer.
    if (data.type !== "file" || data.submodule_git_url || data.size > 256000 || data.encoding !== "base64") {
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
    return Response.json({ type: "file", content });
  } catch {
    return Response.json({ error: "Could not reach GitHub. Please try again." }, { status: 502 });
  }
}
