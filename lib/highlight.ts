import { bundledLanguages, bundledLanguagesInfo, codeToTokens, type BundledLanguage } from "shiki";

// One highlighted line: [text, colour] pairs. Colour is omitted for plain text.
export type HighlightedLine = [string, string?][];

// The grammar comes from the file name. Extensions Shiki doesn't know, or reads
// as another language (".v" is V to Shiki, Verilog here), are mapped first.
const ALIASES: Record<string, string> = {
  // Hardware: Verilog/SystemVerilog, VHDL, and the Tcl-based Quartus/Vivado constraint files.
  v: "verilog", vh: "verilog", sv: "system-verilog", svh: "system-verilog", vhd: "vhdl",
  qsf: "tcl", sdc: "tcl", xdc: "tcl", s: "asm",
  // C, C++ and Arduino sketches.
  ino: "cpp", pde: "cpp", h: "c", hpp: "cpp", hh: "cpp", cc: "cpp", cxx: "cpp",
  mjs: "javascript", cjs: "javascript", mts: "typescript", cts: "typescript",
  yml: "yaml", sh: "bash", zsh: "bash", env: "dotenv", gitignore: "shellscript", svg: "xml", txt: "text",
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
export async function highlight(code: string, path: string): Promise<{ language: string; languageName: string; lines: HighlightedLine[] }> {
  const language = languageOf(path);
  const languageName = bundledLanguagesInfo.find(info => info.id === language || info.aliases?.includes(language))?.name ?? "Plain text";
  if (language === "text" || code.length > 120_000) {
    return { language, languageName, lines: code.split("\n").map(line => [[line]]) };
  }
  const { tokens } = await codeToTokens(code, { lang: language as BundledLanguage, theme: "github-dark-default" });
  return { language, languageName, lines: tokens.map(line => line.map(token => [token.content, token.color])) };
}
