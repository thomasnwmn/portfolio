"use client";

import type { Project } from "@/lib/projects";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, FileCode2, Folder } from "lucide-react";

type Entry = { name: string; path: string; type: "directory" | "file" };
type Result = { type: "directory"; entries: Entry[]; truncated: boolean } | { type: "file"; content: string } | { type: "unsupported"; message: string };
type Read = (path: string) => Promise<Result>;

function Directory({ path, read, selected, onSelect }: { path: string; read: Read; selected: string | null; onSelect: (path: string) => void }) {
  const [data, setData] = useState<Extract<Result, { type: "directory" }> | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    read(path).then(result => {
      if (result.type !== "directory") throw new Error("Could not load this folder.");
      if (active) setData(result);
    }).catch(reason => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [path, read, attempt]);
  if (error) return <div role="alert" className="p-3 text-xs text-paper-1">{error} <button className="underline" onClick={() => { setError(""); setAttempt(a => a + 1); }}>Retry</button></div>;
  if (!data) return <p role="status" className="p-3 text-xs text-paper-2">Loading files…</p>;
  return <ul className="space-y-1">
    {data.entries.map(entry => <li key={entry.path}>
      <button className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-white/5 ${selected === entry.path ? "bg-white/10 text-white" : "text-paper-1"}`}
        aria-expanded={entry.type === "directory" ? open.has(entry.path) : undefined}
        aria-current={selected === entry.path ? "true" : undefined}
        onClick={() => entry.type === "file" ? onSelect(entry.path) : setOpen(previous => {
          const next = new Set(previous); if (next.has(entry.path)) next.delete(entry.path); else next.add(entry.path); return next;
        })}>
        {entry.type === "directory" ? <><ChevronRight size={12} className={`shrink-0 ${open.has(entry.path) ? "rotate-90" : ""}`} /><Folder size={14} className="shrink-0" /></> : <FileCode2 size={14} className="ml-5 shrink-0" />}
        <span className="break-all">{entry.name}</span>
      </button>
      {entry.type === "directory" && open.has(entry.path) && <div className="ml-3 border-l border-hairline pl-2"><Directory path={entry.path} read={read} selected={selected} onSelect={onSelect} /></div>}
    </li>)}
    {!data.entries.length && <li className="p-3 text-xs text-paper-2">Empty folder.</li>}
    {data.truncated && <li className="p-3 text-xs text-paper-2">Showing the first 1,000 entries. View the complete folder on GitHub.</li>}
  </ul>;
}

export default function RepositoryBrowser({ slug, config }: { slug: string; config: NonNullable<Project["repositoryBrowser"]> }) {
  const [read] = useState<Read>(() => {
    const cache = new Map<string, Promise<Result>>();
    return (path: string) => {
      let result = cache.get(path);
      if (!result) {
        result = fetch(`/api/repositories/${encodeURIComponent(slug)}?path=${encodeURIComponent(path)}`).then(async response => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to load this file.");
          return data as Result;
        }).catch(error => { cache.delete(path); throw error; });
        cache.set(path, result);
      }
      return result;
    };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  async function select(path: string) {
    const request = ++sequence.current;
    setSelected(path); setFile(null); setError("");
    try { const data = await read(path); if (request === sequence.current) setFile(data); }
    catch (reason) { if (request === sequence.current) setError(reason instanceof Error ? reason.message : "Unable to load file."); }
  }
  return <div className="grid overflow-hidden border border-hairline bg-ink-1 md:grid-cols-[260px_minmax(0,1fr)]">
    <nav aria-label="Repository files" className="max-h-72 overflow-auto border-b border-hairline p-3 md:max-h-[560px] md:border-r md:border-b-0"><Directory path="" read={read} selected={selected} onSelect={select} /></nav>
    <div className="min-w-0">
      <div className="border-b border-hairline px-5 py-3 font-mono text-xs break-all text-paper-1">{selected || "Source preview"}</div>
      {!selected && <p className="p-8 text-sm text-paper-2">Choose a file to explore the source code.</p>}
      {selected && !file && !error && <p role="status" className="p-8 text-sm text-paper-2">Loading file…</p>}
      {error && <div role="alert" className="p-8 text-sm text-paper-1">{error} <button className="underline" onClick={() => selected && select(selected)}>Retry</button></div>}
      {selected && <a className="mx-5 my-3 inline-block text-xs text-paper-2 underline" href={`${config.url.replace(/\/$/, "")}/blob/${encodeURIComponent(config.branch || "HEAD")}/${[config.rootPath, selected].filter(Boolean).join("/").split("/").map(encodeURIComponent).join("/")}`} target="_blank" rel="noreferrer">Open file on GitHub ↗</a>}
      {file?.type === "unsupported" && <p className="p-8 text-sm text-paper-2">{file.message}</p>}
      {file?.type === "file" && <pre tabIndex={0} aria-label={selected || "File contents"} className="max-h-[520px] overflow-auto p-5 font-mono text-xs leading-6 text-paper-1"><code>{file.content}</code></pre>}
    </div>
  </div>;
}
