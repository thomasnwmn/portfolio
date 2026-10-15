import type { Metadata } from "next";
import { getPostBySlug, getPosts, formatLastEdited } from "@/lib/notion";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getPostBySlug(decodedSlug);

  if (!data) {
    notFound();
  }

  const { post, markdown } = data;

  return (
    <div className="mx-auto max-w-3xl px-6 md:px-10 py-24">
      <div className="mb-12">
        <Link href="/blog" className="font-mono text-[12px] text-chrome-mid hover:text-paper-0 transition-colors mb-8 inline-block">
          ← Back to writing
        </Link>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-paper-0 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-paper-2 font-mono text-[13px]">
          <time dateTime={post.date}>{post.date}</time>
        </div>
      </div>

      <article className="prose prose-invert prose-p:text-paper-1 prose-headings:text-paper-0 prose-a:text-paper-0 prose-a:underline-offset-4 hover:prose-a:text-chrome-mid prose-strong:text-paper-0 max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            details({ className, ...props }) {
              delete props.node;
              return <details className={`notion-toggle ${className || ""}`} {...props} />;
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>

      {post.lastEditedTime && (
        <div className="mt-16 pt-6 border-t border-hairline">
          <p className="text-[13px] text-paper-2">
            {formatLastEdited(post.lastEditedTime)}
          </p>
        </div>
      )}
    </div>
  );
}
