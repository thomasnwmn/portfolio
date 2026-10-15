import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { ArrowUpRight, FolderGit2, Globe } from "lucide-react";
import type { Project } from "@/lib/projects";
import ProjectVisual from "./ProjectVisual";

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const hasSource = !!(project.sourceUrl || project.repositoryBrowser);
  return (
    <Link href={`/work/${project.slug}`} transitionTypes={["project-open"]} className="project-card reveal group" style={{ "--i": index } as CSSProperties} aria-label={`View ${project.title}`}>
      <ViewTransition name={`visual-${project.slug}`} share="project-morph" default="none"><ProjectVisual project={project} /></ViewTransition>
      <div className="p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3"><p className="eyebrow">{project.discipline}</p><span className="card-arrow" aria-hidden="true">↗</span></div>
        <h2 className="text-2xl font-medium tracking-tight text-paper-0">{project.title}</h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-paper-1">{project.summary}</p>
        <div className="mt-7 flex flex-wrap gap-2">{project.stack.map(tag => <span className="tech-tag" key={tag}>{tag}</span>)}</div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <span className="card-link">Explore project <ArrowUpRight size={13} aria-hidden="true" /></span>
          {(hasSource || project.liveUrl) && (
            <span className="card-badges">
              {hasSource && <span className="card-badge"><FolderGit2 size={12} aria-hidden="true" /> Source</span>}
              {project.liveUrl && <span className="card-badge"><Globe size={12} aria-hidden="true" /> Live</span>}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
