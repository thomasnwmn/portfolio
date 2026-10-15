"use client";

import type { Project } from "@/lib/projects";
import dynamic from "next/dynamic";
import { Skeleton } from "./arc/skeleton/skeleton";

const RepositoryBrowser = dynamic(() => import("./RepositoryBrowser"), {
  ssr: false,
  loading: () => <Skeleton lines={4} label="Loading repository browser" />,
});

export default function RepositoryBrowserLoader({ slug, config }: { slug: string; config: NonNullable<Project["repositoryBrowser"]> }) {
  return <RepositoryBrowser key={slug} slug={slug} config={config} />;
}
