"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Notion images have unknown dimensions, so these stay plain <img> elements.
/* eslint-disable @next/next/no-img-element */
export default function ZoomableImage({ src, alt = "" }: { src?: string; alt?: string }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  if (!src) return null;
  return (
    <>
      <button type="button" className="zoomable-image" onClick={() => setOpen(true)} aria-label={alt ? `Enlarge image: ${alt}` : "Enlarge image"}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      </button>
      {/* Portaled so the dialog never lands inside a <p> from the markdown. */}
      {open && createPortal(
        <dialog ref={dialog} className="image-dialog" onClose={() => setOpen(false)} onClick={() => dialog.current?.close()}>
          <img src={src} alt={alt} />
          <span className="image-dialog-close" aria-hidden="true"><X size={18} /></span>
          {alt && <p>{alt}</p>}
        </dialog>,
        document.body,
      )}
    </>
  );
}
