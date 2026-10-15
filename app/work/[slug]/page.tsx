import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft, ArrowUpRight, Clock, FolderGit2, Globe, MessageSquare } from "lucide-react";
import RepositoryBrowserLoader from "@/components/RepositoryBrowserLoader";
import ProjectVisual from "@/components/ProjectVisual";
import NotionContent from "@/components/notion/NotionContent";
import TableOfContents from "@/components/notion/TableOfContents";
import { getProject, getProjectContent, getProjects, formatLastEdited } from "@/lib/projects";
import { extractHeadings, readingMinutes } from "@/lib/markdown";

type Props = { params: Promise<{ slug: string }> };

// Prerender every published project at build time. New projects render on their
// first visit and are cached from then on.
export async function generateStaticParams() {
  const params = (await getProjects()).map(project => ({ slug: project.slug }));
  // Cache Components fails the build on an empty list (e.g. Notion env vars
  // missing in a preview build). The placeholder matches nothing, so it 404s.
  return params.length ? params : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return {
    title: project ? `${project.title} · Thomas Newman` : "Project not found · Thomas Newman",
    description: project?.summary,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getProjectContent(decodedSlug);
  if (!data) notFound();

  const { project, markdown } = data;
  const allProjects = await getProjects();
  const index = allProjects.findIndex(item => item.slug === project.slug);
  const safeIndex = index >= 0 ? index : 0;
  const previous = allProjects[(safeIndex - 1 + allProjects.length) % allProjects.length];
  const next = allProjects[(safeIndex + 1) % allProjects.length];

  return (
    <>
    <div className="reading-progress" aria-hidden="true" />
    <div className="page-shell project-detail">
      <Link href="/work" transitionTypes={["project-back"]} className="back-link">
        <ArrowLeft size={14} aria-hidden="true" /> All projects
      </Link>
      <div className="section-heading">
        <div>
          <p className="eyebrow mb-7">Project {project.number}{project.discipline && ` / ${project.discipline}`}</p>
          <h1 className="page-title project-title">{project.title}</h1>
        </div>
        <div>
          <p className="section-intro">{project.summary}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {project.stack.map(tag => (
              <span key={tag} className="tech-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <ViewTransition name={`visual-${project.slug}`} share="project-morph" default="none">
        <ProjectVisual project={project} large />
      </ViewTransition>
      <div className="project-actions">
        <div className="post-meta">
          <span>{project.category}</span>
          {markdown && <span><Clock size={13} aria-hidden="true" />{readingMinutes(markdown)} min read</span>}
        </div>
        <div className="flex flex-wrap gap-3">
          {project.liveUrl && (
            <a className="button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">
              <Globe size={15} aria-hidden="true" /> View live project <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
          {project.sourceUrl && (
            <a className="button-secondary" href={project.sourceUrl} target="_blank" rel="noreferrer">
              <FolderGit2 size={15} aria-hidden="true" /> View source <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
          {!project.liveUrl && !project.sourceUrl && (
            <Link className="button-secondary" href={`/contact?project=${project.slug}`}>
              <MessageSquare size={15} aria-hidden="true" /> Discuss this project <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {markdown ? (
        <div className="content-layout">
          <NotionContent markdown={markdown} className="project-body" />
          <aside><TableOfContents headings={extractHeadings(markdown)} /></aside>
        </div>
      ) : null}

      {project.repositoryBrowser && (
        <section className="mt-16" aria-label="Project repository">
          <div className="section-rule">
            <div>
              <p className="eyebrow">Repository</p>
              <h2 className="mt-3 text-2xl font-medium tracking-tight">Explore the source.</h2>
            </div>
            <a className="text-link" href={project.repositoryBrowser.url} target="_blank" rel="noreferrer">
              Open on GitHub <ArrowUpRight size={13} className="inline" aria-hidden="true" />
            </a>
          </div>
          <RepositoryBrowserLoader slug={project.slug} config={project.repositoryBrowser} />
        </section>
      )}

      {project.lastEditedTime && <p className="page-meta">{formatLastEdited(project.lastEditedTime)}</p>}

      {allProjects.length > 1 && (
        <nav aria-label="More projects" className="project-pagination">
          <Link href={`/work/${previous.slug}`} transitionTypes={["project-back"]}>
            <span className="eyebrow">← Previous project</span>
            <span className="mt-3 block text-xl">{previous.title}</span>
          </Link>
          <Link href={`/work/${next.slug}`} transitionTypes={["project-open"]}>
            <span className="eyebrow">Next project →</span>
            <span className="mt-3 block text-xl">{next.title}</span>
          </Link>
        </nav>
      )}
    </div>
    </>
  );
}
