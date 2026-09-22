"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell min-h-[70svh]">
      <p className="eyebrow mb-8">Connection interrupted</p>
      <h1 className="page-title mb-6">Let’s try that again.</h1>
      <p className="text-paper-1">This page couldn’t load. You can retry or keep exploring the projects.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button className="button-primary" onClick={reset}>Try again ↻</button>
        <Link className="button-secondary" href="/work">Explore projects ↗</Link>
      </div>
    </div>
  );
}
