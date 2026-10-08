import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RepositoryBrowserLoader from "@/components/RepositoryBrowserLoader";
import ProjectVisual from "@/components/ProjectVisual";
import SystemFlow, { parseFlow } from "@/components/SystemFlow";
import { getProject, getProjectContent, getProjects } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

// Keep in sync with PROJECTS_REVALIDATE (segment config must be a literal).
export const revalidate = 300;

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
    <div className="page-shell project-detail">
      <Link href="/work" transitionTypes={["project-back"]} className="text-link mb-12 inline-flex">
        ← All projects
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
        <p className="eyebrow">{project.category}</p>
        <div className="flex flex-wrap gap-3">
          {project.liveUrl && (
            <a className="button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">
              View live project ↗
            </a>
          )}
          {project.sourceUrl && (
            <a className="button-secondary" href={project.sourceUrl} target="_blank" rel="noreferrer">
              View source ↗
            </a>
          )}
          {!project.liveUrl && !project.sourceUrl && (
            <Link className="button-secondary" href={`/contact?project=${project.slug}`}>
              Discuss this project ↗
            </Link>
          )}
        </div>
      </div>

      {markdown ? (
        <article className="project-body prose prose-invert max-w-none prose-p:text-paper-1 prose-li:text-paper-1 prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-paper-0 prose-a:text-paper-0 prose-a:underline-offset-4 prose-strong:text-paper-0 prose-code:text-paper-0 prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const content = String(children).trim();
                if (className === "language-flow" || content.startsWith("flow:")) {
                  return <SystemFlow steps={parseFlow(content)} />;
                }
                const match = /language-(\w+)/.exec(className || "");
                if (match || content.includes("\n")) {
                  return (
                    <figure className="notion-code not-prose my-6">
                      <div className="notion-code-header"><span>{match ? match[1] : "code"}</span></div>
                      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-paper-0">
                        <code>{children}</code>
                      </pre>
                    </figure>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              blockquote({ children }) {
                return (
                  <aside className="notion-callout not-prose my-6">
                    <div className="notion-callout-body">{children}</div>
                  </aside>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      ) : null}

      {project.repositoryBrowser && (
        <section className="mt-16" aria-label="Project repository">
          <div className="section-rule">
            <div>
              <p className="eyebrow">Repository</p>
              <h2 className="mt-3 text-2xl font-medium tracking-tight">Explore the source.</h2>
            </div>
            <a className="text-link" href={project.repositoryBrowser.url} target="_blank" rel="noreferrer">
              Open on GitHub ↗
            </a>
          </div>
          <RepositoryBrowserLoader slug={project.slug} config={project.repositoryBrowser} />
        </section>
      )}

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
  );
}
