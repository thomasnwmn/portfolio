import type { Metadata } from "next";
import ProjectExplorer from "@/components/ProjectExplorer";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Work · Thomas Newman", description: "Computer engineering projects spanning embedded control, sensing, full-stack software, and systems programming." };

export default function Work() {
  return (
    <div className="page-shell">
      <div className="section-heading">
        <div><p className="eyebrow mb-7">Work / Hardware & software</p><h1 className="page-title">From physical signals<br />to <span className="text-chrome-hi/60">working software.</span></h1></div>
        <p className="section-intro">I’m a computer engineering student building across the hardware–software boundary. Explore the sensing, control logic, data, and interfaces behind each project.</p>
      </div>
      <Suspense fallback={<div className="skeleton h-96" role="status" aria-label="Loading project index" />}><ProjectExplorer /></Suspense>
    </div>
  );
}
