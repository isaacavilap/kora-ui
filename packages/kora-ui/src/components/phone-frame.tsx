import type { CSSProperties, ReactNode } from "react";
import { cn } from "./provider";

/** Width / height of a current 6.1" phone body (71.5 × 146.6 mm). */
const RATIO = 71.5 / 146.6;

export type PhoneFrameProps = {
  children?: ReactNode;
  /** Largest width in pixels. It shrinks to fit its container. Default 390. */
  width?: number;
  /** Largest height, as a CSS length (for example "calc(100dvh - 120px)"). The width follows it, so the phone is never taller. */
  maxHeight?: string;
  /** Color of the metal edge and the side buttons. Default a dark titanium. */
  frame?: string;
  /** Background of the screen. Default white. */
  screen?: string;
  /** Text color of the status bar: dark on light screens, light on dark ones. Default dark. */
  statusBar?: "dark" | "light" | false;
  /** Time in the status bar. Default 9:41. */
  time?: string;
  /** Shades the top and bottom zones the system uses (status bar with the Dynamic Island, home indicator) and outlines
   *  the safe area: where taps and important content belong. */
  safeArea?: boolean;
  /** Name for screen readers, for example "Preview of the profile". */
  label?: string;
  className?: string;
};

/**
 * A phone like a current iPhone, for previews: metal edge, side buttons, Dynamic Island, status bar and home
 * indicator. It keeps its proportions at any size (every part is in container units) and never grows past its
 * container, nor past maxHeight. The content scrolls up and down inside the screen, below the status bar, never
 * sideways. The screen is a size container: `calc(100cqi / 393)` is one point of a 393-point-wide phone.
 * Every padded layer sets box-sizing itself: kora-ui's reset only reaches elements with kr: classes, and a
 * content-box layer at height 100% plus padding would spill past the metal edge and cut it off at the bottom.
 */
export function PhoneFrame({ children, width = 390, maxHeight, frame = "#3a3a3c", screen = "#fff", statusBar = "dark", time = "9:41", safeArea, label, className }: PhoneFrameProps) {
  const w = maxHeight ? `min(100%, ${width}px, calc(${maxHeight} * ${RATIO.toFixed(4)}))` : `min(100%, ${width}px)`;
  const ink = statusBar === "light" ? "#fff" : "#000";
  // A side button: a thin rounded bar sticking out of the edge. Positions follow the real phone (share of the height).
  const button = (side: "left" | "right", top: number, height: number): CSSProperties => ({
    position: "absolute", [side]: 0, top: `${top}%`, height: `${height}%`, width: "1.6cqw",
    borderRadius: side === "left" ? "1cqw 0 0 1cqw" : "0 1cqw 1cqw 0", background: frame,
    boxShadow: "inset 0 0 0 0.25cqw rgb(255 255 255 / 0.12)",
  });

  // A system zone: content may draw under it, but nothing tappable or important should sit there.
  const zone: CSSProperties = { position: "absolute", left: 0, right: 0, zIndex: 1, pointerEvents: "none",
    background: "repeating-linear-gradient(135deg, rgb(255 59 48 / 0.22) 0 1.2cqw, rgb(255 59 48 / 0.08) 1.2cqw 2.4cqw)" };

  return (
    <div className={cn("kr:mx-auto", className)} style={{ width: w, containerType: "inline-size" }} role={label ? "group" : undefined} aria-label={label}>
      <div style={{ position: "relative", boxSizing: "border-box", aspectRatio: `${RATIO}`, padding: "0 1.2cqw" }}>
        <span aria-hidden style={button("left", 17.5, 4.4)} />
        <span aria-hidden style={button("left", 25, 8)} />
        <span aria-hidden style={button("left", 35, 8)} />
        <span aria-hidden style={button("right", 27, 12.5)} />
        <span aria-hidden style={button("right", 58, 6.5)} />
        {/* Metal edge, then the black glass border, then the screen. */}
        <div style={{
          position: "relative", boxSizing: "border-box", height: "100%", borderRadius: "15.5cqw", padding: "1cqw",
          background: `linear-gradient(135deg, color-mix(in srgb, ${frame} 70%, #fff), ${frame} 30%, ${frame} 70%, color-mix(in srgb, ${frame} 70%, #fff))`,
          boxShadow: "0 8cqw 14cqw -6cqw rgb(0 0 0 / 0.45), 0 0 0 0.25cqw rgb(0 0 0 / 0.35)",
        }}>
          <div style={{ boxSizing: "border-box", height: "100%", borderRadius: "14.5cqw", padding: "3.2cqw", background: "#050505" }}>
            <div style={{ position: "relative", height: "100%", borderRadius: "11.5cqw", overflow: "hidden", background: screen, display: "flex", flexDirection: "column", isolation: "isolate" }}>
              {statusBar !== false && (
                <div aria-hidden style={{ flex: "none", boxSizing: "border-box", height: "12.6cqw", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.6cqw 7cqw 0 9.5cqw", color: ink, fontSize: "4.1cqw", fontWeight: 600, fontFamily: "-apple-system, system-ui, sans-serif", letterSpacing: "-0.02em" }}>
                  <span>{time}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "1.4cqw" }}>
                    <svg viewBox="0 0 18 12" style={{ height: "2.9cqw" }} fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
                    <svg viewBox="0 0 16 12" style={{ height: "2.9cqw" }} fill="currentColor"><path d="M8 2.3c2.4 0 4.6.9 6.2 2.5l1.3-1.3A10.7 10.7 0 0 0 8 .4 10.7 10.7 0 0 0 .5 3.5l1.3 1.3A8.8 8.8 0 0 1 8 2.3Zm0 3.8c1.4 0 2.6.5 3.6 1.4l1.3-1.3A7 7 0 0 0 8 4.2a7 7 0 0 0-4.9 2l1.3 1.3c1-.9 2.2-1.4 3.6-1.4Zm0 3.8c.5 0 .9.2 1.2.5L8 11.6 6.8 10.4c.3-.3.7-.5 1.2-.5Z" /></svg>
                    <svg viewBox="0 0 27 13" style={{ height: "3.1cqw" }}><rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.45" /></svg>
                  </span>
                </div>
              )}
              {/* Dynamic Island */}
              <div aria-hidden style={{ position: "absolute", top: "2.9cqw", left: "50%", transform: "translateX(-50%)", width: "25cqw", height: "7.2cqw", borderRadius: "999px", background: "#000", zIndex: 2 }} />
              {/* A size container: content can use cqi units to scale with the screen, like a real app at any phone size. */}
              <div className="kr:min-h-0 kr:flex-1 kr:overflow-y-auto kr:overflow-x-hidden" style={{ scrollbarWidth: "none", containerType: "inline-size" }}>{children}</div>
              {safeArea && <>
                <div aria-hidden style={{ ...zone, top: 0, height: "12.6cqw" }} />
                <div aria-hidden style={{ ...zone, bottom: 0, height: "7.6cqw" }} />
                <div aria-hidden style={{ position: "absolute", inset: "12.6cqw 0 7.6cqw", outline: "0.4cqw dashed #ff3b30", outlineOffset: "-0.4cqw", pointerEvents: "none", zIndex: 3 }} />
              </>}
              <div aria-hidden style={{ position: "absolute", bottom: "2cqw", left: "50%", transform: "translateX(-50%)", width: "34cqw", height: "1.3cqw", borderRadius: "999px", background: ink, opacity: 0.85, zIndex: 2 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
