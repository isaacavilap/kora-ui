import { describe, expect, it } from "vitest";
import { contrastRatio, mixColors, textOn, themeColorsCss } from "./theme-colors";

const value = (css: string, block: string, name: string) => new RegExp(`${block.replace(/[.[\]]/g, "\\$&")}\\{[^}]*${name}:(#[0-9a-f]{6})`).exec(css)?.[1] ?? "";

describe("themeColorsCss", () => {
  it("writes nothing for a color it cannot read, so nothing can be injected", () => {
    expect(themeColorsCss({})).toBe("");
    expect(themeColorsCss({ primary: "red}body{display:none" })).toBe("");
    expect(themeColorsCss({ primary: "#12345" })).toBe("");
  });

  it("keeps a dark color as it is on light, and makes it readable on dark", () => {
    const css = themeColorsCss({ primary: "#7B2D26" });
    expect(value(css, ":root", "--kora-accent")).toBe("#7b2d26");
    expect(contrastRatio(value(css, ".dark", "--kora-accent"), "#111113")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps a light color readable as text on white, and its button text readable", () => {
    const css = themeColorsCss({ primary: "#f5d90a" });
    const accent = value(css, ":root", "--kora-accent");
    expect(contrastRatio(accent, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(value(css, ":root", "--kora-accent-fg"), accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("uses a light second color as the soft color, and only a tint of a dark one", () => {
    expect(value(themeColorsCss({ primary: "#7b2d26", secondary: "#F7F1E1" }), ":root", "--kora-accent-soft")).toBe("#f7f1e1");
    expect(contrastRatio(value(themeColorsCss({ primary: "#7b2d26", secondary: "#101010" }), ":root", "--kora-accent-soft"), "#09090b")).toBeGreaterThanOrEqual(4.5);
  });

  it("paints the menu only when asked, with readable text", () => {
    expect(themeColorsCss({ primary: "#7b2d26", menu: "default" })).not.toContain("data-kora-menu");
    const css = themeColorsCss({ primary: "#7b2d26", secondary: "#f7f1e1", menu: "primary" });
    expect(value(css, "[data-kora-menu]", "--kora-surface")).toBe("#7b2d26");
    expect(contrastRatio(value(css, "[data-kora-menu]", "--kora-fg"), "#7b2d26")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(value(css, "[data-kora-menu]", "--kora-muted"), "#7b2d26")).toBeGreaterThanOrEqual(4.5);
    expect(themeColorsCss({ secondary: "#f7f1e1", menu: "secondary" })).toContain(".dark [data-kora-menu]");
  });

  it("stays only on the screen", () => {
    expect(themeColorsCss({ primary: "#7b2d26" }).startsWith("@media screen{")).toBe(true);
  });
});

describe("color helpers", () => {
  it("mixes and picks the text", () => {
    expect(mixColors("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(textOn("#7b2d26")).toBe("#ffffff");
    expect(textOn("#f7f1e1")).toBe("#09090b");
  });
  it("scales the text with the root size, only inside the range", () => {
    expect(themeColorsCss({ textScale: 112.5 })).toBe("@media screen{html{font-size:112.5%}}");
    expect(themeColorsCss({ textScale: 100 })).toBe("");
    expect(themeColorsCss({ textScale: 400 })).toBe("");
    expect(themeColorsCss({ textScale: Number.NaN })).toBe("");
  });
});
