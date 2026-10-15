"use client";

import { startTransition, ViewTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Boxes, CircuitBoard, CodeXml, Cpu, Gamepad2, LayoutGrid, Search, X, type LucideIcon } from "lucide-react";
import type { Project } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

const ALL = "All projects";

// Categories come from Notion, so match loosely and fall back to a generic icon.
function categoryIcon(category: string): LucideIcon {
  const name = category.toLowerCase();
  if (category === ALL) return LayoutGrid;
  if (name.includes("embedded") || name.includes("firmware")) return Cpu;
  if (name.includes("hardware") || name.includes("electr") || name.includes("circuit")) return CircuitBoard;
  if (name.includes("robot")) return Bot;
  if (name.includes("game")) return Gamepad2;
  if (name.includes("software") || name.includes("web") || name.includes("app")) return CodeXml;
  return Boxes;
}

export default function ProjectExplorer({ projects }: { projects: Project[] }) {
  const categories = [ALL, ...new Set(projects.map(project => project.category))];
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const category = categories.find(item => item === requestedCategory) ?? ALL;
  const query = searchParams.get("q") ?? "";
  function updateFilters(nextCategory: string, nextQuery: string) {
    const params = new URLSearchParams();
    if (nextCategory !== ALL) params.set("category", nextCategory);
    if (nextQuery) params.set("q", nextQuery);
    // Next's native History integration preserves filters and scroll on Back
    // without fetching a new server page on every keystroke.
    window.history.replaceState(null, "", `/work${params.size ? `?${params}` : ""}`);
  }
  const filtered = projects.filter(project => (category === ALL || project.category === category) && `${project.title} ${project.summary} ${project.discipline} ${project.stack.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filtering = category !== ALL || !!query;
  return (
    <section aria-label="Project index">
      <div className="explorer-toolbar">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by discipline">
          {categories.map(item => {
            const Icon = categoryIcon(item);
            return (
              <button key={item} className="filter-button" aria-pressed={category === item} onClick={() => startTransition(() => updateFilters(item, query))}>
                <Icon size={14} aria-hidden="true" />{item}<span>{item === ALL ? projects.length : projects.filter(p => p.category === item).length}</span>
              </button>
            );
          })}
        </div>
        <div className="project-search">
          <label htmlFor="project-search" className="sr-only">Search projects by name or technology</label>
          <Search size={15} aria-hidden="true" />
          <input id="project-search" type="search" placeholder="Search name or technology…" value={query} onChange={event => updateFilters(category, event.target.value)} />
          {query && <button type="button" aria-label="Clear search" onClick={() => updateFilters(category, "")}><X size={14} aria-hidden="true" /></button>}
        </div>
      </div>
      <p className="results-count" aria-live="polite">{filtering ? `${filtered.length} of ${projects.length} projects` : `${projects.length} projects`}</p>
      <ViewTransition update="filter-results" default="none"><div className="project-grid mt-6">
        {filtered.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
        {filtered.length === 0 && <div className="col-span-full px-6 py-20 text-center"><h2 className="text-2xl">No matching projects.</h2><p className="mt-3 text-paper-1">Try another technology or explore the full index.</p><button className="button-secondary mt-6" onClick={() => startTransition(() => updateFilters(ALL, ""))}>Clear filters ↻</button></div>}
      </div></ViewTransition>
    </section>
  );
}
