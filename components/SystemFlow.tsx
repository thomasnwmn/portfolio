import type { CSSProperties } from "react";

// Renders "A -> B -> C" as the animated system flow strip.
export default function SystemFlow({ steps, caption }: { steps: string[]; caption?: string }) {
  return (
    <figure className="not-prose my-10">
      <ol className="system-flow" style={{ "--steps": steps.length } as CSSProperties}>
        {steps.map((step, i) => (
          <li key={`${step}-${i}`}>
            <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
            <span>{step}</span>
            {i < steps.length - 1 && <span className="flow-arrow" aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>
      {caption && <figcaption className="mt-4 text-xs text-paper-2">{caption}</figcaption>}
    </figure>
  );
}

export function parseFlow(source: string) {
  return source.replace(/^\s*flow\s*:/i, "").split(/->|→/).map(step => step.trim()).filter(Boolean);
}
