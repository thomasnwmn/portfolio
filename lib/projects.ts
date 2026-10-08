import { unstable_cache } from "next/cache";
import { isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, n2m } from "./notion";

export type Project = {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  discipline: string;
  summary: string;
  stack: string[];
  // Proxied through /api/notion-image so Notion's expiring signed URLs never leak into the cache.
  image: string | null;
  // Omit to disable the widget and all repository requests.
  repositoryBrowser?: { url: string; branch?: string; rootPath?: string };
  sourceUrl?: string;
  liveUrl?: string;
  fallbackMarkdown?: string;
};

// Notion edits appear on the site within this many seconds.
export const PROJECTS_REVALIDATE = 300;

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

const KNOWN_LOCAL_IMAGES = [
  "pantry-app",
  "plant-watering-system",
  "radar",
  "spriteforge",
  "wall-avoiding-robot",
  "wuwa-builds",
];

const FALLBACK_PROJECTS: (Omit<Project, "id" | "number"> & { fallbackMarkdown: string })[] = [
  {
    slug: "pantry-app",
    title: "Pantry App",
    category: "Software",
    discipline: "Full-stack / SaaS",
    summary: "A live subscription web app for tracking pantry stock and expiry dates, with scheduled email alerts and Stripe billing.",
    stack: ["Next.js", "Supabase", "PostgreSQL", "Stripe", "Cron jobs"],
    image: "/projects/pantry-app.jpg",
    liveUrl: "https://pantry.thomasnewman.ca",
    fallbackMarkdown: `> 💡 **Role:** Solo. I designed, built, deployed, and run it. It's live with paying subscribers.

## Why I built it
Food in my kitchen kept expiring before I remembered it was there. I wanted something faster than a spreadsheet that would tell me what's running low or about to expire without me having to check.

## What it does
- Track items, quantities, and expiry dates per pantry
- Email alerts when stock drops below a threshold or an item is close to expiring
- Free and paid tiers, with subscriptions handled by **Stripe**

## How it's built
\`\`\`flow
Next.js UI -> Supabase (Postgres + Auth) -> Scheduled jobs -> Email alerts
\`\`\`
- **Data isolation:** Supabase Row-Level Security policies scope every row to its owner, so access control lives in the database and not only in the client.
- **Alerts:** scheduled jobs scan for low-stock and soon-to-expire items and send digest emails.
- **Billing:** Stripe Checkout and webhooks keep each user's subscription status in sync with their account.

## Challenges
- Keeping Stripe webhook state and database state consistent
- Writing RLS policies that are secure without making queries slow or awkward

## What's next
- Barcode scanning, shared households, and shopping lists generated from low stock.`,
  },
  {
    slug: "radar",
    title: "Arduino Radar",
    category: "Embedded systems",
    discipline: "Instrumentation / data visualization",
    summary: "A servo-swept ultrasonic radar that streams angle and distance over serial into a live Streamlit polar plot.",
    stack: ["Arduino", "C++", "Python", "pyserial", "Streamlit"],
    image: "/projects/radar.jpg",
    sourceUrl: "https://github.com/thomasnwmn/radar",
    fallbackMarkdown: `> 💡 **Role:** Solo personal project: hardware, firmware, and visualization.

## How it works
\`\`\`flow
Servo sweep -> Ultrasonic ping -> Arduino -> Serial -> Python / Streamlit
\`\`\`
The Arduino steps a servo across the arc. At each angle it fires the ultrasonic sensor, converts echo time to distance, shows the reading on the LCD, and prints an \`angle,distance\` line over serial. On the computer, a Python script reads the stream with \`pyserial\` and redraws a polar plot in Streamlit.

## Challenges
- Filtering noisy or zero readings from the ultrasonic sensor
- Keeping the Streamlit polar plot responsive while serial data arrives continuously

## What I'd improve
- Data smoothing, an object fade trail, and higher refresh rates.`,
  },
  {
    slug: "plant-watering-system",
    title: "Autonomous Plant-Watering System",
    category: "Embedded systems",
    discipline: "Sensing / control systems",
    summary: "A soil-moisture controller that switches between three watering levels and plots readings on a live Java chart.",
    stack: ["Java", "I2C", "Arduino (Firmata)", "Sensors"],
    image: "/projects/plant-watering-system.jpg",
    fallbackMarkdown: `> 💡 **Role:** Solo course project.

## The problem
One fixed watering amount either drowns a plant that's slightly dry or under-waters one that's very dry. I wanted the response to scale with how dry the soil actually is.

## Three-state control
| Soil reading | State | Action |
|---|---|---|
| Wet | Idle | No pump |
| Slightly dry | Top-up | Small pump |
| Very dry | Recover | Big pump |

\`\`\`flow
Moisture sensor -> I2C -> Java state machine -> Small / big pump
\`\`\`

## Live monitoring
Moisture readings are plotted on a live Java chart, letting you monitor real-time soil response to watering events.

## Challenges
- Threshold tuning to prevent oscillation right at state boundaries
- Sensor calibration across varying environmental conditions`,
  },
  {
    slug: "wall-avoiding-robot",
    title: "Automatic Wall-Avoiding Robot",
    category: "Embedded systems",
    discipline: "Robotics / embedded control",
    summary: "Team-built Arduino robot. I wrote the control code that uses ultrasonic ranging to stop, turn, and steer around walls.",
    stack: ["C++", "Arduino", "Ultrasonic sensor", "DC motors"],
    image: "/projects/wall-avoiding-robot.jpg",
    fallbackMarkdown: `> 💡 **Role:** Team project. I wrote most of the Arduino control code.

## Behaviour
\`\`\`flow
Ultrasonic ping -> Distance check -> Stop & turn -> Drive forward
\`\`\`
The robot drives forward while checking distance with an ultrasonic sensor. When an obstacle is detected within threshold distance, it stops, executes a turning routine, verifies clearance, and resumes driving forward.

## What I learned
- Hardware sensor readings contain noise that must be filtered before triggering physical state transitions
- Open-loop DC motor speeds drift; maintaining straight motion requires calibration`,
  },
  {
    slug: "spriteforge",
    title: "SpriteForge",
    category: "Software",
    discipline: "Systems programming / game engine",
    summary: "A 2D game engine in C with an ECS core, fixed-timestep simulation, AABB physics, and embedded Lua scripting.",
    stack: ["C", "SDL2", "Lua", "CMake"],
    image: "/projects/spriteforge.jpg",
    sourceUrl: "https://github.com/thomasnwmn/spriteforge",
    fallbackMarkdown: `> 💡 **Role:** Solo. Engine architecture, all subsystems, and the sample scene.

## Architecture
\`\`\`flow
Input / events -> Lua scripts -> ECS systems -> Physics (AABB) -> SDL2 render
\`\`\`
- **ECS:** entities are IDs, components are plain data, and systems iterate over the components they need.
- **Fixed timestep:** simulation runs at a fixed rate with an accumulator, separate from rendering, so physics behaves consistently regardless of frame rate.
- **Collision:** AABB overlap tests with resolution along the axis of least penetration.
- **Event bus:** subsystems publish and subscribe to messages instead of calling each other directly.
- **Lua scripting:** gameplay behaviour lives in Lua scripts bound to entities, so it can change without recompiling the engine.

## Challenges
- Designing a clean C ↔ Lua binding layer
- Explicit memory ownership and cache-friendly layout in C`,
  },
  {
    slug: "wuwa-builds",
    title: "WUWA Builds",
    category: "Software",
    discipline: "Full-stack / structured game data",
    summary: "A build tracker for Wuthering Waves with accounts, stat scoring, and shareable build pages. Screenshot OCR import is in progress.",
    stack: ["Next.js", "Supabase", "Python", "OCR"],
    image: "/projects/wuwa-builds.jpg",
    sourceUrl: "https://github.com/thomasnwmn/wuwabuilds",
    liveUrl: "https://wuwa.thomasnewman.ca",
    repositoryBrowser: { url: "https://github.com/thomasnwmn/wuwabuilds" },
    fallbackMarkdown: `> 💡 **Role:** Solo. Built for my friend group. **Status:** live; screenshot import in progress.

## Features
- **Accounts:** each friend manages their own builds
- **Stat scoring:** rates echo substats so builds can be compared
- **Share links:** a public page for any build

\`\`\`flow
Screenshot -> Python OCR (WIP) -> Supabase -> Next.js build pages
\`\`\`

## In progress: screenshot import
Typing in echo stats by hand is tedious, so I'm building a Python pipeline to extract them directly from in-game screenshots.

### Technical Approach
- Normalize screenshots to a standard resolution
- Crop stat regions, apply grayscale and adaptive thresholding via **OpenCV**
- Extract values using **Tesseract** single-line mode with character whitelisting
- Fuzzy-match stat names against known dictionaries
- Validate numbers against game roll bounds before committing to Supabase`,
  },
];

function toProject(page: PageObjectResponse, index: number): Project {
  const { properties } = page;
  const category = properties.Category;
  const stack = properties.Stack;
  const repoUrl = url(properties, "Repo URL");
  const slug = text(properties, "Slug") || page.id;
  const localFallback = KNOWN_LOCAL_IMAGES.includes(slug) ? `/projects/${slug}.jpg` : null;

  return {
    id: page.id,
    slug,
    number: String(index + 1).padStart(2, "0"),
    title: text(properties, "Title") || "Untitled project",
    category: category?.type === "select" && category.select ? category.select.name : "Software",
    discipline: text(properties, "Discipline"),
    summary: text(properties, "Summary"),
    stack: stack?.type === "multi_select" ? stack.multi_select.map(tag => tag.name) : [],
    // The edit timestamp versions the URL, so replacing a cover busts every cache layer.
    // If no cover is uploaded in Notion yet, fall back to local public image if available.
    image: page.cover ? `/api/notion-image/cover/${page.id}/${Date.parse(page.last_edited_time)}` : localFallback,
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
  if (!databaseId) {
    return FALLBACK_PROJECTS.map((project, index) => ({
      ...project,
      id: project.slug,
      number: String(index + 1).padStart(2, "0"),
    }));
  }
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
    if (published.length === 0) {
      return FALLBACK_PROJECTS.map((project, index) => ({
        ...project,
        id: project.slug,
        number: String(index + 1).padStart(2, "0"),
      }));
    }
    return published.map(toProject);
  } catch (error) {
    console.warn("Could not query Notion projects database, falling back to local data:", error);
    return FALLBACK_PROJECTS.map((project, index) => ({
      ...project,
      id: project.slug,
      number: String(index + 1).padStart(2, "0"),
    }));
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
  let markdown = project.fallbackMarkdown || "";
  const databaseId = projectsDatabaseId();
  if (databaseId && project.id && project.id !== project.slug) {
    try {
      const liveMd = await getCachedProjectMarkdown(project.id);
      if (liveMd.trim()) {
        markdown = liveMd;
      }
    } catch {
      // Keep fallback markdown
    }
  }
  return { project, markdown };
}
