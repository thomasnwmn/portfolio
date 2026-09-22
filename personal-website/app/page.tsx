import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";

export default function Home() {
  return (
    <div className="home-page relative overflow-hidden flex items-center">
      <ParticleBackground />
      <div className="relative z-10 w-full mx-auto max-w-7xl px-6 md:px-10 pointer-events-none">
        <div className="home-copy pointer-events-auto">
          <p className="eyebrow home-eyebrow">Thomas Newman / Computer engineering</p>
          <h1 className="home-title">Engineering systems<br />from <span className="text-chrome-hi/65">silicon</span><br />to <span className="text-chrome-hi/65 italic">software.</span></h1>
          <p className="home-description text-paper-1 max-w-lg leading-relaxed">Computer engineering student exploring RISC-V, embedded systems, and the software that brings hardware to life.</p>
          <div className="home-actions flex flex-wrap gap-3">
            <Link href="/work" className="button-primary">Explore my work <span aria-hidden="true">↗</span></Link>
            <Link href="/contact" className="button-secondary">Get in touch <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
