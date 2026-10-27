import { bundledLanguages, codeToTokens, type BundledLanguage } from "shiki";

// One highlighted line: [text, colour] pairs. Colour is omitted for plain text.
export type HighlightedLine = [string, string?][];

const ALIASES: Record<string, string> = {
  ino: "cpp", h: "c", hpp: "cpp", cc: "cpp", mjs: "javascript", cjs: "javascript",
  yml: "yaml", sh: "bash", zsh: "bash", env: "dotenv", gitignore: "shellscript", txt: "text",
};
const FILENAMES: Record<string, string> = { Dockerfile: "docker", Makefile: "makefile", CMakeLists: "cmake" };

export function languageOf(path: string) {
  const name = path.split("/").pop() ?? "";
  if (FILENAMES[name.split(".")[0]]) return FILENAMES[name.split(".")[0]];
  const extension = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  const language = ALIASES[extension] ?? extension;
  return language in bundledLanguages ? language : "text";
}

// Highlighting runs on the server so the page never ships the grammars.
// Very large files stay plain to keep responses quick.
export async function highlight(code: string, path: string): Promise<{ language: string; lines: HighlightedLine[] }> {
  const language = languageOf(path);
  if (language === "text" || code.length > 120_000) {
    return { language, lines: code.split("\n").map(line => [[line]]) };
  }
  const { tokens } = await codeToTokens(code, { lang: language as BundledLanguage, theme: "github-dark-default" });
  return { language, lines: tokens.map(line => line.map(token => [token.content, token.color])) };
}
