"use client";
import { Check, Copy } from "lucide-react";
import { useCopy } from "kora-ui";

/** Copy button in the corner of a code block. */
export function CopyCode({ code }: { code: string }) {
  // One line: centered vertically. Several lines: top corner.
  const pos = code.trim().includes("\n") ? "top-1.5" : "top-1/2 -translate-y-1/2";
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(code)}
      aria-label={copied ? "Copied" : "Copy code"}
      className={`absolute ${pos} right-1.5 flex size-8 items-center justify-center rounded-md border border-[var(--kora-line)] bg-[var(--kora-surface)] text-[var(--kora-muted)] transition-colors hover:text-[var(--kora-fg)]`}
    >
      {copied ? <Check className="size-4 text-[var(--kora-accent)]" /> : <Copy className="size-4" />}
    </button>
  );
}
