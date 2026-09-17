export default function Work() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <div className="mb-16">
        <p className="font-mono text-[13px] text-chrome-mid mb-6 tracking-wider uppercase">
          THE REGISTRY
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-paper-0 mb-6">
          One spine, four facets.
        </h1>
        <p className="text-paper-1 text-lg max-w-2xl leading-relaxed">
          Everything below is the same discipline pointed at a different surface: make systems legible — to people, to the architecture, and to the agents doing the reading now.
        </p>
      </div>

      <p className="font-mono text-[11px] text-paper-2 mb-8 tracking-widest uppercase">
        04 BAYS · LIVE SCALE MODELS
      </p>

      <div className="grid gap-px bg-hairline md:grid-cols-2 lg:grid-cols-2 border-t border-hairline">
        {[
          {
            title: "Performance Engineering",
            desc: "Full-stack optimization, bringing server response times from 2.2s down to 47ms through aggressive caching and edge computing.",
            tags: ["next.js", "redis", "edge"]
          },
          {
            title: "System Architecture",
            desc: "Designed and implemented distributed microservices that scale effortlessly under heavy load while maintaining zero downtime.",
            tags: ["kubernetes", "go", "grpc"]
          },
          {
            title: "Interactive Interfaces",
            desc: "Building WebGL and canvas-based interactions that are highly performant and visually stunning.",
            tags: ["three.js", "webgl", "framer"]
          },
          {
            title: "AI Integration",
            desc: "Connecting language models into production pipelines, building agentic systems that can read, reason, and execute.",
            tags: ["openai", "agents", "python"]
          }
        ].map((item, i) => (
          <div key={i} className="bg-ink-0 p-10 group cursor-pointer transition-colors hover:bg-ink-1">
            <div className="flex justify-between items-baseline mb-6">
              <p className="font-mono text-[11px] text-paper-2">0{i + 1}</p>
              <span className="font-mono text-[12px] text-paper-2 transition-all group-hover:translate-x-1 group-hover:text-chrome-hi">
                →
              </span>
            </div>
            <h2 className="text-2xl font-medium text-paper-0 mb-4">{item.title}</h2>
            <p className="text-paper-1 text-[15px] leading-relaxed mb-10 min-h-[80px]">
              {item.desc}
            </p>
            <div className="flex gap-3">
              {item.tags.map(tag => (
                <span key={tag} className="font-mono text-[10px] text-chrome-mid border border-hairline px-2 py-1 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
