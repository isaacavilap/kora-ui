"use client";
import { useState } from "react";
import { FileDrop } from "kora-ui";

export default function Demo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <FileDrop
        accept={["image/jpeg", "image/png", "image/webp", "application/pdf"]}
        maxSize={10 * 1024 * 1024}
        hint="JPEG, PNG, WEBP o PDF · máx. 10 MB"
        onFile={(f) => setLast(`${f.name} · ${Math.round(f.size / 1024)} KB`)}
      />
      {last && <p className="text-sm text-[var(--kora-muted)]">onFile: {last}</p>}
    </div>
  );
}
