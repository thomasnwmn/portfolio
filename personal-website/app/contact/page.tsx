export default function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <div className="max-w-2xl">
        <p className="font-mono text-[13px] text-chrome-mid mb-6 tracking-wider uppercase">
          COMMUNICATION PROTOCOL
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-paper-0 mb-8">
          No forms. No funnels.
        </h1>
        <p className="text-paper-1 text-lg leading-relaxed mb-12">
          I prefer direct communication. If you have a project in mind, need a consultation, or just want to discuss system architecture, you can reach me directly.
        </p>
        
        <div className="grid gap-px bg-hairline md:grid-cols-2">
          <a href="mailto:hello@example.com" className="bg-ink-0 p-8 group transition-colors hover:bg-ink-1 no-underline">
            <p className="font-mono text-[11px] text-paper-2 mb-3">EMAIL</p>
            <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">hello@example.com</p>
            <p className="text-paper-1 text-sm">Direct inbox. Read by me.</p>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-ink-0 p-8 group transition-colors hover:bg-ink-1 no-underline">
            <p className="font-mono text-[11px] text-paper-2 mb-3">LINKEDIN</p>
            <p className="text-paper-0 font-medium text-lg mb-1 group-hover:text-chrome-hi transition-colors">Thomas Newman</p>
            <p className="text-paper-1 text-sm">Professional network & history.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
