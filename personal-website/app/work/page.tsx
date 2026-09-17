export default function Work() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <div className="mb-16">
        <p className="font-mono text-[13px] text-chrome-mid mb-6 tracking-wider uppercase">
          THE REGISTRY
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-paper-0 mb-6">
          My Work.
        </h1>
        <p className="text-paper-1 text-lg max-w-2xl leading-relaxed">
          My work focuses on system architecture, embedded systems, and artificial intelligence, with a strong emphasis on performance, reliability, and user experience.
        </p>
      </div>

      <p className="font-mono text-[11px] text-paper-2 mb-8 tracking-widest uppercase">
        04 BAYS · CURRENT PROJECTS
      </p>

      <div className="grid gap-px bg-hairline md:grid-cols-2 lg:grid-cols-2 border-t border-hairline">
        {[
          {
            title: "Automatic Wall-Avoiding Robot",
            desc: "An autonomous robot that uses sensors and DC motors to navigate and avoid obstacles in its evnironment.",
            tags: ["C++", "Arduino", "Motors"]
          },
          {
            title: "Autonomous Plant-Watering System",
            desc: "A system that automatically waters plants based on soil moisture levels and environmental conditions.",
            tags: ["Java", "I2C", "IoT"]
          },
          {
            title: "Pantry App",
            desc: "A web application that allows users to manage their pantry inventory, track expiration dates, and receive notifications for low-stock items.",
            tags: ["Next.JS", "Stripe", "Supabase"]
          },
          {
            title: "WUWA Builds",
            desc: "A database website that stores all of my current WUWA builds, including their specific stats, weapons, and echoes for each resonator.",
            tags: ["NEXT.js", "SUPABASE", "python"]
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
