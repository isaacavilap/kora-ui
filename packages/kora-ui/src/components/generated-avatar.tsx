import { useId } from "react";
import type { ReactElement } from "react";
import { cn } from "./provider";

/* The colors here are art inside the drawing, so they do not change with the theme. */
const COLORS = ["#FF9EB5", "#3FBF6B", "#FF9F43", "#7CD6FF", "#3B82F6", "#F4583D", "#FFD23F", "#A78BFA"];
const INK = "#0B0B0F";
/** Corner size, as a share of the side. */
const RADIUS = 0.27;

export type AvatarArt = { shape: number; color: number; face: number };

const burst = Array.from({ length: 26 }, (_, i) => {
  const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 ? 42 : 54 + ((i * 7) % 5) * 2;
  return `${(56 + r * Math.cos(angle)).toFixed(1)},${(64 + r * Math.sin(angle)).toFixed(1)}`;
}).join(" ");

/** Each shape, and where its face goes: x, y, scale, and rotation. The drawing is 100 by 100. */
const shapes: { draw: (color: string) => ReactElement; face: [number, number, number, number?] }[] = [
  { draw: (c) => <polygon points="31,15 69,15 97,112 3,112" fill={c} />, face: [50, 54, 1] },
  { draw: (c) => <path d="M24 36C24 15 42 11 68 11C95 11 110 30 110 60V112H18C14 82 22 58 24 36Z" fill={c} />, face: [62, 52, 1] },
  { draw: (c) => <rect x={14} y={22} width={96} height={96} rx={5} fill={c} transform="rotate(-13 62 70)" />, face: [52, 60, 1, -13] },
  {
    draw: (c) => (
      <g>
        <path d="M4 114C8 84 34 82 50 76S74 58 66 38" stroke={c} strokeWidth={24} strokeLinecap="round" fill="none" />
        <circle cx={64} cy={35} r={18} fill={c} />
      </g>
    ),
    face: [64, 35, 0.85],
  },
  { draw: (c) => <polygon points={burst} fill={c} />, face: [54, 62, 1] },
  {
    draw: (c) => (
      <g fill={c}>
        <path d="M54 74L64 112" stroke={c} strokeWidth={15} />
        <circle cx={50} cy={29} r={19} />
        <circle cx={73} cy={52} r={19} />
        <circle cx={50} cy={75} r={19} />
        <circle cx={27} cy={52} r={19} />
        <circle cx={50} cy={52} r={22} />
      </g>
    ),
    face: [50, 52, 0.9],
  },
  {
    draw: (c) => (
      <g fill={c}>
        <path d="M-4 110A54 54 0 0 1 104 110Z" />
        {[195, 220, 245, 270, 295, 320, 345].map((g) => (
          <circle key={g} cx={(50 + 52 * Math.cos((g * Math.PI) / 180)).toFixed(2)} cy={(110 + 52 * Math.sin((g * Math.PI) / 180)).toFixed(2)} r={12} />
        ))}
      </g>
    ),
    face: [50, 80, 0.95],
  },
  {
    draw: (c) => (
      <g fill={c}>
        <rect x={39} y={-6} width={22} height={40} />
        <path d="M39 30C39 46 7 52 7 84V112H93V84C93 52 61 46 61 30Z" />
      </g>
    ),
    face: [50, 74, 1],
  },
  { draw: (c) => <ellipse cx={56} cy={66} rx={44} ry={53} fill={c} transform="rotate(18 56 66)" />, face: [54, 58, 1, 10] },
  { draw: (c) => <path d="M14 112V54A36 36 0 0 1 86 54V112Z" fill={c} />, face: [50, 58, 1] },
];

/** Strokes and dots around the center. Eyes are near y=-4, and the mouth is near y=6. */
const faces: { d: string; dots?: [number, number][] }[] = [
  { d: "M-11 -4H-5M5 -4H11M-3 6H3" },
  { d: "M-5 4Q0 9 5 4", dots: [[-8, -4], [8, -4]] },
  { d: "M-11 -3Q-8 -7.5 -5 -3M5 -3Q8 -7.5 11 -3M-4.5 4Q0 9 4.5 4" },
  { d: "M-6 4Q-3 9 0 5Q3 9 6 4", dots: [[-8, -4], [8, -4]] },
  { d: "M-11 -5Q-8 -1 -5 -5M5 -5Q8 -1 11 -5M-3.5 4L0 7.5L3.5 4" },
  { d: "M-12 -7L-5 -4M5 -4L12 -7M-4.5 8Q0 3.5 4.5 8" },
];

/** The same text always gives the same avatar. It uses the FNV-1a hash. */
export function avatarFromSeed(seed: string): AvatarArt {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 0x01000193);
  hash >>>= 0;
  return { shape: hash % shapes.length, color: (hash >>> 8) % COLORS.length, face: (hash >>> 16) % faces.length };
}

export const randomAvatar = (): AvatarArt => ({
  shape: Math.floor(Math.random() * shapes.length),
  color: Math.floor(Math.random() * COLORS.length),
  face: Math.floor(Math.random() * faces.length),
});

/** Text to save a chosen avatar, such as "abs:3-5-2". */
export const avatarCode = (art: AvatarArt) => `abs:${art.shape}-${art.color}-${art.face}`;

/** Returns null if the text is not a valid avatar code. */
export function parseAvatarCode(code: string | null | undefined): AvatarArt | null {
  const match = /^abs:(\d+)-(\d+)-(\d+)$/.exec(code?.trim() ?? "");
  if (!match) return null;
  const [shape, color, face] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return shape < shapes.length && color < COLORS.length && face < faces.length ? { shape, color, face } : null;
}

/** An avatar with a shape and a small face, for people with no photo. Without `label`, screen readers skip it. */
export function GeneratedAvatar({ seed = "", art, size = 32, label, className }: {
  /** Usually the id of the person. The same seed always gives the same avatar. */
  seed?: string;
  /** A chosen avatar, in place of the one from the seed. */
  art?: AvatarArt;
  size?: number;
  label?: string;
  className?: string;
}) {
  const clipId = `kr-avatar-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { shape, color, face } = art ?? avatarFromSeed(seed);
  const figure = shapes[shape] ?? shapes[0]!;
  const expression = faces[face] ?? faces[0]!;
  const [x, y, scale, turn = 0] = figure.face;
  // At small sizes, a larger face and a thicker stroke keep it readable.
  const small = size < 48;
  const stroke = small ? 3.8 : 3.2;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ borderRadius: size * RADIUS }}
      // In dark mode, the outline separates the black square from the page.
      className={cn("kr:shrink-0 kr:dark:outline kr:dark:outline-1 kr:dark:outline-line", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={100} height={100} rx={RADIUS * 100} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={100} height={100} fill={INK} />
        {figure.draw(COLORS[color] ?? COLORS[0]!)}
        <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale * (small ? 1.3 : 1)})`}>
          <path d={expression.d} stroke={INK} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {expression.dots?.map(([dx, dy]) => <circle key={dx} cx={dx} cy={dy} r={stroke * 0.78} fill={INK} />)}
        </g>
      </g>
    </svg>
  );
}
