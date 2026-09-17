import ParticleBackground from "@/components/ParticleBackground";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden flex items-center">
      <ParticleBackground />
      <div className="relative z-10 w-full mx-auto max-w-7xl px-6 md:px-10 pointer-events-none">
        <div className="pointer-events-auto">
          <p className="font-mono text-[13px] text-chrome-mid mb-4 tracking-wider uppercase">
            System Online
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-paper-0 mb-6 max-w-2xl">
            Building interfaces that are{" "}
            <span className="text-chrome-mid italic">fast, reliable,</span> and{" "}
            <span className="text-paper-1 border-b border-hairline-strong">
              beautifully engineered.
            </span>
          </h1>
          <p className="text-paper-1 text-lg max-w-xl mb-10 leading-relaxed">
            I am a software engineer specializing in full-stack web development,
            performance optimization, and interactive design.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/work"
              className="px-6 py-3 bg-paper-0 text-ink-0 font-semibold text-sm tracking-wide hover:bg-paper-1 transition-colors rounded-sm"
            >
              View Work
            </a>
            <a
              href="/contact"
              className="px-6 py-3 bg-transparent border border-hairline text-paper-0 font-semibold text-sm tracking-wide hover:border-chrome-mid transition-colors rounded-sm"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
