import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import ProjectVisual from "@/components/ProjectVisual";
import { getProject, projects } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return { title: project ? `${project.title} · Thomas Newman` : "Project not found · Thomas Newman", description: project?.summary };
}
export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  return (
    <div className="page-shell project-detail">
      <Link href="/work" transitionTypes={["project-back"]} className="text-link mb-12 inline-flex">← All projects</Link>
      <div className="section-heading"><div><p className="eyebrow mb-7">Project {project.number} / {project.discipline}</p><h1 className="page-title project-title">{project.title}</h1></div><div><p className="section-intro">{project.summary}</p><div className="mt-7 flex flex-wrap gap-2">{project.stack.map(tag => <span key={tag} className="tech-tag">{tag}</span>)}</div></div></div>
      <ViewTransition name={`visual-${project.slug}`} share="project-morph" default="none"><ProjectVisual project={project} large /></ViewTransition>
      <div className="project-actions"><p className="eyebrow">{project.category} / Technical overview</p><div className="flex flex-wrap gap-3">
        {project.liveUrl && <a className="button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">View live project ↗</a>}
        {project.sourceUrl && <a className="button-secondary" href={project.sourceUrl} target="_blank" rel="noreferrer">View source ↗</a>}
        {!project.liveUrl && !project.sourceUrl && <Link className="button-secondary" href={`/contact?project=${project.slug}`}>Discuss this project ↗</Link>}
      </div></div>
      <section className="detail-section"><p className="eyebrow">01 / Overview</p><div><h2 className="mb-5 text-3xl font-medium tracking-tight">The system.</h2><p className="text-lg leading-relaxed text-paper-1">{project.overview}</p></div></section>
      <section className="detail-section"><p className="eyebrow">02 / Engineering focus</p><div className="space-y-9">{project.focus.map((item,i) => <div key={item.title} className="border-t border-hairline pt-6"><span className="eyebrow">0{i+1}</span><h2 className="mb-3 mt-3 text-xl font-medium">{item.title}</h2><p className="leading-relaxed text-paper-1">{item.description}</p></div>)}</div></section>
      <section className="detail-section"><p className="eyebrow">03 / System at a glance</p><div><ol className="system-flow">{project.flow.map((step,i) => <li key={step}><span className="eyebrow">0{i+1}</span><span>{step}</span>{i < 2 && <span className="flow-arrow" aria-hidden="true">→</span>}</li>)}</ol><p className="mt-4 text-xs text-paper-2">Conceptual flow · The key layers of the project.</p></div></section>
      <nav aria-label="More projects" className="project-pagination"><Link href={`/work/${previous.slug}`} transitionTypes={["project-back"]}><span className="eyebrow">← Previous project</span><span className="mt-3 block text-xl">{previous.title}</span></Link><Link href={`/work/${next.slug}`} transitionTypes={["project-open"]}><span className="eyebrow">Next project →</span><span className="mt-3 block text-xl">{next.title}</span></Link></nav>
    </div>
  );
}
