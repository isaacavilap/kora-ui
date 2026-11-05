"use client";
import { useEffect, useRef, useState } from "react";

const WIDTH = 1280;
const HEIGHT = 800;

/** Scales a real desktop-width preview down to the card, so thumbnails never go stale. */
export function TemplateThumb({ slug, name }: { slug: string; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry!.contentRect.width / WIDTH));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative aspect-[8/5] overflow-hidden bg-[var(--kora-bg)]">
      {scale > 0 && (
        <iframe
          title={`${name} thumbnail`}
          src={`/preview/${slug}`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
          style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

