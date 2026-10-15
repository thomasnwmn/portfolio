import { isFullBlock, type Client } from "@notionhq/client";
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import type { NotionToMarkdown } from "notion-to-md";
import type { MdBlock } from "notion-to-md/build/types";

// Custom notion-to-md transformers. Each returns raw HTML (rendered through
// rehype-raw) or `false` to fall back to notion-to-md's default markdown.
// Markdown inside an HTML wrapper must sit between blank lines to be parsed.

type Block = Parameters<NotionToMarkdown["blockToMarkdown"]>[0];

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function plain(richText: RichTextItemResponse[]) {
  return richText.map(part => part.plain_text).join("").trim();
}

// Notion-hosted files use signed URLs that expire after about an hour, which would
// break once a page is cached. Point them at the stable proxy route instead; it
// resolves a fresh URL on demand.
function mediaUrl(blockId: string, lastEditedTime: string) {
  return `/api/notion-image/block/${blockId}/${Date.parse(lastEditedTime)}`;
}

function figure(inner: string, caption: string, className = "notion-media") {
  return `<figure class="${className}">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
}

// YouTube, Vimeo and Loom links become privacy-friendly responsive players.
export function embedUrl(url: string): string | null {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    const host = hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${pathname.slice(1)}`;
    if (host === "youtube.com") {
      const id = searchParams.get("v") ?? pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = pathname.match(/^\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}?dnt=1` : null;
    }
    if (host === "loom.com") {
      const id = pathname.match(/^\/(?:share|embed)\/(\w+)/)?.[1];
      return id ? `https://www.loom.com/embed/${id}` : null;
    }
  } catch {}
  return null;
}

function iframe(src: string, caption: string) {
  return figure(`<div class="notion-embed"><iframe src="${escapeHtml(src)}" title="${caption || "Embedded media"}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`, caption);
}

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function meta(html: string, ...names: string[]) {
  for (const name of names) {
    const tag = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*>`, "i"))?.[0];
    const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
    if (content?.trim()) return decodeEntities(content.trim());
  }
  return "";
}

// Fetches the page title/description for bookmark cards. Runs only when the page's
// markdown is (re)built, which is cached, so visitors never wait on it.
async function linkPreview(url: string) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PortfolioLinkPreview/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    const html = (await response.text()).slice(0, 200_000);
    const title = meta(html, "og:title", "twitter:title") || decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "");
    return { title, description: meta(html, "og:description", "description", "twitter:description") };
  } catch {
    return null;
  }
}

const ICONS = {
  link: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  file: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>`,
  info: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
};

async function bookmark(url: string, caption: string) {
  let host = url;
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch {}
  const preview = await linkPreview(url);
  const title = escapeHtml(caption || preview?.title || host);
  const description = preview?.description ? `<span class="notion-bookmark-description">${escapeHtml(preview.description)}</span>` : "";
  return `<a class="notion-bookmark" href="${escapeHtml(url)}" target="_blank" rel="noreferrer"><span class="notion-bookmark-icon">${ICONS.link}</span><span class="notion-bookmark-text"><span class="notion-bookmark-title">${title}</span>${description}<span class="notion-bookmark-url">${escapeHtml(host)}</span></span></a>`;
}

export function registerTransformers(n2m: NotionToMarkdown, notion: Client, fixToggleBlocks: (blocks: MdBlock[]) => MdBlock[]) {
  // Rich text -> markdown with bold/italic/links/inline code preserved.
  const richTextMarkdown = (richText: RichTextItemResponse[]) =>
    n2m.blockToMarkdown({ type: "paragraph", paragraph: { rich_text: richText } } as unknown as Block);

  // Child blocks of a block -> markdown, with all transformers applied.
  const childrenMarkdown = async (blockId: string) => {
    const blocks = fixToggleBlocks(await n2m.pageToMarkdown(blockId));
    const md = n2m.toMarkdownString(blocks);
    return typeof md === "string" ? md : (md.parent || "");
  };

  n2m.setCustomTransformer("image", block => {
    if (!isFullBlock(block) || block.type !== "image" || block.image.type !== "file") return false;
    const caption = escapeHtml(plain(block.image.caption));
    return figure(`<img src="${mediaUrl(block.id, block.last_edited_time)}" alt="${caption}" loading="lazy" />`, caption);
  });

  n2m.setCustomTransformer("video", block => {
    if (!isFullBlock(block) || block.type !== "video") return false;
    const caption = escapeHtml(plain(block.video.caption));
    if (block.video.type === "external") {
      const src = embedUrl(block.video.external.url);
      return src ? iframe(src, caption) : false;
    }
    return figure(`<video src="${mediaUrl(block.id, block.last_edited_time)}" controls preload="metadata" playsinline></video>`, caption);
  });

  n2m.setCustomTransformer("embed", block => {
    if (!isFullBlock(block) || block.type !== "embed") return false;
    const caption = escapeHtml(plain(block.embed.caption));
    const src = embedUrl(block.embed.url);
    return src ? iframe(src, caption) : bookmark(block.embed.url, caption);
  });

  n2m.setCustomTransformer("bookmark", block => {
    if (!isFullBlock(block) || block.type !== "bookmark") return false;
    return bookmark(block.bookmark.url, plain(block.bookmark.caption));
  });

  n2m.setCustomTransformer("link_preview", block => {
    if (!isFullBlock(block) || block.type !== "link_preview") return false;
    return bookmark(block.link_preview.url, "");
  });

  // File and PDF blocks become cards that open through the stable media route.
  const fileCard = (block: Block) => {
    if (!isFullBlock(block)) return false;
    const file = block.type === "file" ? block.file : block.type === "pdf" ? block.pdf : null;
    if (!file) return false;
    const source = file.type === "file" ? file.file.url : file.external.url;
    const href = file.type === "file" ? mediaUrl(block.id, block.last_edited_time) : source;
    let fallbackName = "file";
    try { fallbackName = decodeURIComponent(new URL(source).pathname.split("/").pop() || "file"); } catch {}
    const fileName = "name" in file && typeof file.name === "string" ? file.name : "";
    const name = escapeHtml(plain(file.caption) || fileName || fallbackName);
    const label = block.type === "pdf" ? "PDF document" : "Download file";
    return `<a class="notion-file" href="${escapeHtml(href)}" target="_blank" rel="noreferrer"><span class="notion-file-icon">${ICONS.file}</span><span class="notion-file-text"><span class="notion-file-name">${name}</span><span class="notion-file-label">${label}</span></span></a>`;
  };
  n2m.setCustomTransformer("file", fileCard);
  n2m.setCustomTransformer("pdf", fileCard);

  // Callouts keep their emoji and background colour; real quotes stay blockquotes.
  n2m.setCustomTransformer("callout", async block => {
    if (!isFullBlock(block) || block.type !== "callout") return false;
    const { icon, color, rich_text } = block.callout;
    const iconHtml = icon?.type === "emoji" ? escapeHtml(icon.emoji) : ICONS.info;
    const text = await richTextMarkdown(rich_text);
    const children = block.has_children ? await childrenMarkdown(block.id) : "";
    return `<aside class="notion-callout" data-color="${escapeHtml(color.replace("_background", ""))}">\n<span class="notion-callout-icon">${iconHtml}</span>\n<div class="notion-callout-body">\n\n${text}\n\n${children}\n\n</div>\n</aside>`;
  });

  // Columns render side by side (stacking on phones) instead of being flattened.
  n2m.setCustomTransformer("column_list", async block => {
    if (!isFullBlock(block) || block.type !== "column_list") return false;
    const { results } = await notion.blocks.children.list({ block_id: block.id, page_size: 10 });
    const columns = await Promise.all(results.filter(isFullBlock).map(column => childrenMarkdown(column.id)));
    return `<div class="notion-columns" data-columns="${columns.length}">\n${columns.map(md => `<div class="notion-column">\n\n${md}\n\n</div>`).join("\n")}\n</div>`;
  });
}
