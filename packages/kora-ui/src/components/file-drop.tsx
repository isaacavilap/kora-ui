import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Camera, FileUp, Upload } from "lucide-react";
import { Button } from "./button";
import { cn, useLabels } from "./provider";

export type FileDropProps = {
  /** Name of the hidden file input, so a plain form submits the file. Default "file". */
  name?: string;
  /** MIME types allowed, such as ["image/png", "application/pdf"]. Default any. Check again on the server. */
  accept?: string[];
  /** Largest size in bytes. Default no limit. */
  maxSize?: number;
  /** Called with a valid file as soon as it is chosen, dropped, pasted, or photographed. */
  onFile?: (file: File) => void;
  /** Big line in the middle. Default "Upload your document". */
  title?: ReactNode;
  /** Small line at the bottom, such as the formats and the size limit. */
  hint?: ReactNode;
  /** "Take photo" button on touch screens, which opens the rear camera. Default true. */
  camera?: boolean;
  /** Take a file pasted anywhere on the page (Cmd+V / Ctrl+V), such as a screenshot. Default true. */
  paste?: boolean;
  className?: string;
};

/** "10 MB", "500 KB". */
export function formatBytes(n: number) {
  return n >= 1024 * 1024 ? `${Math.round((n / 1024 / 1024) * 10) / 10} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

/**
 * A large zone for one document: drop it, choose it, paste it, or photograph it on a phone.
 * It keeps a hidden file input with `name`, so a form submits the file as is.
 */
export function FileDrop({ name = "file", accept, maxSize, onFile, title, hint, camera = true, paste = true, className }: FileDropProps) {
  const t = useLabels();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);

  const assign = (f: File | null | undefined) => {
    setError(null);
    if (!f) return;
    if (accept?.length && !accept.includes(f.type)) return setError(t.fileDropBadType);
    if (maxSize && f.size > maxSize) return setError(t.fileDropTooBig.replace("{max}", formatBytes(maxSize)));
    // Put it in the named input, so the form sends it even when it came from a drop or a paste.
    const dt = new DataTransfer();
    dt.items.add(f);
    if (input.current) input.current.files = dt.files;
    setChosen(f.name);
    onFile?.(f);
  };
  const latest = useRef(assign);
  latest.current = assign;

  useEffect(() => {
    if (!paste) return;
    const onPaste = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files ?? [])][0];
      if (f) {
        e.preventDefault();
        latest.current(f);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [paste]);

  return (
    <div className={cn("kr:grid kr:gap-2", className)}>
      <input ref={input} id={id} name={name} type="file" accept={accept?.join(",")} className="kr:sr-only" tabIndex={-1} onChange={(e) => assign(e.target.files?.[0])} />
      {camera && <input id={`${id}-cam`} type="file" accept="image/*" capture="environment" className="kr:sr-only" tabIndex={-1} onChange={(e) => assign(e.target.files?.[0])} />}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          assign(e.dataTransfer.files[0]);
        }}
        className={cn(
          "kr:group kr:relative kr:flex kr:flex-col kr:items-center kr:justify-center kr:gap-5 kr:overflow-hidden kr:rounded-lg kr:border-2 kr:border-dashed kr:px-6 kr:py-12 kr:text-center kr:transition-[background-color,border-color,transform,box-shadow] kr:duration-200 kr:sm:py-16",
          over ? "kr:scale-[1.01] kr:border-accent kr:bg-accent-soft kr:shadow-overlay" : "kr:border-line-strong kr:bg-surface kr:hover:border-accent/50",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "kr:pointer-events-none kr:absolute kr:inset-0 kr:bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--kora-accent)_12%,transparent),transparent_65%)] kr:transition-opacity kr:duration-200",
            over ? "kr:opacity-100" : "kr:opacity-0 kr:group-hover:opacity-100",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "kr:relative kr:flex kr:size-16 kr:items-center kr:justify-center kr:rounded-lg kr:bg-accent-soft kr:text-accent",
            over ? "kr:animate-[kr-bob_700ms_ease-in-out_infinite]" : "kr:animate-[kr-float_3.2s_ease-in-out_infinite]",
          )}
        >
          <Upload className="kr:size-7" strokeWidth={1.75} />
        </span>
        <p className="kr:relative kr:m-0 kr:text-lg kr:font-medium kr:text-fg">{over ? t.fileDropOver : (title ?? t.fileDropTitle)}</p>
        <div className="kr:relative kr:flex kr:w-full kr:max-w-xs kr:flex-col kr:gap-3 kr:pointer-coarse:flex-col-reverse">
          {/* On phones the camera is the main action, so "Choose file" steps back to a secondary look. */}
          <Button asChild size="lg" className={camera ? "kr:pointer-coarse:border kr:pointer-coarse:border-line-strong kr:pointer-coarse:bg-surface kr:pointer-coarse:text-fg" : undefined}>
            <label htmlFor={id} className="kr:cursor-pointer"><FileUp aria-hidden /> {t.fileDropPick}</label>
          </Button>
          {camera && (
            <Button asChild size="lg" className="kr:hidden kr:pointer-coarse:inline-flex">
              <label htmlFor={`${id}-cam`} className="kr:cursor-pointer"><Camera aria-hidden /> {t.fileDropPhoto}</label>
            </Button>
          )}
        </div>
        <p className="kr:relative kr:m-0 kr:text-sm kr:text-muted kr:pointer-coarse:hidden">{paste ? t.fileDropDragPaste : t.fileDropDrag}</p>
        {chosen && <p className="kr:relative kr:m-0 kr:max-w-full kr:truncate kr:text-sm kr:font-medium kr:text-fg">{chosen}</p>}
        {hint && <p className="kr:relative kr:m-0 kr:text-xs kr:text-muted">{hint}</p>}
      </div>
      {error && <p className="kr:m-0 kr:text-sm kr:text-danger" role="alert">{error}</p>}
    </div>
  );
}
