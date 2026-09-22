import type { Project } from "@/lib/projects";
import Image from "next/image";

export default function ProjectVisual({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <div className={`project-visual ${large ? "project-visual-large" : ""}`} aria-hidden="true">
      <Image 
        src={project.image}
        alt={project.title}
        fill
        className="object-cover"
      />
    </div>
  );
}
