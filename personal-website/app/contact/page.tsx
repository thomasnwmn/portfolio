import Image from "next/image";
import banner from "@/public/banner_outlook.png";
import { getProject } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact · Thomas Newman" };

export default async function Contact({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project: slug } = await searchParams;
  const project = slug ? getProject(slug) : undefined;
  const emailHref = `mailto:tnewman057@gmail.com${project ? `?subject=${encodeURIComponent(`Let’s talk about ${project.title}`)}` : ""}`;
  return (
    <div className="page-shell">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <p className="font-mono text-[13px] text-chrome-mid mb-6 tracking-wider uppercase">
            COMMUNICATION PROTOCOL
          </p>
          <h1 className="page-title mb-8">
            Let’s connect.
          </h1>
          <p className="text-paper-1 text-lg leading-relaxed mb-12">
            For engineering opportunities, project collaborations, or a conversation about embedded systems and software, reach me directly.
          </p>
          {project && <p className="mb-8 text-sm text-paper-1">Regarding <span className="text-paper-0">{project.title}</span> — the email link below includes the project in its subject.</p>}
          
          <div className="grid gap-px bg-hairline">
            <a href={emailHref} className="bg-ink-0 p-6 group transition-colors hover:bg-ink-1 no-underline break-words">
              <p className="font-mono text-[11px] text-paper-2 mb-3">EMAIL</p>
              <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">tnewman057@gmail.com</p>
              <p className="text-paper-1 text-sm">Direct inbox. Read by me.</p>
            </a>
            <a href="https://linkedin.com/in/thomasnewmanbeng/" target="_blank" rel="noopener noreferrer" className="bg-ink-0 p-8 group transition-colors hover:bg-ink-1 no-underline">
              <p className="font-mono text-[11px] text-paper-2 mb-3">LINKEDIN</p>
              <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">Thomas Newman</p>
              <p className="text-paper-1 text-sm">Professional network & history.</p>
            </a>
            <a href="https://x.com/nots_uddenly" target="_blank" rel="noopener noreferrer" className="bg-ink-0 p-8 group transition-colors hover:bg-ink-1 no-underline">
              <p className="font-mono text-[11px] text-paper-2 mb-3">X/TWITTER</p>
              <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">Thomas Newman</p>
              <p className="text-paper-1 text-sm">Social media & updates.</p>
            </a>
            <a href="https://github.com/thomasnwmn" target="_blank" rel="noopener noreferrer" className="bg-ink-0 p-8 group transition-colors hover:bg-ink-1 no-underline">
              <p className="font-mono text-[11px] text-paper-2 mb-3">GITHUB</p>
              <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">thomasnwmn</p>
              <p className="text-paper-1 text-sm">Projects & contributions.</p>
            </a>
          </div>
        </div>
        <Image src={banner} alt="A forested valley beneath a blue, cloud-filled sky" placeholder="blur" sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto self-start" />
      </div>
    </div>
  );
}
