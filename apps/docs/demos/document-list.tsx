"use client";
import { useState } from "react";
import { DocumentList } from "kora-ui";

export default function Demo() {
  const [documents, setDocuments] = useState([
    { id: "1", name: "quote-compressor.pdf", meta: "240 KB, added Oct 26", href: "#" },
    { id: "2", name: "fridge-photo.jpg", meta: "1.2 MB, added Oct 26", href: "#" },
    { id: "3", name: "contract-with-supplier-signed-by-both-parties-final-version-october-2026.pdf", meta: "3.1 MB, added Oct 28", href: "#" },
  ]);
  return <DocumentList className="max-w-md" documents={documents} empty="No documents yet." onRemove={(doc) => setDocuments(documents.filter((d) => d.id !== doc.id))} />;
}
