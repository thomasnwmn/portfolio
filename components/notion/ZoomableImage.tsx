"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getImageProps } from "next/image";
import { X } from "lucide-react";

// Notion images have unknown dimensions, so these stay plain <img> elements.
// Ones served from the site's own media route still go through the image
// optimizer, so phones download a resized copy rather than the original upload.
function optimized(src: string, sizes: string) {
  if (!src.startsWith("/")) return { src };
  const { props } = getImageProps({ src, alt: "", fill: true, sizes });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}

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
        <img {...optimized(src, "(max-width: 900px) 100vw, 760px")} alt={alt} loading="lazy" decoding="async" />
      </button>
      {/* Portaled so the dialog never lands inside a <p> from the markdown. */}
      {open && createPortal(
        <dialog ref={dialog} className="image-dialog" onClose={() => setOpen(false)} onClick={() => dialog.current?.close()}>
          <img {...optimized(src, "100vw")} alt={alt} />
          <span className="image-dialog-close" aria-hidden="true"><X size={18} /></span>
          {alt && <p>{alt}</p>}
        </dialog>,
        document.body,
      )}
    </>
  );
}
