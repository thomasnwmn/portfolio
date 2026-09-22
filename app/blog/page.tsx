import Link from "next/link";
import { getPosts } from "@/lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Writing · Thomas Newman" };

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="page-shell">
      <p className="eyebrow mb-7">Writing / Engineering notes</p>
      <h1 className="page-title mb-8">Thinking through<br />the system.</h1>
      <p className="mb-12 max-w-xl leading-relaxed text-paper-1">Notes on computer engineering, hardware, software, and the lessons in between.</p>
      

      <div className="flex flex-col border-t border-hairline">
        {posts.length === 0 && (
          <div className="py-12"><p className="text-paper-1">Notes are on the way. In the meantime, explore what I’m building.</p><Link href="/work" className="button-secondary mt-6">Explore my work ↗</Link></div>
        )}
        
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-4 py-6 border-b border-hairline no-underline">
            <div>
              <h2 className="text-lg font-medium text-paper-1 group-hover:text-paper-0 transition-colors">
                {post.title}
              </h2>
              {post.summary && <p className="text-sm text-paper-2 mt-1">{post.summary}</p>}
            </div>
            <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0">
              <span className="font-mono text-[12px] text-paper-2">{post.date}</span>
              <span className="font-mono text-[12px] text-paper-2 transition-all group-hover:translate-x-1 group-hover:text-chrome-hi">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
