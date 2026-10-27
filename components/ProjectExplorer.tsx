"use client";

import { startTransition, ViewTransition } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import type { Project } from "@/lib/projects";
import { Button } from "./arc/button/button";
import { ChipGroup } from "./arc/chip-group/chip-group";
import { EmptyState } from "./arc/empty-state/empty-state";
import { SearchField } from "./arc/search-field/search-field";
import ProjectCard from "./ProjectCard";

export default function ProjectExplorer({ projects }: { projects: Project[] }) {
  const searchParams = useSearchParams();
  return <ProjectIndex projects={projects} requestedCategory={searchParams.get("category")} query={searchParams.get("q") ?? ""} />;
}

// Rendered unfiltered as the Suspense fallback too, so the prerendered HTML
// already lists every project before the filters hydrate.
export function ProjectIndex({ projects, requestedCategory = null, query = "" }: { projects: Project[]; requestedCategory?: string | null; query?: string }) {
  const categories = [...new Set(projects.map(project => project.category))];
  // No chip selected means every category.
  const category = categories.find(item => item === requestedCategory) ?? null;
  function updateFilters(nextCategory: string | null, nextQuery: string) {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextQuery) params.set("q", nextQuery);
    // Next's native History integration preserves filters and scroll on Back
    // without fetching a new server page on every keystroke.
    window.history.replaceState(null, "", `/work${params.size ? `?${params}` : ""}`);
  }
  const filtered = projects.filter(project => (!category || project.category === category) && `${project.title} ${project.summary} ${project.discipline} ${project.stack.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filtering = !!category || !!query;
  const options = categories.map(item => ({ value: item, label: `${item} ${projects.filter(p => p.category === item).length}` }));
  return (
    <section aria-label="Project index">
      <div className="explorer-toolbar">
        <ChipGroup
          label="Filter by discipline"
          multiple={false}
          options={options}
          value={category ? [category] : []}
          onValueChange={next => startTransition(() => updateFilters(next[0] ?? null, query))}
        />
        <div className="explorer-search">
          <SearchField label="Search projects" placeholder="Name or technology" value={query} onValueChange={next => updateFilters(category, next)} />
        </div>
      </div>
      <p className="results-count" aria-live="polite">{filtering ? `${filtered.length} of ${projects.length} projects` : `${projects.length} projects`}</p>
      <ViewTransition update="filter-results" default="none"><div className="project-grid mt-6">
        {filtered.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
        {filtered.length === 0 && (
          <EmptyState
            className="col-span-full bg-ink-0"
            icon={<SearchX size={24} strokeWidth={1.75} />}
            title="No matching projects"
            description="Try another technology, or clear the filters to see the full index."
            action={<Button variant="secondary" onClick={() => startTransition(() => updateFilters(null, ""))}>Clear filters</Button>}
          />
        )}
      </div></ViewTransition>
    </section>
  );
}
