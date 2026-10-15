import { Badge } from "@/components/arc/badge/badge";

export default function TechTags({ tags, className = "" }: { tags: string[]; className?: string }) {
  if (!tags.length) return null;
  return <span className={`tag-list ${className}`}>{tags.map(tag => <Badge key={tag} size="sm">{tag}</Badge>)}</span>;
}
