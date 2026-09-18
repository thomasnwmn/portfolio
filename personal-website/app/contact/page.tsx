export default function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <p className="font-mono text-[13px] text-chrome-mid mb-6 tracking-wider uppercase">
            COMMUNICATION PROTOCOL
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-paper-0 mb-8">
            Contact
          </h1>
          <p className="text-paper-1 text-lg leading-relaxed mb-12">
            I prefer direct communication. If you have a project in mind, need a consultation, or just want to discuss system architecture, you can reach me directly.
          </p>
          
          <div className="grid gap-px bg-hairline md:grid-cols-2">
            <a href="mailto:tnewman057@gmail.com" className="bg-ink-0 p-8 group transition-colors hover:bg-ink-1 no-underline">
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
        <img src="/banner_outlook.png" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
