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
};

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
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    post: postInfo,
    markdown: typeof mdString === "string" ? mdString : (mdString.parent || ""),
  };
}
