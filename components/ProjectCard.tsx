import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { ArrowUpRight, FolderGit2, Globe } from "lucide-react";
import type { Project } from "@/lib/projects";
import ProjectVisual from "./ProjectVisual";
import TechTags from "./TechTags";
import { Badge } from "./arc/badge/badge";

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const hasSource = !!(project.sourceUrl || project.repositoryBrowser);
  return (
    <Link href={`/work/${project.slug}`} prefetch transitionTypes={["project-open"]} className="project-card reveal group" style={{ "--i": index } as CSSProperties} aria-label={`View ${project.title}`}>
      <ViewTransition name={`visual-${project.slug}`} share="project-morph" default="none"><ProjectVisual project={project} /></ViewTransition>
      <div className="p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3"><p className="eyebrow">{project.discipline}</p><span className="card-arrow" aria-hidden="true">↗</span></div>
        <h2 className="text-2xl font-medium tracking-tight text-paper-0">{project.title}</h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-paper-1">{project.summary}</p>
        <TechTags tags={project.stack} className="mt-7" />
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <span className="card-link">Explore project <ArrowUpRight size={13} aria-hidden="true" /></span>
          {(hasSource || project.liveUrl) && (
            <span className="card-badges">
              {hasSource && <Badge size="sm" icon={<FolderGit2 size={12} strokeWidth={1.75} />}>Source</Badge>}
              {project.liveUrl && <Badge size="sm" tone="success" icon={<Globe size={12} strokeWidth={1.75} />}>Live</Badge>}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
