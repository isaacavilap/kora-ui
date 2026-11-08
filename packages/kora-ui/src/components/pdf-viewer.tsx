import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "./button";
import { cn, useLabels } from "./provider";

export type PdfViewerProps = {
  /** A link to the PDF, or a File or Blob, for example from a file input. */
  file: string | Blob | null;
  /** Name shown in the bar, and the name of the download. Default the file name. */
  title?: string;
  /** Page to open on. Default 1. */
  page?: number;
  className?: string;
};

/** The address to load, or null when it isn't http(s), blob, or a relative path. */
export function pdfSource(src: string, base = typeof location === "undefined" ? "http://localhost" : location.href) {
  try {
    const url = new URL(src, base);
    return ["http:", "https:", "blob:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function useFileUrl(file: string | Blob | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setUrl(null);
    if (typeof file === "string") return setUrl(pdfSource(file));
    const blob = URL.createObjectURL(file);
    setUrl(blob);
    return () => URL.revokeObjectURL(blob);
  }, [file]);
  return url;
}

/**
 * A PDF in the browser's own viewer, with no extra library: zoom, search, and print come from the browser.
 * Where the browser can't show PDFs inline, as on some phones, it offers to open or download the file.
 */
export function PdfViewer({ file, title, page = 1, className }: PdfViewerProps) {
  const t = useLabels();
  const url = useFileUrl(file);
  // pdfViewerEnabled is false on browsers that download PDFs instead of showing them. Unknown counts as yes.
  const [inline, setInline] = useState(true);
  useEffect(() => setInline(navigator.pdfViewerEnabled !== false), []);

  const name = title ?? (file instanceof File ? file.name : typeof file === "string" ? decodeURIComponent(file.split(/[?#]/)[0]!.split("/").pop() || "") : "");
  const label = name || t.pdfLabel;

  if (!file || !url) {
    return (
      <div className={cn("kr:grid kr:min-h-64 kr:place-items-center kr:rounded-lg kr:border kr:border-dashed kr:border-line-strong kr:p-6 kr:text-sm kr:text-muted", className)}>
        {t.pdfEmpty}
      </div>
    );
  }

  const actions = (
    <>
      <Button asChild variant="ghost" size="sm">
        <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden />{t.pdfOpen}</a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={url} download={name}><Download aria-hidden />{t.pdfDownload}</a>
      </Button>
    </>
  );

  return (
    <figure className={cn("kr:m-0 kr:flex kr:min-h-96 kr:flex-col kr:overflow-hidden kr:rounded-lg kr:border kr:border-line kr:bg-surface", className)}>
      <figcaption className="kr:flex kr:items-center kr:gap-2 kr:border-b kr:border-line kr:py-1.5 kr:pr-1.5 kr:pl-3">
        <FileText aria-hidden className="kr:size-4 kr:shrink-0 kr:text-muted" />
        <span className="kr:min-w-0 kr:flex-1 kr:truncate kr:text-sm kr:font-medium kr:text-fg">{label}</span>
        {actions}
      </figcaption>
      {inline ? (
        <iframe src={`${url}#page=${Math.max(1, Math.floor(page))}`} title={label} className="kr:w-full kr:flex-1 kr:border-0 kr:bg-surface-2" />
      ) : (
        <div className="kr:grid kr:flex-1 kr:place-items-center kr:gap-3 kr:p-6 kr:text-center kr:text-sm kr:text-muted">
          <p className="kr:m-0">{t.pdfUnsupported}</p>
        </div>
      )}
    </figure>
  );
}
