import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell min-h-[70svh]">
      <h1 className="page-title mb-6">That page is off the map.</h1>
      <p className="max-w-xl text-paper-1 leading-relaxed">The link may have changed. You can find the current hardware and software projects in the project index.</p>
      <Link className="button-primary mt-10" href="/work">Explore projects</Link>
    </div>
  );
}
