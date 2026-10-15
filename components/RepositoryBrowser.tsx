"use client";

import type { Project } from "@/lib/projects";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Alert } from "./arc/alert/alert";
import { Button } from "./arc/button/button";
import { CodeBlock } from "./arc/code-block/code-block";
import { ScrollArea } from "./arc/scroll-area/scroll-area";
import { TreeView, type TreeNode } from "./arc/tree-view/tree-view";

type Entry = { name: string; path: string; type: "directory" | "file" };
type Result = { type: "directory"; entries: Entry[]; truncated: boolean } | { type: "file"; content: string } | { type: "unsupported"; message: string };
type Read = (path: string) => Promise<Result>;
type Folder = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; entries: Entry[]; truncated: boolean };

// Folders load when they open, so an unloaded folder carries one status row as
// its child. TreeView treats any node with children as an expandable folder.
const STATUS = "\u0000status:";

function buildNodes(path: string, folders: Map<string, Folder>): TreeNode[] {
  const folder = folders.get(path);
  if (!folder || folder.status === "loading") return [{ id: `${STATUS}${path}`, label: "Loading files…" }];
  if (folder.status === "error") return [{ id: `${STATUS}${path}`, label: "Couldn’t load. Close and reopen to retry." }];
  if (!folder.entries.length) return [{ id: `${STATUS}${path}`, label: "Empty folder" }];
  const nodes = folder.entries.map<TreeNode>(entry => entry.type === "directory"
    ? { id: entry.path, label: entry.name, children: buildNodes(entry.path, folders) }
    : { id: entry.path, label: entry.name });
  if (folder.truncated) nodes.push({ id: `${STATUS}${path}:truncated`, label: "First 1,000 entries shown" });
  return nodes;
}

function languageOf(path: string) {
  const extension = /\.([\w+-]+)$/.exec(path)?.[1]?.toLowerCase();
  return extension || "text";
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
  const [folders, setFolders] = useState<Map<string, Folder>>(() => new Map([["", { status: "loading" }]]));
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const sequence = useRef(0);

  const fetchFolder = useCallback((path: string) => {
    read(path).then(result => {
      if (result.type !== "directory") throw new Error("Could not load this folder.");
      setFolders(previous => new Map(previous).set(path, { status: "ready", entries: result.entries, truncated: result.truncated }));
    }).catch((reason: Error) => {
      setFolders(previous => new Map(previous).set(path, { status: "error", message: reason.message }));
    });
  }, [read]);

  useEffect(() => { fetchFolder(""); }, [fetchFolder]);

  function loadFolder(path: string) {
    setFolders(previous => new Map(previous).set(path, { status: "loading" }));
    fetchFolder(path);
  }

  function onExpandedChange(next: string[]) {
    for (const path of next) {
      const folder = folders.get(path);
      if (!expanded.includes(path) && (!folder || folder.status === "error")) loadFolder(path);
    }
    setExpanded(next);
  }

  async function select(path: string) {
    const request = ++sequence.current;
    setSelected(path); setFile(null); setError("");
    try { const data = await read(path); if (request === sequence.current) setFile(data); }
    catch (reason) { if (request === sequence.current) setError(reason instanceof Error ? reason.message : "Unable to load file."); }
  }

  const files = new Set([...folders.values()].flatMap(folder => folder.status === "ready" ? folder.entries.filter(entry => entry.type === "file").map(entry => entry.path) : []));
  const root = folders.get("");
  const githubUrl = selected && `${config.url.replace(/\/$/, "")}/blob/${encodeURIComponent(config.branch || "HEAD")}/${[config.rootPath, selected].filter(Boolean).join("/").split("/").map(encodeURIComponent).join("/")}`;

  return <div className="repo-browser">
    <nav aria-label="Repository files" className="repo-tree">
      {root?.status === "error" ? (
        <Alert tone="danger" title="Couldn’t load the repository">
          {root.message} <Button size="sm" variant="secondary" className="mt-3" onClick={() => loadFolder("")}>Retry</Button>
        </Alert>
      ) : (
        <ScrollArea viewportClassName="repo-tree-scroll" label="Repository files">
          <TreeView aria-label="Repository files" nodes={buildNodes("", folders)} expandedIds={expanded} onExpandedChange={onExpandedChange} onSelect={node => { if (files.has(node.id)) select(node.id); }} />
        </ScrollArea>
      )}
    </nav>
    <div className="min-w-0">
      {!selected && <p className="repo-hint">Choose a file to explore the source code.</p>}
      {selected && !file && !error && <p role="status" className="repo-hint">Loading {selected}…</p>}
      {selected && error && (
        <Alert tone="danger" title="Couldn’t load this file">
          {error} <Button size="sm" variant="secondary" className="mt-3" onClick={() => select(selected)}>Retry</Button>
        </Alert>
      )}
      {file?.type === "unsupported" && <Alert tone="info" title="Preview unavailable">{file.message}</Alert>}
      {selected && file?.type === "file" && <CodeBlock code={file.content} filename={selected} language={languageOf(selected)} maxLines={28} />}
      {githubUrl && <a className="text-link mt-4 inline-flex items-center gap-1" href={githubUrl} target="_blank" rel="noreferrer">Open file on GitHub <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" /></a>}
    </div>
  </div>;
}
