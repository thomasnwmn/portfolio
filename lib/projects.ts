import { unstable_cache } from "next/cache";
import { isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, n2m, normalizeNotionMarkdown, fixToggleBlocks } from "./notion";

export type Project = {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  discipline: string;
  summary: string;
  stack: string[];
  image: string | null;
  repositoryBrowser?: { url: string; branch?: string; rootPath?: string };
  sourceUrl?: string;
  liveUrl?: string;
};

// Revalidate project data from Notion
export const PROJECTS_REVALIDATE = 60;

type Properties = PageObjectResponse["properties"];

function text(properties: Properties, name: string) {
  const property = properties[name];
  if (property?.type === "title") return property.title.map(part => part.plain_text).join("").trim();
  if (property?.type === "rich_text") return property.rich_text.map(part => part.plain_text).join("").trim();
  return "";
}

function url(properties: Properties, name: string) {
  const property = properties[name];
  return property?.type === "url" && property.url ? property.url : undefined;
}

export function projectsDatabaseId() {
  return process.env.NOTION_PROJECTS_DATABASE_ID;
}

export function isPublishedProject(page: PageObjectResponse) {
  const published = page.properties.Published;
  const parent = page.parent.type === "database_id" ? page.parent.database_id.replace(/-/g, "") : "";
  return !page.archived && !page.in_trash && published?.type === "checkbox" && published.checkbox
    && parent === projectsDatabaseId()?.replace(/-/g, "");
}

function toProject(page: PageObjectResponse, index: number): Project {
  const { properties } = page;
  const category = properties.Category;
  const stack = properties.Stack;
  const repoUrl = url(properties, "Repo URL");
  const slug = text(properties, "Slug") || page.id;

  return {
    id: page.id,
    slug,
    number: String(index + 1).padStart(2, "0"),
    title: text(properties, "Title") || "Untitled project",
    category: category?.type === "select" && category.select ? category.select.name : "Software",
    discipline: text(properties, "Discipline"),
    summary: text(properties, "Summary"),
    stack: stack?.type === "multi_select" ? stack.multi_select.map(tag => tag.name) : [],
    image: page.cover ? `/api/notion-image/cover/${page.id}/${Date.parse(page.last_edited_time)}` : null,
    repositoryBrowser: repoUrl ? {
      url: repoUrl,
      branch: text(properties, "Repo Branch") || undefined,
      rootPath: text(properties, "Repo Path") || undefined,
    } : undefined,
    sourceUrl: url(properties, "Source URL"),
    liveUrl: url(properties, "Live URL"),
  };
}

async function queryProjects(): Promise<Project[]> {
  const databaseId = projectsDatabaseId();
  if (!databaseId) return [];

  try {
    const pages: PageObjectResponse[] = [];
    let cursor: string | undefined;
    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "Order", direction: "ascending" }],
        start_cursor: cursor,
      });
      pages.push(...response.results.filter(isFullPage));
      cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);

    const published = pages.filter(isPublishedProject);
    return published.map(toProject);
  } catch (error) {
    console.warn("Could not query Notion projects database:", error);
    return [];
  }
}

export const getProjects = unstable_cache(queryProjects, ["notion-projects"], { revalidate: PROJECTS_REVALIDATE, tags: ["projects"] });

export async function getProject(slug: string) {
  return (await getProjects()).find(project => project.slug === slug);
}

async function fetchProjectMarkdown(pageId: string): Promise<string> {
  const databaseId = projectsDatabaseId();
  if (!databaseId) return "";
  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    fixToggleBlocks(mdBlocks);
    const mdString = n2m.toMarkdownString(mdBlocks);
    return typeof mdString === "string" ? mdString : (mdString.parent || "");
  } catch {
    return "";
  }
}

const getCachedProjectMarkdown = unstable_cache(fetchProjectMarkdown, ["notion-project-md"], { revalidate: PROJECTS_REVALIDATE, tags: ["projects"] });

export async function getProjectContent(slug: string) {
  const project = await getProject(slug);
  if (!project) return null;
  const databaseId = projectsDatabaseId();
  let markdown = "";
  if (databaseId && project.id) {
    try {
      const liveMd = await getCachedProjectMarkdown(project.id);
      if (liveMd.trim()) {
        markdown = liveMd;
      }
    } catch {
      markdown = "";
    }
  }
  return { project, markdown: normalizeNotionMarkdown(markdown) };
}
