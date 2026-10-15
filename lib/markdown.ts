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

// Collects h2/h3 headings, including Notion toggle headings (<summary><h2>…).
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const pattern = /^(#{2,3})\s+(.+)$|<summary><h([23])>([\s\S]*?)<\/h\3>/gm;
  for (const match of withoutCode(markdown).matchAll(pattern)) {
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
