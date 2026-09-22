"use client";

import type { Project } from "@/lib/projects";
import dynamic from "next/dynamic";

const RepositoryBrowser = dynamic(() => import("./RepositoryBrowser"), {
  ssr: false,
  loading: () => <p className="p-6 text-paper-2" role="status">Loading repository browser…</p>,
});

export default function RepositoryBrowserLoader({ slug, config }: { slug: string; config: NonNullable<Project["repositoryBrowser"]> }) {
  return <RepositoryBrowser key={slug} slug={slug} config={config} />;
}
