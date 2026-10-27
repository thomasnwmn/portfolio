import type { HTMLAttributes, ReactNode } from "react";
import styles from "./badge.module.css";

export type BadgeTone = "neutral" | "success" | "info" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: ReactNode;
}

/** A static pill. Labels on this site never change after render, so the badge ships no client JavaScript. */
export function Badge({ tone = "neutral", size = "md", icon, className, children, ...props }: BadgeProps) {
  const classes = [styles.badge, styles[tone], styles[size], className].filter(Boolean).join(" ");
  return <span {...props} className={classes}>
    <span className={styles.content}>
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </span>
  </span>;
}

export default Badge;
