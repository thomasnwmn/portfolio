import { Client } from "@notionhq/client";
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

  return response.results.map((page: any) => {
    return {
      id: page.id,
      title: page.properties.Title?.title[0]?.plain_text || "Untitled",
      slug: page.properties.Slug?.rich_text[0]?.plain_text || page.id,
      date: page.properties.Date?.date?.start || "",
      summary: page.properties.Summary?.rich_text[0]?.plain_text || "",
    };
  });
}

export async function getPostBySlug(rawSlug: string) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return null;

  const slug = decodeURIComponent(rawSlug);

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Slug",
      rich_text: {
        equals: slug,
      },
    },
  });

  if (response.results.length === 0) {
    return null;
  }

  const page = response.results[0];
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    post: {
      id: page.id,
      title: (page as any).properties.Title?.title[0]?.plain_text || "Untitled",
      date: (page as any).properties.Date?.date?.start || "",
      summary: (page as any).properties.Summary?.rich_text[0]?.plain_text || "",
    },
    markdown: mdString.parent || mdString,
  };
}
