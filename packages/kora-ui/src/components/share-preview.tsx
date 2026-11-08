import type { CSSProperties, ReactNode } from "react";
import { Bookmark, ChartNoAxesColumn, Ellipsis, EllipsisVertical, Forward, Globe, Heart, MessageCircle, MessageSquare, Repeat2, Send, Share, ThumbsUp } from "lucide-react";
import { fill, type Labels } from "./labels";
import { cn, useLabels } from "./provider";

export type ShareNetwork = "whatsapp" | "telegram" | "x" | "facebook" | "linkedin" | "google";

export type SharePreviewProps = {
  network: ShareNetwork;
  /** The shared link. Its host is the domain the networks show. */
  url: string;
  /** og:title. Google uses the page <title>: pass that one for "google". */
  title?: string;
  /** og:description. Google uses the meta description. */
  description?: string;
  /** og:image. Without it, each network shows its layout with no image. */
  image?: string;
  /** og:site_name. Telegram and Google show it; posts use it as the account name. */
  siteName?: string;
  /** Site icon. Google shows it; posts use it as the avatar. */
  favicon?: string;
  /** twitter:card. X shows a big image with "summary_large_image" and a small square one with "summary". Default large. */
  card?: "summary" | "summary_large_image";
  /** Text of the post above the link. Chats always show the link itself. */
  text?: string;
  className?: string;
};

export const SHARE_NETWORKS: Array<{ network: ShareNetwork; label: string }> = [
  { network: "whatsapp", label: "WhatsApp" },
  { network: "facebook", label: "Facebook" },
  { network: "x", label: "X" },
  { network: "linkedin", label: "LinkedIn" },
  { network: "telegram", label: "Telegram" },
  { network: "google", label: "Google" },
];

/** Host without "www.", as the networks print it. */
export function shareDomain(url: string) {
  try { return new URL(url).host.replace(/^www\./, ""); } catch { return url; }
}

/** Google's breadcrumb: "https://site.com › blog › post". */
export function shareBreadcrumb(url: string) {
  try {
    const u = new URL(url);
    return [`${u.protocol}//${u.host}`, ...u.pathname.split("/").filter(Boolean).map(decodeURIComponent)].join(" › ");
  } catch { return url; }
}

/** Cuts at a word before max characters and adds "…", like Google does with titles (~60) and snippets (~155). */
export function clipText(text: string, max: number) {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = t[max] === " " ? max : cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,;:–-]+$/, "")}…`;
}

/** Which X card is drawn: the big one needs an image; without one X falls back to the small card. */
export function xCardLayout(card: SharePreviewProps["card"], image?: string): "large" | "small" {
  return card !== "summary" && image ? "large" : "small";
}

const clamp = (lines: number): CSSProperties => ({ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere" });
const one: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const SYS = "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif";

/** The og:image at a fixed ratio, cropped like the networks crop it. */
function Cover({ src, ratio = 1.91, style }: { src: string; ratio?: number; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" style={{ display: "block", width: "100%", aspectRatio: `${ratio}`, objectFit: "cover", background: "#e4e6eb", ...style }} />;
}

// Each network's own mark (Simple Icons, CC0; LinkedIn from v9, removed later). Trademarks of their owners: used only
// to name the network in these mocks. `fg` paints the path, `bg` the circle behind it, `scale` the path inside it.
export const LOGO: Record<Exclude<ShareNetwork, "google">, { d: string; fg: string; bg: string; scale: number }> = {
  x: { fg: "#fff", bg: "#000", scale: 0.5, d: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" },
  facebook: { fg: "#0866FF", bg: "#fff", scale: 1, d: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" },
  linkedin: { fg: "#fff", bg: "#0A66C2", scale: 0.5, d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" },
  whatsapp: { fg: "#fff", bg: "#25D366", scale: 0.6, d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
  telegram: { fg: "#26A5E4", bg: "#fff", scale: 1, d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
};

/** The network's logo in a circle, the size of an avatar. */
export function ShareLogo({ network, size = 24 }: { network: ShareNetwork; size?: number }) {
  if (network === "google") return (
    <svg viewBox="-8 -8 64 64" width={size} height={size} aria-hidden style={{ flex: "none", borderRadius: "50%", background: "#fff", boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.08)" }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
  const l = LOGO[network], pad = (24 / l.scale - 24) / 2;
  return (
    <svg viewBox={`${-pad} ${-pad} ${24 + 2 * pad} ${24 + 2 * pad}`} width={size} height={size} aria-hidden
      style={{ flex: "none", borderRadius: "50%", background: l.bg }}>
      <path fill={l.fg} d={l.d} />
    </svg>
  );
}

/** A round avatar: the site icon, or by default the network's own logo. */
function Face({ network, src, size }: { network: ShareNetwork; src?: string; size: number }) {
  const box: CSSProperties = { width: size, height: size, flex: "none", borderRadius: "50%", objectFit: "cover", background: "#fff", boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.08)" };
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" style={box} /> : <ShareLogo network={network} size={size} />;
}

/** Two blue (read) ticks. */
const Ticks = ({ color }: { color: string }) => (
  <svg viewBox="0 0 16 11" width="16" height="11" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m1 6 3 3 6.5-7.5" /><path d="m6.5 8.2.8.8L14 2" />
  </svg>
);

// ---- Chats -------------------------------------------------------------------------------------------------------

function WhatsApp({ url, title, description, image }: SharePreviewProps) {
  const domain = shareDomain(url);
  return (
    <div style={{ background: "#efeae2", padding: "16px 10px", fontFamily: SYS, display: "flex", justifyContent: "flex-end" }}>
      {/* Outgoing bubble with its tail on the top right. */}
      <div style={{ position: "relative", maxWidth: 320, width: "86%", background: "#d9fdd3", borderRadius: "8px 0 8px 8px", padding: 3, boxShadow: "0 1px 0.5px rgb(11 20 26 / 0.13)" }}>
        <svg viewBox="0 0 8 13" width="8" height="13" aria-hidden style={{ position: "absolute", top: 0, right: -8 }}><path d="M0 0h8L0 13Z" fill="#d9fdd3" /><path d="M5.2 0H8L0 13v-1Z" fill="rgb(11 20 26 / 0.04)" /></svg>
        <div style={{ background: "#d1f4cc", borderRadius: 6, overflow: "hidden" }}>
          {image && <Cover src={image} />}
          <div style={{ padding: "6px 10px 8px" }}>
            {title && <div style={{ ...clamp(2), fontSize: 14, fontWeight: 600, lineHeight: "19px", color: "#111b21" }}>{title}</div>}
            {description && <div style={{ ...clamp(2), fontSize: 12.5, lineHeight: "17px", color: "#667781", marginTop: 2 }}>{description}</div>}
            <div style={{ ...one, fontSize: 12.5, lineHeight: "17px", color: "#667781", marginTop: 2 }}>{domain}</div>
          </div>
        </div>
        <div style={{ padding: "5px 7px 2px 6px", fontSize: 14.2, lineHeight: "19px", color: "#111b21" }}>
          <span style={{ color: "#027eb5", overflowWrap: "anywhere" }}>{url}</span>
          {/* Room for the time, which floats on the last line like the real one. */}
          <span style={{ display: "inline-block", width: 62 }} />
          <span style={{ float: "right", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, lineHeight: "15px", color: "#667781", margin: "6px 0 -4px -56px" }}>9:41 <Ticks color="#53bdeb" /></span>
        </div>
      </div>
    </div>
  );
}

function Telegram({ url, title, description, image, siteName }: SharePreviewProps) {
  const green = "#3fa142";
  return (
    <div style={{ background: "linear-gradient(160deg, #d0dfa8, #a3c48a 55%, #88b38f)", padding: "16px 10px", fontFamily: SYS, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ position: "relative", maxWidth: 320, width: "86%", background: "#effedd", borderRadius: "17px 17px 0 17px", padding: "7px 10px 6px 11px", boxShadow: "0 1px 1px rgb(0 0 0 / 0.12)", fontSize: 15, lineHeight: "20px", color: "#000" }}>
        {/* Tail on the bottom right. */}
        <svg viewBox="0 0 9 17" width="9" height="17" aria-hidden style={{ position: "absolute", right: -6, bottom: 0 }}><path d="M0 0c0 9 3 14 9 17H0Z" fill="#effedd" /></svg>
        <span style={{ color: "#168acd", overflowWrap: "anywhere" }}>{url}</span>
        {/* The preview: a colored bar on the left, site name, title, text, then the image. */}
        <div style={{ marginTop: 6, borderLeft: `3px solid ${green}`, background: "rgb(63 161 66 / 0.1)", borderRadius: 4, padding: "5px 8px 7px", fontSize: 14, lineHeight: "18px" }}>
          <div style={{ ...one, color: green, fontWeight: 600 }}>{siteName || shareDomain(url)}</div>
          {title && <div style={{ ...clamp(2), fontWeight: 600 }}>{title}</div>}
          {description && <div style={{ ...clamp(3) }}>{description}</div>}
          {image && <Cover src={image} style={{ borderRadius: 6, marginTop: 6 }} />}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 2, fontSize: 11, lineHeight: "14px", color: "#5dae5a" }}>9:41 <Ticks color="#5dae5a" /></div>
      </div>
    </div>
  );
}

// ---- Posts -------------------------------------------------------------------------------------------------------

type View = SharePreviewProps & { t: Labels };

const action = (color: string, size: number): CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, color, fontSize: size });

function X({ url, title, description, image, siteName, favicon, card, text, t }: View) {
  const domain = shareDomain(url);
  const name = siteName || domain;
  const handle = `@${name.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15) || "sitio"}`;
  const gray = "#536471";
  const large = xCardLayout(card, image) === "large";
  const font = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  return (
    <div style={{ background: "#fff", padding: "12px 16px", display: "flex", gap: 8, fontFamily: font, color: "#0f1419" }}>
      <Face network="x" src={favicon} size={40} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 15, lineHeight: "20px" }}>
          <span style={{ ...one, fontWeight: 700 }}>{name}</span>
          <span style={{ ...one, color: gray, flexShrink: 9 }}>{handle} · 2h</span>
          <Ellipsis size={18.75} color={gray} style={{ marginLeft: "auto", flex: "none" }} />
        </div>
        {text && <div style={{ fontSize: 15, lineHeight: "20px", marginTop: 2, whiteSpace: "pre-wrap" }}>{text}</div>}
        {large ? (
          <>
            <div style={{ position: "relative", marginTop: 12, borderRadius: 16, overflow: "hidden", border: "1px solid #cfd9de" }}>
              <Cover src={image!} />
              <span style={{ ...one, position: "absolute", left: 12, bottom: 12, maxWidth: "calc(100% - 24px)", background: "rgb(0 0 0 / 0.77)", color: "#fff", fontSize: 13, lineHeight: "16px", padding: "1px 4px", borderRadius: 4 }}>{domain}</span>
            </div>
            <div style={{ ...one, fontSize: 13, lineHeight: "16px", color: gray, marginTop: 4 }}>{fill(t.shareFrom, { domain })}</div>
          </>
        ) : (
          <div style={{ display: "flex", marginTop: 12, borderRadius: 16, overflow: "hidden", border: "1px solid #cfd9de", minHeight: 131 }}>
            <div style={{ flex: "none", width: 131, borderRight: "1px solid #cfd9de", background: "#f7f9f9", display: "grid", placeItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <svg viewBox="0 0 24 24" width="30" height="30" fill={gray} aria-hidden><path d="M3 5.5C3 4.12 4.12 3 5.5 3h13C19.88 3 21 4.12 21 5.5v13c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-13ZM5.5 5c-.28 0-.5.22-.5.5v13c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-13c0-.28-.22-.5-.5-.5h-13ZM7 8h10v2H7V8Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Z" /></svg>}
            </div>
            <div style={{ minWidth: 0, padding: 12, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, fontSize: 15, lineHeight: "20px" }}>
              <span style={{ ...one, color: gray }}>{domain}</span>
              {title && <span style={{ ...clamp(1) }}>{title}</span>}
              {description && <span style={{ ...clamp(2), color: gray }}>{description}</span>}
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, maxWidth: 425 }}>
          <span style={action(gray, 13)}><MessageCircle size={18.75} strokeWidth={1.75} />4</span>
          <span style={action(gray, 13)}><Repeat2 size={18.75} strokeWidth={1.75} />12</span>
          <span style={action(gray, 13)}><Heart size={18.75} strokeWidth={1.75} />48</span>
          <span style={action(gray, 13)}><ChartNoAxesColumn size={18.75} strokeWidth={1.75} />1.2K</span>
          <span style={{ ...action(gray, 13), gap: 12 }}><Bookmark size={18.75} strokeWidth={1.75} /><Share size={18.75} strokeWidth={1.75} /></span>
        </div>
      </div>
    </div>
  );
}

function Facebook({ url, title, description, image, siteName, favicon, text, t }: View) {
  const domain = shareDomain(url);
  const name = siteName || domain;
  const gray = "#65676b";
  const font = `-apple-system, BlinkMacSystemFont, "Segoe UI Historic", "Segoe UI", Helvetica, Arial, sans-serif`;
  return (
    <div style={{ background: "#fff", fontFamily: font, color: "#050505" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px 0" }}>
        <Face network="facebook" src={favicon} size={40} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...one, fontSize: 15, fontWeight: 600, lineHeight: "20px" }}>{name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, lineHeight: "16px", color: gray }}>2 h · <Globe size={12} strokeWidth={2} /></div>
        </div>
        <Ellipsis size={20} color={gray} />
      </div>
      <div style={{ padding: "12px 16px", fontSize: 15, lineHeight: "20px", whiteSpace: "pre-wrap" }}>{text || url}</div>
      {/* The link card: edge to edge, image 1.91:1, then a gray box with the domain in capitals. */}
      {image && <Cover src={image} style={{ borderTop: "1px solid #dadde1" }} />}
      <div style={{ background: "#f0f2f5", padding: "10px 16px 12px", borderTop: image ? undefined : "1px solid #dadde1", borderBottom: "1px solid #dadde1" }}>
        <div style={{ ...one, fontSize: 13, lineHeight: "16px", color: gray, textTransform: "uppercase" }}>{domain}</div>
        {title && <div style={{ ...clamp(2), fontSize: 17, fontWeight: 600, lineHeight: "21px", marginTop: 3 }}>{title}</div>}
        {description && <div style={{ ...clamp(1), fontSize: 15, lineHeight: "20px", color: gray, marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "10px 16px", fontSize: 15, lineHeight: "20px", color: gray }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden style={{ width: 18, height: 18, borderRadius: "50%", background: "#1877f2", display: "grid", placeItems: "center" }}><ThumbsUp size={10} color="#fff" fill="#fff" /></span>24
        </span>
        <span style={one}>{t.shareCounts}</span>
      </div>
      <div style={{ display: "flex", margin: "0 12px", padding: "4px 0", borderTop: "1px solid #ced0d4" }}>
        {([[ThumbsUp, t.shareLike], [MessageCircle, t.shareComment], [Forward, t.shareShare]] as const).map(([Icon, label]) => (
          <span key={label} style={{ flex: 1, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "6px 0", fontSize: 15, fontWeight: 600, color: gray }}><Icon size={20} strokeWidth={1.75} />{label}</span>
        ))}
      </div>
    </div>
  );
}

function LinkedIn({ url, title, image, siteName, favicon, text, t }: View) {
  const domain = shareDomain(url);
  const name = siteName || domain;
  const gray = "rgb(0 0 0 / 0.6)";
  const font = `-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, "Oxygen Sans", Cantarell, "Droid Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Lucida Grande", Helvetica, Arial, sans-serif`;
  return (
    <div className="kr:@container" style={{ background: "#fff", fontFamily: font, color: "rgb(0 0 0 / 0.9)" }}>
      <div style={{ display: "flex", gap: 8, padding: "12px 16px 0" }}>
        <Face network="linkedin" src={favicon} size={48} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...one, fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>{name}</div>
          <div style={{ ...one, fontSize: 12, lineHeight: "16px", color: gray }}>{fill(t.shareFollowers, { count: "1,240" })}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, lineHeight: "16px", color: gray }}>2 h · <Globe size={12} strokeWidth={2} /></div>
        </div>
        <Ellipsis size={24} color={gray} />
      </div>
      {text && <div style={{ padding: "8px 16px 0", fontSize: 14, lineHeight: "20px", whiteSpace: "pre-wrap" }}>{text}</div>}
      {/* Today's link card: small image on the left, title and domain on the right, on a pale box. */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 16px 0", padding: image ? 0 : "12px 16px", background: "#edf3f8", borderRadius: 8, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image && <img src={image} alt="" style={{ flex: "none", width: 132, aspectRatio: "1.91", objectFit: "cover", display: "block" }} />}
        <div style={{ minWidth: 0, padding: image ? "8px 12px 8px 0" : 0 }}>
          {title && <div style={{ ...clamp(2), fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>{title}</div>}
          <div style={{ ...one, fontSize: 12, lineHeight: "16px", color: gray, marginTop: 2 }}>{domain}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 16px", fontSize: 12, color: gray, borderBottom: "1px solid #e8e8e8", margin: "0 0 0" }}>
        <span aria-hidden style={{ width: 16, height: 16, borderRadius: "50%", background: "#378fe9", display: "grid", placeItems: "center" }}><ThumbsUp size={9} color="#fff" fill="#fff" /></span>{t.shareReactions}
      </div>
      <div style={{ display: "flex", padding: "4px 8px" }}>
        {([[ThumbsUp, t.shareRecommend], [MessageSquare, t.shareComment], [Repeat2, t.shareRepost], [Send, t.shareSend]] as const).map(([Icon, label]) => (
          <span key={label} className="kr:flex-col kr:gap-0.5 kr:text-xs kr:@[26rem]:flex-row kr:@[26rem]:gap-1.5 kr:@[26rem]:text-sm" style={{ flex: 1, minWidth: 0, display: "inline-flex", justifyContent: "center", alignItems: "center", padding: "8px 0", fontWeight: 600, color: gray }}><Icon size={20} strokeWidth={1.75} style={{ flex: "none" }} /><span style={one}>{label}</span></span>
        ))}
      </div>
    </div>
  );
}

// ---- Search ------------------------------------------------------------------------------------------------------

function Google({ url, title, description, siteName, favicon }: SharePreviewProps) {
  const domain = shareDomain(url);
  return (
    <div style={{ background: "#fff", padding: "16px", fontFamily: "Arial, sans-serif", color: "#202124" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ flex: "none", width: 28, height: 28, borderRadius: "50%", background: "#f1f3f4", border: "1px solid #ecedef", display: "grid", placeItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {favicon ? <img src={favicon} alt="" width={18} height={18} style={{ objectFit: "contain" }} /> : <Globe size={16} color="#5f6368" />}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...one, fontSize: 14, lineHeight: "20px" }}>{siteName || domain}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: "18px", color: "#4d5156" }}>
            <span style={one}>{shareBreadcrumb(url)}</span>
            <EllipsisVertical size={14} style={{ flex: "none" }} />
          </div>
        </div>
      </div>
      <div style={{ ...clamp(2), fontSize: 20, lineHeight: "26px", color: "#1a0dab", marginTop: 6 }}>{title ? clipText(title, 60) : domain}</div>
      {description && <div style={{ ...clamp(2), fontSize: 14, lineHeight: "22px", color: "#4d5156", marginTop: 2 }}>{clipText(description, 155)}</div>}
    </div>
  );
}

const views: Record<ShareNetwork, (p: View) => ReactNode> = { whatsapp: WhatsApp, telegram: Telegram, x: X, facebook: Facebook, linkedin: LinkedIn, google: Google };

/**
 * How a link looks when shared on one network: a light mock drawn like the real app (the network's logo is the default avatar), fed with the
 * page's Open Graph tags. Truncation, crops and no-image layouts follow each network.
 */
export function SharePreview(props: SharePreviewProps) {
  const t = useLabels();
  const network = SHARE_NETWORKS.find((n) => n.network === props.network)?.label ?? props.network;
  return (
    <div role="img" aria-label={fill(t.sharePreviewOn, { network })} className={cn("kr:overflow-hidden kr:rounded-lg kr:border kr:border-line", props.className)}
      style={{ maxWidth: props.network === "google" ? 652 : 500, colorScheme: "light", WebkitFontSmoothing: "antialiased", textAlign: "left" }}>
      {views[props.network]({ ...props, t })}
    </div>
  );
}

export type SharePreviewsProps = Omit<SharePreviewProps, "network"> & {
  /** Networks to show, in order. Default all. */
  networks?: ShareNetwork[];
  /** The page <title> and meta description, for Google. Default title and description. */
  searchTitle?: string;
  searchDescription?: string;
};

/** Every network side by side, each with its name on top. */
export function SharePreviews({ networks = SHARE_NETWORKS.map((n) => n.network), searchTitle, searchDescription, className, ...props }: SharePreviewsProps) {
  return (
    <div className={cn("kr:grid kr:gap-4", className)} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", alignItems: "start" }}>
      {networks.map((n) => (
        <figure key={n} className="kr:m-0 kr:min-w-0 kr:space-y-1.5">
          <figcaption className="kr:flex kr:items-center kr:gap-1.5 kr:text-xs kr:font-medium kr:text-muted"><ShareLogo network={n} size={16} />{SHARE_NETWORKS.find((x) => x.network === n)?.label}</figcaption>
          <SharePreview network={n} {...props} {...(n === "google" ? { title: searchTitle ?? props.title, description: searchDescription ?? props.description } : {})} />
        </figure>
      ))}
    </div>
  );
}
