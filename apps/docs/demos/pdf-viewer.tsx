"use client";
import { useState } from "react";
import { Button, PdfViewer } from "kora-ui";

const SAMPLE = "/media/ejemplo.pdf";

export default function Demo() {
  const [file, setFile] = useState<string | File>(SAMPLE);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setFile(SAMPLE)}>Ejemplo</Button>
        <Button asChild variant="secondary" size="sm">
          <label className="cursor-pointer">
            Elegir un PDF
            <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
          </label>
        </Button>
      </div>
      <PdfViewer file={file} className="h-[32rem]" />
    </div>
  );
}
