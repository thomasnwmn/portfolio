import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell min-h-[70svh]">
      <p className="eyebrow mb-8">404 / No signal</p>
      <h1 className="page-title mb-6">That page is off the map.</h1>
      <p className="max-w-xl text-paper-1 leading-relaxed">The link may have changed. You can find the current hardware and software projects in the project index.</p>
      <Link className="button-primary mt-10" href="/work">Explore projects <span aria-hidden="true">↗</span></Link>
    </div>
  );
}
