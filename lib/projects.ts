import { cacheLife, cacheTag } from "next/cache";
import { isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, pageMarkdown, formatLastEdited } from "./notion";

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
  lastEditedTime: string;
};

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

// Reads github.com/owner/repo, optionally with /tree/<branch>/<folder>, into
// the repository browser's config. Anything else is not a browsable repo.
function githubRepository(link: string | undefined) {
  const match = link && /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/tree\/([^/]+)(?:\/(.+?))?)?\/?(?:[?#].*)?$/.exec(link);
  if (!match) return undefined;
  const [, owner, repo, branch, path] = match;
  return { url: `https://github.com/${owner}/${repo}`, branch: branch && decodeURIComponent(branch), rootPath: path && decodeURIComponent(path) };
}

function toProject(page: PageObjectResponse, index: number): Project {
  const { properties } = page;
  const category = properties.Category;
  const stack = properties.Stack;
  const repoUrl = url(properties, "Repo URL");
  const sourceUrl = url(properties, "Source URL");
  const slug = text(properties, "Slug") || page.id;
  // "Repo URL" (with its optional branch and path) wins; otherwise any GitHub
  // source link turns the browser on with no extra setup.
  const fromSource = githubRepository(sourceUrl);

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
    } : fromSource,
    sourceUrl,
    liveUrl: url(properties, "Live URL"),
    lastEditedTime: page.last_edited_time,
  };
}

export { formatLastEdited };

// Lifetime comes from the "content" profile in next.config.ts; /api/revalidate
// can expire the "projects" tag on demand.
export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("content");
  cacheTag("projects");
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

export async function getProject(slug: string) {
  return (await getProjects()).find(project => project.slug === slug);
}

export async function getProjectContent(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("projects");
  const project = await getProject(slug);
  if (!project) return null;
  let markdown = "";
  try {
    markdown = await pageMarkdown(project.id);
  } catch (error) {
    console.warn(`Could not load Notion content for project "${slug}":`, error);
  }
  return { project, markdown };
}
