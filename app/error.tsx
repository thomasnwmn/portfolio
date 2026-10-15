"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/arc/button/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell min-h-[70svh]">
      <h1 className="page-title mb-6">Let’s try that again.</h1>
      <p className="text-paper-1">This page couldn’t load. You can retry or keep exploring the projects.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button size="lg" onClick={reset}><RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />Try again</Button>
        <Link className="button-secondary" href="/work">Explore projects</Link>
      </div>
    </div>
  );
}
