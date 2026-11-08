"use client";
import { useState } from "react";
import { Button, FileDrop, Inline, PdfViewer, Stack } from "kora-ui";

const SAMPLE = "/media/ejemplo.pdf";

export default function Demo() {
  const [file, setFile] = useState<string | File>(SAMPLE);
  return (
    <Stack gap="sm" className="w-full max-w-2xl">
      <Inline>
        <Button variant="secondary" size="sm" onClick={() => setFile(SAMPLE)}>Ejemplo</Button>
        <FileDrop accept={["application/pdf"]} title="Elegir un PDF" camera={false} onFile={setFile} className="min-w-0 flex-1" />
      </Inline>
      <PdfViewer file={file} className="h-[32rem]" />
    </Stack>
  );
}
