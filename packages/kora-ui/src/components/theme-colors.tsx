/* The colors and text size of a client, set while the app runs. A saved color that cannot be read leaves the library colors. */

export type MenuColor = "default" | "primary" | "secondary";
export type ThemeColorsProps = {
  primary?: string; secondary?: string; menu?: MenuColor;
  /** Size of all the text and controls, in percent of the browser size. From 87.5 to 150. */
  textScale?: number;
};

const WHITE = "#ffffff";
const INK = "#09090b";
const DARK_SURFACE = "#111113";
const isHex = (value?: string): value is string => /^#[0-9a-f]{6}$/i.test(value ?? "");

const channels = (hex: string): [number, number, number] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

/** `amount` of `to` over `from`, from 0 to 1. */
export function mixColors(from: string, to: string, amount: number) {
  const target = channels(to);
  return `#${channels(from).map((value, i) => Math.round(value + (target[i]! - value) * amount).toString(16).padStart(2, "0")).join("")}`;
}

const luminance = (hex: string) => {
  const linear = (value: number) => {
    const unit = value / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = channels(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

/** The WCAG contrast of two colors, from 1 to 21. */
export function contrastRatio(a: string, b: string) {
  const [one, two] = [luminance(a), luminance(b)] as const;
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}

/** The text that reads best on a color. */
export const textOn = (background: string) => (contrastRatio(WHITE, background) >= contrastRatio(INK, background) ? WHITE : INK);

/** The color as close as it can stay to itself while reading as text on `background`. */
function readable(color: string, background: string, ratio = 4.5) {
  const target = textOn(background);
  for (let amount = 0; amount <= 1; amount += 0.05) {
    const candidate = mixColors(color, target, amount);
    if (contrastRatio(candidate, background) >= ratio) return candidate;
  }
  return target;
}

function accentRules(accent: string, soft: string, hover: string) {
  return `--kora-accent:${accent};--kora-accent-hover:${hover};--kora-accent-fg:${textOn(accent)};--kora-accent-soft:${soft};`;
}

/** Everything inside the menu, painted on its own background. */
function menuRules(background: string, primary: string | undefined) {
  const fg = textOn(background);
  const accent = primary && contrastRatio(primary, background) >= 4.5 ? primary : fg;
  return `color:${fg};--kora-surface:${background};--kora-surface-2:${mixColors(background, fg, 0.12)};--kora-fg:${fg};--kora-muted:${readable(mixColors(background, fg, 0.7), background)};--kora-line:${mixColors(background, fg, 0.18)};--kora-line-strong:${mixColors(background, fg, 0.3)};${accentRules(accent, mixColors(background, fg, 0.16), mixColors(accent, background, 0.15))}`;
}

/** The CSS of `ThemeColors`. Only for the screen: paper keeps the library colors. */
export function themeColorsCss({ primary, secondary, menu = "default", textScale }: ThemeColorsProps) {
  const brand = isHex(primary) ? primary.toLowerCase() : undefined;
  const second = isHex(secondary) ? secondary.toLowerCase() : undefined;
  const rules: string[] = [];
  if (brand) {
    const light = readable(brand, WHITE);
    const dark = readable(brand, DARK_SURFACE);
    // A dark second color would hide the text that sits on it, so only its tint is used.
    const soft = !second ? mixColors(WHITE, light, 0.1) : contrastRatio(second, INK) >= 4.5 ? second : mixColors(WHITE, second, 0.15);
    rules.push(`:root{${accentRules(light, soft, mixColors(light, INK, 0.12))}}`);
    rules.push(`.dark{${accentRules(dark, mixColors(DARK_SURFACE, dark, 0.18), mixColors(dark, WHITE, 0.12))}}`);
  }
  if (menu === "primary" && brand) {
    rules.push(`[data-kora-menu]{${menuRules(brand, undefined)}}`);
  }
  if (menu === "secondary" && second) {
    rules.push(`[data-kora-menu]{${menuRules(second, brand)}}`);
    rules.push(`.dark [data-kora-menu]{${menuRules(mixColors(DARK_SURFACE, second, 0.1), undefined)}}`);
  }
  // Everything in the library is sized in rem, so the root size scales text and controls together.
  if (typeof textScale === "number" && textScale !== 100 && textScale >= 87.5 && textScale <= 150) rules.push(`html{font-size:${textScale}%}`);
  return rules.length ? `@media screen{${rules.join("")}}` : "";
}

/** Puts the colors of a client on the whole app. Goes in the document head, and works in a server layout. */
export function ThemeColors(props: ThemeColorsProps) {
  const css = themeColorsCss(props);
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}
