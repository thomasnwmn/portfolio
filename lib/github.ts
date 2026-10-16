import { cacheLife } from "next/cache";

export const GITHUB_USERNAME = "thomasnwmn";

export type ContributionDay = { date: string; count: number };
export type Contributions = { total: number; days: ContributionDay[] };

// Same public source react-github-calendar reads (it scrapes the GitHub
// profile), fetched on the server so the page ships plain data.
export async function getContributions(): Promise<Contributions | null> {
  "use cache";
  cacheLife("hours");
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`);
    if (!response.ok) return null;
    const data = await response.json() as { total?: { lastYear?: number }; contributions?: ContributionDay[] };
    const days = (data.contributions ?? []).map(({ date, count }) => ({ date, count }));
    if (!days.length) return null;
    return {
      total: data.total?.lastYear ?? days.reduce((sum, day) => sum + day.count, 0),
      days,
    };
  } catch {
    return null;
  }
}
