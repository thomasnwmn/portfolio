"use client";

import { CircleAlert, Copy } from "lucide-react";
import { useCopyFeedback } from "../lib/use-copy-feedback";
import styles from "./copy-button.module.css";

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  variant?: "outline" | "plain";
  disabled?: boolean;
  onCopied?: () => void;
}

/**
 * Every icon and label is always in the DOM; `data-copy-state` picks the visible one and CSS crossfades between them.
 * Copy feedback stays unhurried: icons trade places out of a soft blur on the slow spring, the tick draws itself from
 * its short stroke, and the same motion plays in reverse when the confirmation hands back to idle.
 */
export function CopyButton({ value, label = "Copy", className, iconOnly = false, variant = "outline", disabled, onCopied }: CopyButtonProps) {
  const { state, copy } = useCopyFeedback();

  async function handleCopy() {
    if (await copy(value)) onCopied?.();
  }

  return <><button
    type="button"
    className={[styles.button, iconOnly && styles.iconOnly, variant === "plain" && styles.plain, className].filter(Boolean).join(" ")}
    onClick={() => void handleCopy()}
    aria-label={label}
    data-copy-state={state}
    disabled={disabled}
  >
    <span className={styles.icon} aria-hidden="true">
      <span className={styles.iconInner} data-state="idle"><Copy size={16} strokeWidth={1.75} /></span>
      <span className={styles.iconInner} data-state="copied">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path className={styles.check} d="M4 12l5 5L20 6" pathLength={1} /></svg>
      </span>
      <span className={styles.iconInner} data-state="error"><CircleAlert size={16} strokeWidth={1.75} /></span>
    </span>
    {/* All three labels share one grid cell, so the button keeps its widest width and only the words change. */}
    {!iconOnly && <span className={styles.label} aria-hidden="true">
      <span className={styles.text} data-state="idle">{label}</span>
      <span className={styles.text} data-state="copied">Copied</span>
      <span className={styles.text} data-state="error">Failed</span>
    </span>}
  </button><span className={styles.srOnly} role="status" aria-live="polite">{state === "idle" ? "" : state === "error" ? `${label}: Could not copy` : `${label}: Copied`}</span></>;
}
