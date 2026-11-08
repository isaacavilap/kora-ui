"use client";
import { useState } from "react";
import { DocumentList, FileDropzone, Stack } from "kora-ui";

export default function Demo() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <Stack className="max-w-md gap-3">
      <FileDropzone multiple hint="PDF or images, up to 10 MB" onFiles={(added) => setFiles([...files, ...added])} />
      {files.length > 0 && <DocumentList documents={files.map((f) => ({ id: f.name, name: f.name }))} onRemove={(doc) => setFiles(files.filter((f) => f.name !== doc.id))} />}
    </Stack>
  );
}
