import type { Project } from "@/lib/projects";
import Image from "next/image";

export default function ProjectVisual({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <div className={`project-visual ${large ? "project-visual-large" : ""}`} aria-hidden="true">
      {project.image ? (
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes={large ? "(max-width: 1280px) 100vw, 1280px" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover"
        />
      ) : (
        // No Notion cover yet: fall back to the blueprint grid with the title.
        <><div className="visual-grid" /><p className="visual-caption"><span>{project.title}</span><span className="signal-dot" /></p></>
      )}
    </div>
  );
}
