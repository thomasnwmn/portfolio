export default function Blog() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-paper-0 mb-8">Writing</h1>
      <div className="flex flex-col border-t border-hairline">
        {[
          { title: "Building an interactive particle background", date: "2026-09-16" },
          { title: "Why minimal design requires more engineering", date: "2026-08-20" },
        ].map((post, i) => (
          <a key={i} href="#" className="group flex flex-wrap items-baseline justify-between gap-4 py-6 border-b border-hairline no-underline">
            <h2 className="text-lg font-medium text-paper-1 group-hover:text-paper-0 transition-colors">
              {post.title}
            </h2>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[12px] text-paper-2">{post.date}</span>
              <span className="font-mono text-[12px] text-paper-2 transition-all group-hover:translate-x-1 group-hover:text-chrome-hi">
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
