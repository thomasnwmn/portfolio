import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import { connection } from "next/server";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const n2m = new NotionToMarkdown({ notionClient: notion });

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

export function fixToggleBlocks(blocks: any[]): any[] {
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

function isPublished(page: PageObjectResponse): boolean {
  const published = page.properties.Published;
  return !page.archived && !page.in_trash && published?.type === "checkbox" && published.checkbox === true;
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
  // Publication state must be checked at request time, never from an ISR page.
  await connection();
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

  return response.results.filter(isFullPage).filter(isPublished).map(toPost);
}

export async function getPostBySlug(slug: string) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return null;

  // Fetch all published posts to use the exact same slug matching logic
  const posts = await getPosts();
  const postInfo = posts.find((p) => p.slug === slug);

  if (!postInfo) {
    return null;
  }

  // Confirm the page itself is still published before loading its body.
  // A database query can lag behind a just-updated checkbox.
  const page = await notion.pages.retrieve({ page_id: postInfo.id });
  if (!isFullPage(page) || !isPublished(page)) return null;

  const mdBlocks = await n2m.pageToMarkdown(postInfo.id);
  fixToggleBlocks(mdBlocks);
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    post: postInfo,
    markdown: normalizeNotionMarkdown(typeof mdString === "string" ? mdString : (mdString.parent || "")),
  };
}
