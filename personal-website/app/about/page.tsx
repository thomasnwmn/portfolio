export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-paper-0 mb-8">About</h1>
          <div className="text-paper-1 space-y-6 leading-relaxed">
            <p>
              I&apos;m a software engineer who builds fast, interactive, and beautifully designed web experiences.
            </p>
            <p>
              My approach focuses on engineering excellence and a minimalist aesthetic. I believe that a clean user interface requires a deeply considered architecture underneath.
            </p>
            <p>
              When I&apos;m not writing code, I enjoy exploring new technologies and writing about my findings.
            </p>
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] text-chrome-mid mb-6 tracking-wider uppercase">
            Capabilities
          </p>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "System Architecture"].map(skill => (
              <span key={skill} className="font-mono text-[12px] border border-hairline bg-ink-1 px-3 py-1.5 text-paper-1">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
