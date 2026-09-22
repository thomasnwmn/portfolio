import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-paper-2">Thomas Newman <span className="mx-2 text-chrome-lo">/</span> Hardware meets software.</p>
        <div className="flex flex-wrap gap-4 text-xs text-paper-1 sm:gap-6 sm:text-sm">
          <Link href="/work" className="hover:text-paper-0">Explore projects ↗</Link>
          <a href="https://github.com/thomasnwmn" target="_blank" rel="noreferrer" className="hover:text-paper-0">GitHub ↗</a>
          <Link href="/contact" className="hover:text-paper-0">Get in touch ↗</Link>
        </div>
      </div>
    </footer>
  );
}
