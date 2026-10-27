"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./code-block.module.css";

/** Expands a collapsed code block in place. The block itself is server-rendered; this marks it expanded and CSS does the rest. */
export function CodeBlockToggle({ lineCount }: { lineCount: number }) {
  const [expanded, setExpanded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const labels = [`Show all ${lineCount} lines`, "Show fewer lines"] as const;
  function toggle() {
    const next = !expanded;
    setExpanded(next);
    button.current?.closest("section")?.toggleAttribute("data-expanded", next);
  }
  return <button ref={button} type="button" className={styles.expand} aria-expanded={expanded} onClick={toggle}>
    {/* Both labels share one cell, so the chevron never moves when the words change. */}
    <span className={styles.swap} aria-hidden="true">
      {labels.map((text, index) => <span key={text} className={styles.swapText} data-active={(index === 1) === expanded || undefined}>{text}</span>)}
    </span>
    <span className={styles.srOnly}>{labels[expanded ? 1 : 0]}</span>
    <span className={styles.chevron} aria-hidden="true"><ChevronDown size={16} strokeWidth={1.75} /></span>
  </button>;
}
