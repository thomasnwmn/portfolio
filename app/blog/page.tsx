import Link from "next/link";
import { ArrowUpRight, NotebookPen } from "lucide-react";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { getPosts } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Writing · Thomas Newman", description: "Updates and notes on engineering, hardware and software." };

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div><h1 className="page-title">The <span className="text-chrome-hi/60">Blog.</span></h1></div>
        <p className="section-intro">See my latest updates on engineering and technology: what I’m building, what broke, and what I learned fixing it.</p>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          className="border-t border-hairline"
          icon={<NotebookPen size={24} strokeWidth={1.75} />}
          title="No posts yet"
          description="Notes are on the way. In the meantime, explore what I’m building."
          action={<Link href="/work" className="button-secondary">Explore my work <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" /></Link>}
        />
      ) : (
        <div className="post-grid">
          {posts.map((post, index) => <PostCard key={post.id} post={post} index={index} featured={index === 0} />)}
        </div>
      )}
    </div>
  );
}
