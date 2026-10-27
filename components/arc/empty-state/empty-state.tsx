import type { ReactNode } from "react";
import { Folder } from "lucide-react";
import styles from "./empty-state.module.css";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Optional accessible label for the state region. */
  label?: string;
}

/** A static empty state. The icon settles in with a CSS animation when it first appears, so it ships no client JavaScript of its own. */
export function EmptyState({ title, description, action, icon, className, label }: EmptyStateProps) {
  return <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label={label}>
    <div className={styles.icon} aria-hidden="true">{icon ?? <Folder width={24} height={24} strokeWidth={1.5} />}</div>
    <div className={styles.copy}>
      <h3><span className={styles.line}>{title}</span></h3>
      <p><span className={styles.line}>{description}</span></p>
    </div>
    {action && <div className={styles.action}>{action}</div>}
  </section>;
}

export default EmptyState;
