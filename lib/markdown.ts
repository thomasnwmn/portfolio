export type Heading = { id: string; text: string; level: 2 | 3 };

export function slugify(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}

// Strips inline markdown/HTML so headings read cleanly in the table of contents.
function inlineText(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`~]/g, "").trim();
}

function withoutCode(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

const CODE = /(```[\s\S]*?```)/g;
const MARKDOWN_HEADING = /^(#{1,6})(?=\s)/gm;
const HTML_HEADING = /<(\/?)h([1-6])>/g;

// The page title is the only h1, so Notion's Heading 1 blocks become sections
// (h2). A page written entirely in Heading 1 shifts every level down one, so
// its ## nests under them; a page that already uses ## only lifts its h1s.
export function normalizeHeadings(markdown: string) {
  const prose = withoutCode(markdown);
  if (!/^#\s/m.test(prose) && !/<h1>/.test(prose)) return markdown;
  const shift = /^##\s/m.test(prose) || /<h2>/.test(prose) ? (level: number) => Math.max(level, 2) : (level: number) => Math.min(level + 1, 6);
  return markdown.split(CODE).map((part, index) => index % 2 ? part : part
    .replace(MARKDOWN_HEADING, hashes => "#".repeat(shift(hashes.length)))
    .replace(HTML_HEADING, (_, slash: string, level: string) => `<${slash}h${shift(Number(level))}>`)
  ).join("");
}

// Collects h2/h3 headings, including Notion toggle headings (<summary><h2>…).
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const pattern = /^(#{2,3})\s+(.+)$|<summary><h([23])>([\s\S]*?)<\/h\3>/gm;
  for (const match of withoutCode(normalizeHeadings(markdown)).matchAll(pattern)) {
    const level = (match[1] ? match[1].length : Number(match[3])) as 2 | 3;
    const text = inlineText(match[2] ?? match[4] ?? "");
    if (text) headings.push({ id: slugify(text), text, level });
  }
  return headings;
}

export function readingMinutes(markdown: string) {
  const words = inlineText(withoutCode(markdown)).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: string) {
  if (!date) return "";
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  if (isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(parsed);
}
