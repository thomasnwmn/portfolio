import type { Metadata } from "next";
import ProjectExplorer, { ProjectIndex } from "@/components/ProjectExplorer";
import { Suspense } from "react";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Work · Thomas Newman", description: "Computer engineering projects spanning embedded control, sensing, full-stack software, and systems programming." };

export default async function Work() {
  const projects = await getProjects();
  return (
    <div className="page-shell">
      <div className="section-heading">
        <div><h1 className="page-title">The <span className="text-chrome-hi/60">Projects.</span></h1></div>
        <p className="section-intro">I’m a computer engineering student building across the hardware-software boundary. Explore the sensing, control logic, data, and interfaces behind each project.</p>
      </div>
      <Suspense fallback={<ProjectIndex projects={projects} />}><ProjectExplorer projects={projects} /></Suspense>
    </div>
  );
}
