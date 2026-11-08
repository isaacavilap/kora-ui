import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { FileName } from "./display";
import { FileDropzone } from "./form";
import { fill } from "./labels";
import { cn, useKora, useLabels } from "./provider";

export type CompressOptions = {
  /** Longest side of the result, in pixels. */
  maxSize?: number;
  /** From 0 to 1. */
  quality?: number;
  format?: "image/webp" | "image/jpeg";
};

/** The size that fits inside `max` and keeps the shape. It never makes an image larger. */
export function fitSize(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), resized: scale < 1 };
}

const encode = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Makes an image smaller in the browser, and keeps its rotation.
 * GIF and SVG stay as they are, because this would remove the animation or the vector.
 * Throws if the browser cannot read the file, as Chrome does with HEIC.
 */
export async function compressImage(file: File, { maxSize = 1920, quality = 0.8, format = "image/webp" }: CompressOptions = {}) {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height, resized } = fitSize(bitmap.width, bitmap.height, maxSize);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  const draw = (background?: string) => {
    context.clearRect(0, 0, width, height);
    if (background) {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(bitmap, 0, 0, width, height);
  };

  draw();
  let blob = await encode(canvas, format, quality);
  // Safari cannot write WebP and returns a large PNG. JPEG has no transparency, so it gets a white background.
  if (!blob || blob.type !== format) {
    draw("#fff");
    blob = await encode(canvas, "image/jpeg", quality);
  }
  bitmap.close();
  if (!blob) throw new Error("The image could not be encoded");
  if (!resized && blob.size >= file.size) return file;

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${extension}`, { type: blob.type, lastModified: file.lastModified });
}

type Item = { id: number; file: File; before: number; url: string };

/** Choose or drop images. They are compressed in the browser before you upload them. */
export function ImageInput({ onChange, name, multiple, maxFiles = Infinity, maxSize, quality, format, hint, disabled, className }: CompressOptions & {
  /** Receives the compressed files, each time the list changes. */
  onChange?: (files: File[]) => void;
  /** Sends the compressed files with a normal form. */
  name?: string;
  multiple?: boolean;
  /** With `multiple`, the most images to keep. */
  maxFiles?: number;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const t = useLabels();
  const { locale } = useKora();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const current = useRef<Item[]>([]);
  const nextId = useRef(0);
  const formInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => current.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  const commit = (next: Item[]) => {
    current.current.filter((item) => !next.includes(item)).forEach((item) => URL.revokeObjectURL(item.url));
    current.current = next;
    setItems(next);
    onChange?.(next.map((item) => item.file));
    if (formInput.current) {
      const transfer = new DataTransfer();
      next.forEach((item) => transfer.items.add(item.file));
      formInput.current.files = transfer.files;
    }
  };

  const add = async (files: File[]) => {
    setBusy(true);
    setFailed([]);
    const errors: string[] = [];
    const added: Item[] = [];
    // One at a time, because large photos can use up the memory of a phone.
    for (const file of files) {
      try {
        if (!file.type.startsWith("image/")) throw new Error("Not an image");
        const result = await compressImage(file, { maxSize, quality, format });
        added.push({ id: nextId.current++, file: result, before: file.size, url: URL.createObjectURL(result) });
      } catch {
        errors.push(file.name);
      }
    }
    const merged = multiple ? [...current.current, ...added] : added.slice(0, 1);
    const kept = merged.slice(0, maxFiles);
    merged.slice(maxFiles).forEach((item) => URL.revokeObjectURL(item.url));
    // A failed file must not remove the image that is already there.
    if (added.length) commit(kept);
    setFailed(errors);
    setBusy(false);
  };

  const kb = new Intl.NumberFormat(locale, { style: "unit", unit: "kilobyte", maximumFractionDigits: 0 });
  const mb = new Intl.NumberFormat(locale, { style: "unit", unit: "megabyte", maximumFractionDigits: 1 });
  const size = (bytes: number) => (bytes < 1e6 ? kb.format(Math.max(1, bytes / 1e3)) : mb.format(bytes / 1e6));
  const full = multiple && items.length >= maxFiles;

  return (
    <div className={cn("kr:grid kr:min-w-0 kr:gap-3", className)}>
      <FileDropzone accept="image/*" multiple={multiple} hint={hint} disabled={disabled || busy || full} onFiles={add} />
      {name && <input ref={formInput} type="file" name={name} multiple={multiple} hidden aria-hidden tabIndex={-1} />}
      <div aria-live="polite" className="kr:grid kr:gap-1 kr:text-[0.8125rem] kr:empty:hidden">
        {busy && <p className="kr:text-muted">{t.compressing}</p>}
        {failed.map((file) => <p key={file} className="kr:text-danger">{fill(t.imageFailed, { name: file })}</p>)}
      </div>
      {items.length > 0 && (
        <ul className="kr:grid kr:gap-2">
          {items.map((item) => (
            <li key={item.id} className="kr:flex kr:min-w-0 kr:items-center kr:gap-3 kr:rounded-md kr:border kr:border-line kr:p-2">
              <img src={item.url} alt="" className="kr:size-12 kr:shrink-0 kr:rounded-sm kr:object-cover" />
              <div className="kr:min-w-0 kr:flex-1">
                <FileName name={item.file.name} className="kr:text-sm kr:text-fg" />
                <p className="kr:text-xs kr:text-muted kr:tabular-nums">
                  {item.file.size < item.before ? fill(t.compressedFrom, { size: size(item.file.size), before: size(item.before) }) : size(item.file.size)}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" disabled={disabled} aria-label={`${t.remove} ${item.file.name}`} onClick={() => commit(current.current.filter((other) => other !== item))}>
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
