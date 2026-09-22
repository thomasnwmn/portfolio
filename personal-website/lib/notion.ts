import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";

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

  return response.results.filter(isFullPage).map(toPost);
}

export async function getPostBySlug(rawSlug: string) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return null;

  const slug = rawSlug;

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "Published", checkbox: { equals: true } },
      ],
    },
  });

  if (response.results.length === 0) {
    return null;
  }

  const page = response.results[0];
  if (!isFullPage(page)) return null;
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    post: toPost(page),
    markdown: typeof mdString === "string" ? mdString : (mdString.parent || ""),
  };
}
