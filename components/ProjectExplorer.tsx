"use client";

import { startTransition, ViewTransition } from "react";
import { useSearchParams } from "next/navigation";
import { projects } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

const categories = ["All projects", "Embedded systems", "Software"] as const;

export default function ProjectExplorer() {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const category = categories.find(item => item === requestedCategory) ?? "All projects";
  const query = searchParams.get("q") ?? "";
  function updateFilters(nextCategory: string, nextQuery: string) {
    const params = new URLSearchParams();
    if (nextCategory !== "All projects") params.set("category", nextCategory);
    if (nextQuery) params.set("q", nextQuery);
    // Next's native History integration preserves filters and scroll on Back
    // without fetching a new server page on every keystroke.
    window.history.replaceState(null, "", `/work${params.size ? `?${params}` : ""}`);
  }
  const filtered = projects.filter(project => (category === "All projects" || project.category === category) && `${project.title} ${project.summary} ${project.discipline} ${project.stack.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section aria-label="Project index">
      <div className="explorer-toolbar">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by discipline">{categories.map(item => <button key={item} className="filter-button" aria-pressed={category === item} onClick={() => startTransition(() => updateFilters(item, query))}>{item}<span>{item === "All projects" ? projects.length : projects.filter(p => p.category === item).length}</span></button>)}</div>
        <div className="project-search"><label htmlFor="project-search" className="sr-only">Search projects by name or technology</label><svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="5" /><path d="m12 12 5 5" /></svg><input id="project-search" type="search" placeholder="Search name or technology…" value={query} onChange={event => updateFilters(category, event.target.value)} /></div>
      </div>
      <p role="status" aria-live="polite" className="eyebrow my-6">{String(filtered.length).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} projects{category !== "All projects" ? ` · ${category}` : " · Hardware & software"}</p>
      <ViewTransition update="filter-results" default="none"><div className="project-grid">
        {filtered.map(project => <ProjectCard key={project.slug} project={project} />)}
        {filtered.length === 0 && <div className="col-span-full px-6 py-20 text-center"><h2 className="text-2xl">No matching projects.</h2><p className="mt-3 text-paper-1">Try another technology or explore the full index.</p><button className="button-secondary mt-6" onClick={() => startTransition(() => updateFilters("All projects", ""))}>Clear filters ↻</button></div>}
      </div></ViewTransition>
    </section>
  );
}
