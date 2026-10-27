import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { getPostBySlug, getPosts, formatLastEdited } from "@/lib/notion";
import { extractHeadings, formatDate, readingMinutes } from "@/lib/markdown";
import NotionContent from "@/components/notion/NotionContent";
import TableOfContents from "@/components/notion/TableOfContents";
import TechTags from "@/components/TechTags";
import DetailSkeleton from "@/components/DetailSkeleton";

type Props = { params: Promise<{ slug: string }> };

// Prerender every published post at build time. New posts render on their
// first visit and are cached from then on.
export async function generateStaticParams() {
  const params = (await getPosts()).map(post => ({ slug: post.slug }));
  // Cache Components fails the build on an empty list (e.g. Notion env vars
  // missing in a preview build). The placeholder matches nothing, so it 404s.
  return params.length ? params : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPostBySlug(decodeURIComponent((await params).slug));
  return {
    title: data ? `${data.post.title} · Thomas Newman` : "Post not found · Thomas Newman",
    description: data?.post.summary || undefined,
  };
}

// The shell and back link don't depend on the slug, so they belong to the
// route's App Shell; the post itself streams in behind Suspense.
export default function BlogPost({ params }: Props) {
  return (
    <>
      <div className="reading-progress" aria-hidden="true" />
      <div className="page-shell">
        <Link href="/blog" className="back-link"><ArrowLeft size={14} aria-hidden="true" /> All posts</Link>
        <Suspense fallback={<DetailSkeleton label="Loading post" />}><Post params={params} /></Suspense>
      </div>
    </>
  );
}

async function Post({ params }: Props) {
  const { slug } = await params;
  const data = await getPostBySlug(decodeURIComponent(slug));
  if (!data) notFound();

  const { post, markdown } = data;
  const headings = extractHeadings(markdown);
  const posts = await getPosts();
  const index = posts.findIndex(item => item.slug === post.slug);
  // Posts are sorted newest first.
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <>
      <header className="post-header">
        <div className="post-meta">
          {post.date && <span><CalendarDays size={13} aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>}
          <span><Clock size={13} aria-hidden="true" />{readingMinutes(markdown)} min read</span>
          <TechTags tags={post.tags} />
        </div>
        <h1 className="page-title">{post.title}</h1>
        {post.summary && <p className="section-intro">{post.summary}</p>}
      </header>

      {post.image && (
        <div className="post-cover">
          <Image src={post.image} alt="" fill priority sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover" />
        </div>
      )}

      <div className="content-layout">
        <NotionContent markdown={markdown} />
        <aside><TableOfContents headings={headings} /></aside>
      </div>

      {post.lastEditedTime && <p className="page-meta">{formatLastEdited(post.lastEditedTime)}</p>}

      {(newer || older) && (
        <nav aria-label="More posts" className="project-pagination">
          {older ? (
            <Link href={`/blog/${older.slug}`} prefetch>
              <span className="eyebrow">← Older post</span>
              <span className="mt-3 block text-xl">{older.title}</span>
            </Link>
          ) : <span />}
          {newer && (
            <Link href={`/blog/${newer.slug}`} prefetch>
              <span className="eyebrow">Newer post →</span>
              <span className="mt-3 block text-xl">{newer.title}</span>
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
