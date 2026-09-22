import Link from "next/link";
import { ViewTransition } from "react";
import type { Project } from "@/lib/projects";
import ProjectVisual from "./ProjectVisual";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} transitionTypes={["project-open"]} className="project-card group" aria-label={`View ${project.title}`}>
      <ViewTransition name={`visual-${project.slug}`} share="project-morph" default="none"><ProjectVisual project={project} /></ViewTransition>
      <div className="p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3"><p className="eyebrow">{project.discipline}</p><span className="card-arrow" aria-hidden="true">↗</span></div>
        <h2 className="text-2xl font-medium tracking-tight text-paper-0">{project.title}</h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-paper-1">{project.summary}</p>
        <div className="mt-7 flex flex-wrap gap-2">{project.stack.map(tag => <span className="tech-tag" key={tag}>{tag}</span>)}</div>
        <p className="mt-7 font-mono text-[11px] uppercase tracking-wider text-paper-1">Explore project <span aria-hidden="true">→</span></p>
      </div>
    </Link>
  );
}
