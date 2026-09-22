import { getPostBySlug } from "@/lib/notion";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60;

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
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
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </article>
    </div>
  );
}
