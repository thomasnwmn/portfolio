"use client";

import type { Project } from "@/lib/projects";
import type { HighlightedLine } from "@/lib/highlight";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, FileCode2, FolderGit2 } from "lucide-react";
import { Alert } from "./arc/alert/alert";
import { Button } from "./arc/button/button";
import { CopyButton } from "./arc/copy-button/copy-button";
import { ScrollArea } from "./arc/scroll-area/scroll-area";
import { Skeleton } from "./arc/skeleton/skeleton";
import { TreeView, type TreeNode } from "./arc/tree-view/tree-view";

type Entry = { name: string; path: string; type: "directory" | "file" };
type SourceFile = { type: "file"; content: string; language: string; lines: HighlightedLine[]; size: number };
type Result = { type: "directory"; entries: Entry[]; truncated: boolean } | SourceFile | { type: "unsupported"; message: string };
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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Bytes`;
  return `${(bytes / 1024).toFixed(bytes < 10240 ? 2 : 1)} KB`;
}

// GitHub's header counts: total lines, and lines of code that are not blank.
function lineStats(content: string) {
  const lines = content.replace(/\n$/, "").split("\n");
  return { lines: lines.length, loc: lines.filter(line => line.trim()).length };
}

function CodeView({ file }: { file: SourceFile }) {
  const lines = file.lines.at(-1)?.every(([text]) => !text) ? file.lines.slice(0, -1) : file.lines;
  return (
    <ScrollArea orientation="both" viewportClassName="repo-code-scroll" label="File contents">
      <pre className="repo-code-pre" data-language={file.language}>
        <code>
          {lines.map((line, index) => (
            <span key={index} className="repo-line">
              <span className="repo-line-number" aria-hidden="true">{index + 1}</span>
              <span className="repo-line-text">
                {line.length ? line.map(([text, color], token) => color ? <span key={token} style={{ color }}>{text}</span> : <Fragment key={token}>{text}</Fragment>) : "\n"}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </ScrollArea>
  );
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

  const select = useCallback(async (path: string) => {
    const request = ++sequence.current;
    setSelected(path); setFile(null); setError("");
    try { const data = await read(path); if (request === sequence.current) setFile(data); }
    catch (reason) { if (request === sequence.current) setError(reason instanceof Error ? reason.message : "Unable to load file."); }
  }, [read]);

  const fetchFolder = useCallback((path: string, openReadme = false) => {
    read(path).then(result => {
      if (result.type !== "directory") throw new Error("Could not load this folder.");
      setFolders(previous => new Map(previous).set(path, { status: "ready", entries: result.entries, truncated: result.truncated }));
      // Open the README (or the first file) so the viewer never starts empty.
      if (openReadme && sequence.current === 0) {
        const files = result.entries.filter(entry => entry.type === "file");
        const first = files.find(entry => /^readme(\.md)?$/i.test(entry.name)) ?? files[0];
        if (first) select(first.path);
      }
    }).catch((reason: Error) => {
      setFolders(previous => new Map(previous).set(path, { status: "error", message: reason.message }));
    });
  }, [read, select]);

  useEffect(() => { fetchFolder("", true); }, [fetchFolder]);

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

  const files = new Set([...folders.values()].flatMap(folder => folder.status === "ready" ? folder.entries.filter(entry => entry.type === "file").map(entry => entry.path) : []));
  const root = folders.get("");
  const repository = config.url.replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
  const githubUrl = selected && `${config.url.replace(/\/$/, "")}/blob/${encodeURIComponent(config.branch || "HEAD")}/${[config.rootPath, selected].filter(Boolean).join("/").split("/").map(encodeURIComponent).join("/")}`;
  const stats = file?.type === "file" ? lineStats(file.content) : null;

  return <div className="repo-browser">
    <div className="repo-code">
      <div className="repo-file-bar">
        <p className="repo-file-path">
          <FileCode2 size={16} strokeWidth={1.75} aria-hidden="true" />
          {selected ? selected.split("/").map((part, index, parts) => (
            <Fragment key={index}>
              <span className={index === parts.length - 1 ? "text-paper-0" : undefined}>{part}</span>
              {index < parts.length - 1 && <span className="repo-file-separator" aria-hidden="true">/</span>}
            </Fragment>
          )) : <span>Source code</span>}
        </p>
        {file?.type === "file" && stats && (
          <div className="repo-file-actions">
            <span className="repo-file-meta">{stats.lines} lines ({stats.loc} loc) · {formatSize(file.size)}</span>
            <CopyButton value={file.content} label="Copy" variant="plain" />
            {githubUrl && <a className="repo-github-link" href={githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" /></a>}
          </div>
        )}
      </div>
      <div className="repo-code-body" aria-busy={!!selected && !file && !error}>
        {!selected && root?.status !== "error" && <div className="repo-code-state"><Skeleton lines={6} label="Loading repository" /></div>}
        {selected && !file && !error && <div className="repo-code-state"><Skeleton lines={6} label={`Loading ${selected}`} /></div>}
        {selected && error && (
          <div className="repo-code-state">
            <Alert tone="danger" title="Couldn’t load this file">
              {error} <Button size="sm" variant="secondary" className="mt-3" onClick={() => select(selected)}>Retry</Button>
            </Alert>
          </div>
        )}
        {file?.type === "unsupported" && <div className="repo-code-state"><Alert tone="info" title="Preview unavailable">{file.message}</Alert></div>}
        {file?.type === "file" && <CodeView file={file} />}
      </div>
    </div>
    <nav aria-label="Repository files" className="repo-tree">
      <p className="repo-tree-title">
        <FolderGit2 size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="truncate">{repository}</span>
      </p>
      {root?.status === "error" ? (
        <div className="p-3">
          <Alert tone="danger" title="Couldn’t load the repository">
            {root.message} <Button size="sm" variant="secondary" className="mt-3" onClick={() => loadFolder("")}>Retry</Button>
          </Alert>
        </div>
      ) : (
        <ScrollArea viewportClassName="repo-tree-scroll" label="Repository files">
          <TreeView aria-label="Repository files" nodes={buildNodes("", folders)} expandedIds={expanded} onExpandedChange={onExpandedChange} onSelect={node => { if (files.has(node.id)) select(node.id); }} />
        </ScrollArea>
      )}
    </nav>
  </div>;
}
