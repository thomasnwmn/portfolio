"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";

// The error boundary ships with every route, so it uses the CSS button rather
// than the animated Arc one to keep motion out of the shared bundle.
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell min-h-[70svh]">
      <h1 className="page-title mb-6">Let’s try that again.</h1>
      <p className="text-paper-1">This page couldn’t load. You can retry or keep exploring the projects.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" className="button-primary" onClick={reset}><RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />Try again</button>
        <Link className="button-secondary" href="/work">Explore projects</Link>
      </div>
    </div>
  );
}
