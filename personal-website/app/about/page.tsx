import {GitHubCalendar} from 'react-github-calendar';

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-paper-0 mb-8">About</h1>
          <div className="text-paper-1 space-y-6 leading-relaxed">
            <p>
              I am currently a third-year Computer Engineering student at the Lassonde School of Engineering at York University with a passion for RISC-V and system design.  I have experience in a variety of programming languages, including Python, C/C++, Java, Typescript.
            </p>
            <p> I have previously worked as a Outreach Programs Instructor at the University of Toronto during the summer of 2025 and 2026.  Prior to that, I worked as a Depth Correction Officer at GeologicAI (2023 - 2024), where I worked with geological data and AI tools.</p>
            <p>
              My approach focuses on engineering excellence and practical solutions. I believe that powerful systems require a deeply considered architecture underneath.
            </p>
          </div>
          {/* Added CSS overrides so the SVG scales down to fit the container without scrolling */}
          <div className="p-4 bg-ink-0 text-paper-0 rounded-md w-full overflow-hidden [&_svg]:!w-full [&_svg]:!h-auto [&_svg]:!min-w-[0px]">
            <GitHubCalendar 
              username="thomasnwmn" 
              colorScheme="dark" 
            />
          </div>
        </div>
        <div>
          <img src="/aboutme.png" className="w-full h-full object-contain" />
          <p className="font-mono text-[11px] text-chrome-mid mb-6 tracking-wider uppercase">
            Capabilities
          </p>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Java", "Python", "C/C++", "Git", "System Architecture", "RISC-V", "Digital Logic Design"].map(skill => (
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
