import Link from "next/link";
import { getPosts } from "@/lib/notion";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-paper-0 mb-8">Writing</h1>
      
      {!process.env.NOTION_DATABASE_ID && (
        <div className="mb-8 p-4 border border-chrome-mid bg-ink-1 rounded-sm text-paper-1">
          <p className="font-semibold text-paper-0 mb-2">Setup Required</p>
          <p>Please add your NOTION_TOKEN and NOTION_DATABASE_ID to your .env.local file to see your posts here.</p>
        </div>
      )}

      <div className="flex flex-col border-t border-hairline">
        {posts.length === 0 && process.env.NOTION_DATABASE_ID && (
          <p className="py-6 text-paper-2">No posts published yet.</p>
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
