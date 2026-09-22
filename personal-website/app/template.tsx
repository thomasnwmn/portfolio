"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition
      key={pathname}
      enter={{ "project-open": "project-open", "project-back": "project-back", default: "page-enter" }}
      exit={{ "project-open": "project-open", "project-back": "project-back", default: "page-exit" }}
      default="none"
    >
      <div className="route-content">{children}</div>
    </ViewTransition>
  );
}
