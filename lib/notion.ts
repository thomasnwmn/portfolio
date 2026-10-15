import { Client, isFullBlock, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import type { MdBlock } from "notion-to-md/build/types";
import { cacheLife, cacheTag } from "next/cache";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const n2m = new NotionToMarkdown({ notionClient: notion });

// Notion-hosted files use signed URLs that expire after about an hour, which would
// break once a page is cached. Point them at the stable proxy route instead; it
// resolves a fresh URL on demand. External media keeps notion-to-md's default output.
function mediaUrl(blockId: string, lastEditedTime: string) {
  return `/api/notion-image/block/${blockId}/${Date.parse(lastEditedTime)}`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

n2m.setCustomTransformer("image", block => {
  if (!isFullBlock(block) || block.type !== "image" || block.image.type !== "file") return false;
  const caption = escapeHtml(block.image.caption.map(part => part.plain_text).join("").trim());
  return `<figure class="notion-media"><img src="${mediaUrl(block.id, block.last_edited_time)}" alt="${caption}" loading="lazy" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
});

n2m.setCustomTransformer("video", block => {
  if (!isFullBlock(block) || block.type !== "video" || block.video.type !== "file") return false;
  const caption = escapeHtml(block.video.caption.map(part => part.plain_text).join("").trim());
  return `<figure class="notion-media"><video src="${mediaUrl(block.id, block.last_edited_time)}" controls preload="metadata"></video>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
});

export type Post = {
  id: string;
  title: string;
  slug: string;
  date: string;
  summary: string;
  lastEditedTime: string;
};

export function formatLastEdited(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const datePart = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Toronto",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: "America/Toronto",
    }).format(d);
    return `Last edited on ${datePart} at ${timePart}`;
  } catch {
    return "";
  }
}

export function fixToggleBlocks(blocks: MdBlock[]): MdBlock[] {
  for (const block of blocks) {
    if (block.children && block.children.length > 0) {
      if (block.type && typeof block.type === "string" && block.type.startsWith("heading_")) {
        const level = block.type.replace("heading_", "") || "2";
        const cleanTitle = (block.parent || "").replace(/^#{1,6}\s+/, "").trim();
        block.type = "toggle";
        block.parent = `<h${level}>${cleanTitle}</h${level}>`;
      }
      fixToggleBlocks(block.children);
    }
  }
  return blocks;
}

export function normalizeNotionMarkdown(md: string): string {
  if (!md) return "";
  return md
    .replace(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*/g, (match, title) => {
      return `<details class="notion-toggle">\n<summary>${title.trim()}</summary>\n\n`;
    })
    .replace(/<\/details>/g, "\n\n</details>\n\n");
}

// Converts a Notion page body to the markdown both blog posts and projects render.
export async function pageMarkdown(pageId: string): Promise<string> {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  fixToggleBlocks(mdBlocks);
  const mdString = n2m.toMarkdownString(mdBlocks);
  return normalizeNotionMarkdown(typeof mdString === "string" ? mdString : (mdString.parent || ""));
}

function sameId(a: string | undefined, b: string | undefined) {
  return !!a && !!b && a.replace(/-/g, "") === b.replace(/-/g, "");
}

export function isPublishedPost(page: PageObjectResponse): boolean {
  const published = page.properties.Published;
  const parent = page.parent.type === "database_id" ? page.parent.database_id : undefined;
  return !page.archived && !page.in_trash && published?.type === "checkbox" && published.checkbox === true
    && sameId(parent, process.env.NOTION_DATABASE_ID);
}

function toPost(page: PageObjectResponse): Post {
  const { Title, Slug, Date: date, Summary } = page.properties;
  return {
    id: page.id,
    title: Title?.type === "title" ? Title.title.map(part => part.plain_text).join("") || "Untitled" : "Untitled",
    slug: Slug?.type === "rich_text" ? Slug.rich_text.map(part => part.plain_text).join("") || page.id : page.id,
    date: date?.type === "date" ? date.date?.start || "" : "",
    summary: Summary?.type === "rich_text" ? Summary.rich_text.map(part => part.plain_text).join("") : "",
    lastEditedTime: page.last_edited_time,
  };
}

export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("content");
  // Expired on demand by /api/revalidate so unpublished posts disappear immediately.
  cacheTag("posts");
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return [];

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  return response.results.filter(isFullPage).filter(isPublishedPost).map(toPost);
}

export async function getPostBySlug(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("posts");
  // Use the exact same slug matching logic as the index.
  const postInfo = (await getPosts()).find((p) => p.slug === slug);
  if (!postInfo) return null;

  // Confirm the page itself is still published before loading its body.
  // A database query can lag behind a just-updated checkbox.
  const page = await notion.pages.retrieve({ page_id: postInfo.id });
  if (!isFullPage(page) || !isPublishedPost(page)) return null;

  return { post: postInfo, markdown: await pageMarkdown(postInfo.id) };
}
