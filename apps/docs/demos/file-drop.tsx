"use client";
import { useState } from "react";
import { FileDrop, Stack, Text } from "kora-ui";

export default function Demo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stack gap="sm" className="w-full max-w-xl">
      <FileDrop
        accept={["image/jpeg", "image/png", "image/webp", "application/pdf"]}
        maxSize={10 * 1024 * 1024}
        hint="JPEG, PNG, WEBP o PDF · máx. 10 MB"
        onFile={(f) => setLast(`${f.name} · ${Math.round(f.size / 1024)} KB`)}
      />
      {last && <Text tone="muted">onFile: {last}</Text>}
    </Stack>
  );
}
