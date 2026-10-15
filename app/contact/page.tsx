import Image from "next/image";
import banner from "@/public/banner_outlook.png";
import { getProject } from "@/lib/projects";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact · Thomas Newman" };

type SearchParams = Promise<{ project?: string }>;

function EmailCard({ subject }: { subject?: string }) {
  return (
    <a href={`mailto:tnewman057@gmail.com${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`} className="bg-ink-0 p-6 group transition-colors hover:bg-ink-1 no-underline break-words">
      <p className="font-mono text-[11px] text-paper-2 mb-3">EMAIL</p>
      <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">tnewman057@gmail.com</p>
      <p className="text-paper-1 text-sm">My inbox.</p>
    </a>
  );
}

// ?project= is only known at request time, so this part streams in while the
// rest of the page is served from the prerendered shell.
async function ProjectNote({ searchParams }: { searchParams: SearchParams }) {
  const { project: slug } = await searchParams;
  const project = slug ? await getProject(slug) : undefined;
  if (!project) return null;
  return <p className="mb-8 text-sm text-paper-1">Regarding <span className="text-paper-0">{project.title}</span> - the email link below includes the project in its subject.</p>;
}

async function ProjectEmailCard({ searchParams }: { searchParams: SearchParams }) {
  const { project: slug } = await searchParams;
  const project = slug ? await getProject(slug) : undefined;
  return <EmailCard subject={project ? `Let’s talk about ${project.title}` : undefined} />;
}

export default function Contact({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="page-shell">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <h1 className="page-title mb-8">
            Let’s <span className="text-chrome-hi/60">connect.</span>
          </h1>
          <p className="text-paper-1 text-lg leading-relaxed mb-12">
            For opportunities or collaborations, please reach me directly.
          </p>
          <Suspense><ProjectNote searchParams={searchParams} /></Suspense>

          <div className="grid gap-px bg-hairline">
            <Suspense fallback={<EmailCard />}><ProjectEmailCard searchParams={searchParams} /></Suspense>
            <a href="https://linkedin.com/in/thomasnewmanbeng/" className="bg-ink-0 p-6 group transition-colors hover:bg-ink-1 no-underline break-words">
              <p className="font-mono text-[11px] text-paper-2 mb-3">LINKEDIN</p>
              <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">Thomas Newman</p>
              <p className="text-paper-1 text-sm">Professional network & history.</p>
            </a>
            <a href="https://x.com/nots_uddenly" className="bg-ink-0 p-6 group transition-colors hover:bg-ink-1 no-underline break-words">
              <p className="font-mono text-[11px] text-paper-2 mb-3">X/TWITTER</p>
              <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">nots_uddenly</p>
              <p className="text-paper-1 text-sm">Social media & updates.</p>
            </a>
            <a href="https://github.com/thomasnwmn" target="_blank" rel="noopener noreferrer" className="bg-ink-0 p-6 group transition-colors hover:bg-ink-1 no-underline break-words">
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
