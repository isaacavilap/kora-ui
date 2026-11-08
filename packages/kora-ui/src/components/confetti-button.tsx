import { forwardRef } from "react";
import { Button, type ButtonProps } from "./button";

export type ConfettiOptions = {
  /** How many pieces. Default 80. */
  particles?: number;
  /** Colors of the pieces. Default the chart colors of the theme. */
  colors?: string[];
};

const FALLBACK = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];

function themeColors() {
  const css = getComputedStyle(document.documentElement);
  const colors = [1, 2, 3, 4, 5, 6].map((i) => css.getPropertyValue(`--kora-chart-${i}`).trim()).filter(Boolean);
  return colors.length ? colors : FALLBACK;
}

/**
 * Throws confetti from a point of the viewport, on a canvas that removes itself when the last piece falls.
 * Does nothing for people who ask for reduced motion. Returns a promise that settles when it ends.
 */
export function burstConfetti(x: number, y: number, { particles = 80, colors }: ConfettiOptions = {}): Promise<void> {
  if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth, h = window.innerHeight;
  Object.assign(canvas, { width: w * dpr, height: h * dpr });
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: `${w}px`, height: `${h}px`, pointerEvents: "none", zIndex: "2147483647" });
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);

  const palette = colors?.length ? colors : themeColors();
  // Mostly up, in a 110° fan; pixels per frame at 60 fps.
  const pieces = Array.from({ length: particles }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.6);
    const speed = 7 + Math.random() * 7;
    return {
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 5, spin: Math.random() * Math.PI, vspin: (Math.random() - 0.5) * 0.3,
      color: palette[Math.floor(Math.random() * palette.length)]!, round: Math.random() < 0.3,
    };
  });

  return new Promise((resolve) => {
    const start = performance.now();
    let prev = start;
    const frame = (now: number) => {
      const k = Math.min(3, (now - prev) / 16.67); // steady speed on 120 Hz screens and after a slow frame
      prev = now;
      const life = (now - start) / 1600;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, life - 0.6) / 0.4);
      for (const p of pieces) {
        p.vx *= 0.98 ** k; p.vy = p.vy * 0.98 ** k + 0.3 * k;
        p.x += p.vx * k; p.y += p.vy * k; p.spin += p.vspin * k;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (life < 1) requestAnimationFrame(frame);
      else { canvas.remove(); resolve(); }
    };
    requestAnimationFrame(frame);
  });
}

export type ConfettiButtonProps = ButtonProps & ConfettiOptions;

/** A Button that throws confetti from itself on click, for a moment worth celebrating. Calm with reduced motion. */
export const ConfettiButton = forwardRef<HTMLButtonElement, ConfettiButtonProps>(function ConfettiButton({ particles, colors, onClick, ...props }, ref) {
  return (
    <Button
      ref={ref}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        void burstConfetti(r.left + r.width / 2, r.top + r.height / 2, { particles, colors });
        onClick?.(e);
      }}
      {...props}
    />
  );
});
