import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { ChevronDown } from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SystemFlow, { parseFlow } from "@/components/SystemFlow";
import { normalizeHeadings, slugify } from "@/lib/markdown";
import { CodeBlock } from "@/components/arc/code-block/code-block";
import ZoomableImage from "./ZoomableImage";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

function heading(Tag: "h2" | "h3") {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(textOf(children));
    return (
      <Tag id={id || undefined} className="notion-heading">
        {children}
        {id && <a href={`#${id}`} className="heading-anchor" aria-label="Link to this section">#</a>}
      </Tag>
    );
  };
}

const components: Components = {
  h2: heading("h2"),
  h3: heading("h3"),
  // Block code renders its own <figure>; avoid nesting it inside <pre>.
  pre: ({ children }) => <>{children}</>,
  code({ className, children }) {
    const content = String(children).replace(/\n$/, "");
    if (className === "language-flow" || content.trim().startsWith("flow:")) {
      return <SystemFlow steps={parseFlow(content.trim())} />;
    }
    const language = /language-([\w+#-]+)/.exec(className || "")?.[1];
    if (!language && !content.includes("\n")) return <code className={className}>{children}</code>;
    const label = language && language !== "plain" ? language : "text";
    return (
      <div className="notion-codeblock not-prose">
        <CodeBlock code={content} language={label} maxLines={24} />
      </div>
    );
  },
  blockquote: ({ children }) => <blockquote className="notion-quote">{children}</blockquote>,
  table: ({ children }) => <div className="notion-table"><table>{children}</table></div>,
  img: ({ src, alt }) => <ZoomableImage src={typeof src === "string" ? src : undefined} alt={alt} />,
  a({ href, children, className, target, rel }) {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a href={href} className={className} target={target ?? (external ? "_blank" : undefined)} rel={rel ?? (external ? "noreferrer" : undefined)}>
        {children}
      </a>
    );
  },
  details: ({ className, children, open }) => <details className={`notion-toggle ${className || ""}`} open={open}>{children}</details>,
  summary: ({ children }) => (
    <summary className="notion-toggle-summary">
      {children}
      <ChevronDown size={20} strokeWidth={1.75} className="notion-toggle-chevron" aria-hidden="true" />
    </summary>
  ),
};

export default function NotionContent({ markdown, className = "" }: { markdown: string; className?: string }) {
  return (
    <article className={`notion-content prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {normalizeHeadings(markdown)}
      </ReactMarkdown>
    </article>
  );
}
