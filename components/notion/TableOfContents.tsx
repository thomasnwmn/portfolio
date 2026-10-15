"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
import type { Heading } from "@/lib/markdown";

// Matches .notion-heading's scroll-margin-top, so a clicked heading counts as current.
const OFFSET = 120;

// Sticky "On this page" list that highlights the last heading scrolled past.
export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const elements = headings.map(heading => document.getElementById(heading.id)).filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const el of elements) {
        // Headings inside closed toggles have no box; skip them.
        if (!el.getClientRects().length) continue;
        if (el.getBoundingClientRect().top <= OFFSET + 1) current = el.id;
        else break;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);
  if (headings.length < 2) return null;
  return (
    <nav aria-label="On this page" className="toc">
      <p className="eyebrow toc-title"><ListTree size={12} aria-hidden="true" /> On this page</p>
      <ol>
        {headings.map(heading => (
          <li key={heading.id} data-level={heading.level}>
            <a href={`#${heading.id}`} aria-current={active === heading.id ? "location" : undefined}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
