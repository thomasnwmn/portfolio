import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
        <div className="empty-state">
          <p className="text-paper-1">Notes are on the way. In the meantime, explore what I’m building.</p>
          <Link href="/work" className="button-secondary mt-6">Explore my work <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post, index) => <PostCard key={post.id} post={post} index={index} featured={index === 0} />)}
        </div>
      )}
    </div>
  );
}
