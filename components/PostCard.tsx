import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Post } from "@/lib/notion";
import { formatDate } from "@/lib/markdown";

export default function PostCard({ post, index, featured = false }: { post: Post; index: number; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`post-card reveal ${featured ? "post-card-featured" : ""}`} style={{ "--i": index } as CSSProperties}>
      <div className="project-visual" aria-hidden="true">
        {post.image ? (
          <Image src={post.image} alt="" fill sizes={featured ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 640px) 100vw, 50vw"} className="object-cover" />
        ) : (
          <><div className="visual-grid" /><p className="visual-caption"><span>{post.title}</span><span className="signal-dot" /></p></>
        )}
      </div>
      <div className="post-card-body">
        <div className="post-meta">
          {post.date && <span><CalendarDays size={13} aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>}
          {post.tags.map(tag => <span key={tag} className="tech-tag">{tag}</span>)}
        </div>
        <h2>{post.title}</h2>
        {post.summary && <p>{post.summary}</p>}
        <span className="card-link">Read post <ArrowUpRight size={13} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
