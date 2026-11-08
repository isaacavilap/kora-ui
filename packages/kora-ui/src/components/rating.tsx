import { useState } from "react";
import type { KeyboardEvent } from "react";
import { focusRing } from "./button";
import { fill } from "./labels";
import { cn, useLabels } from "./provider";

export type RatingProps = {
  /** Controlled value, from 0 (none) to max. */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Number of stars. Default 5. */
  max?: number;
  /** 0.5 allows half stars. Default 1. */
  step?: 0.5 | 1;
  /** Shows the value, with no interaction. */
  readOnly?: boolean;
  /** Sent with the form, in a hidden input. */
  name?: string;
  /** Star side in pixels. Default 24. */
  size?: number;
  /** Color of the filled stars. Default amber. */
  color?: string;
  "aria-label"?: string;
  className?: string;
};

const STAR = "M12 2.5l2.92 6.18 6.58.94-4.78 4.57 1.17 6.58L12 17.77l-6.05 3 1.17-6.58L2.5 9.62l6.58-.94z";

/** Snaps to step and stays within 0..max. */
export function snapRating(value: number, max: number, step: number) {
  return Math.min(max, Math.max(0, Math.round(value / step) * step));
}

/** Stars to rate or to show a rating. A slider for assistive tech: arrows, Home and End, in steps of 1 or 0.5. */
export function Rating({ value, defaultValue = 0, onChange, max = 5, step = 1, readOnly, name, size = 24, color = "#f5a524", "aria-label": ariaLabel, className }: RatingProps) {
  const t = useLabels();
  const [own, setOwn] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const current = snapRating(value ?? own, max, step);
  const shown = hover ?? current;
  const text = fill(t.ratingValue, { value: current, max });

  const set = (next: number) => {
    const v = snapRating(next, max, step);
    if (value === undefined) setOwn(v);
    if (v !== current) onChange?.(v);
  };
  // The value under the pointer: the star (or half star) it is on, at least one step.
  const at = (e: { currentTarget: HTMLElement; clientX: number }) => {
    const r = e.currentTarget.getBoundingClientRect();
    const raw = ((e.clientX - r.left) / r.width) * max;
    return Math.max(step, Math.min(max, Math.ceil(raw / step) * step));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const next = { ArrowRight: current + step, ArrowUp: current + step, ArrowLeft: current - step, ArrowDown: current - step, Home: 0, End: max }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    set(next);
  };

  const stars = (
    <span className="kr:relative kr:inline-flex" aria-hidden>
      {Array.from({ length: max }, (_, i) => {
        const part = Math.min(1, Math.max(0, shown - i));
        return (
          <span key={i} className="kr:relative kr:inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} className="kr:absolute kr:inset-0 kr:text-line-strong"><path fill="currentColor" d={STAR} /></svg>
            {part > 0 && (
              <span className="kr:absolute kr:inset-y-0 kr:left-0 kr:overflow-hidden" style={{ width: `${part * 100}%` }}>
                <svg viewBox="0 0 24 24" width={size} height={size}><path fill={color} d={STAR} /></svg>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );

  const hidden = name ? <input type="hidden" name={name} value={current} /> : null;
  if (readOnly) {
    return (
      <span role="img" aria-label={`${ariaLabel ?? t.ratingLabel}: ${text}`} className={cn("kr:inline-flex", className)}>
        {stars}{hidden}
      </span>
    );
  }
  return (
    <span
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel ?? t.ratingLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={text}
      onKeyDown={onKeyDown}
      onPointerMove={(e) => e.pointerType === "mouse" && setHover(at(e))}
      onPointerLeave={() => setHover(null)}
      onClick={(e) => set(at(e))}
      className={cn("kr:inline-flex kr:cursor-pointer kr:touch-manipulation kr:rounded-sm", focusRing, className)}
    >
      {stars}{hidden}
    </span>
  );
}
