import type { CSSProperties, ReactNode } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { focusRing } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./overlay";
import { cn, useLabels } from "./provider";
import { LOGO } from "./share-preview";

export type SocialNetwork = "whatsapp" | "telegram" | "instagram" | "messenger" | "x" | "linkedin" | "email" | "phone";

export type SocialContact = {
  /** Default whatsapp. */
  network?: SocialNetwork;
  /** Shown in the menu, for example "Sales" or "Downtown branch". */
  name: string;
  /**
   * whatsapp and phone: a number in any format, with the country code (+507). email: an address.
   * The others: a username (with or without @) or a full https link to the profile.
   */
  to: string;
  /** Second line in the menu: hours, city. */
  detail?: string;
  /** Prefilled message for this contact (whatsapp and email). Default the message of the button. */
  message?: string;
};

export type SocialFloatPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export type SocialFloatProps = {
  /** One contact opens it straight away. Several open a menu to choose. Networks can be mixed. */
  contacts: SocialContact[];
  /** Prefilled text, for whatsapp and email. */
  message?: string;
  /** Corner of the screen. Default bottom-right. */
  position?: SocialFloatPosition;
  /** Short text next to the button, such as "Questions? Write us". Hidden on phones, where it stays the accessible name. */
  label?: string;
  /** Heading of the menu with several contacts. */
  menuTitle?: string;
  className?: string;
};

const NAMES: Record<SocialNetwork, string> = {
  whatsapp: "WhatsApp", telegram: "Telegram", instagram: "Instagram", messenger: "Messenger", x: "X", linkedin: "LinkedIn", email: "email", phone: "phone",
};

const PROFILE: Partial<Record<SocialNetwork, (user: string) => string>> = {
  telegram: (u) => `https://t.me/${u}`,
  instagram: (u) => `https://ig.me/m/${u}`,
  messenger: (u) => `https://m.me/${u}`,
  x: (u) => `https://x.com/${u}`,
  linkedin: (u) => `https://www.linkedin.com/in/${u}`,
};

/** The link of a contact, or null when `to` can't make a safe one. Only https, mailto, and tel links come out. */
export function socialUrl(network: SocialNetwork, to: string, text?: string): string | null {
  const q = text ? encodeURIComponent(text) : "";
  if (network === "whatsapp" || network === "phone") {
    const digits = to.replace(/\D/g, "");
    if (!digits) return null;
    return network === "phone" ? `tel:+${digits}` : `https://wa.me/${digits}${q ? `?text=${q}` : ""}`;
  }
  if (network === "email") {
    const addr = to.trim();
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(addr)) return null;
    return `mailto:${addr}${q ? `?body=${q}` : ""}`;
  }
  const raw = to.trim();
  if (/^https:\/\//i.test(raw)) {
    try { return new URL(raw).href; } catch { return null; }
  }
  const user = raw.replace(/^@/, "");
  if (!/^[\w.-]+$/.test(user)) return null;
  return PROFILE[network]!(user);
}

/** Brand color behind the mark, and the mark itself, for one network. */
function mark({ network, size }: { network: SocialNetwork | "mixed"; size: number }): { bg: string; fg: string; glyph: ReactNode } {
  const icon = Math.round(size * 0.5);
  if (network === "whatsapp" || network === "telegram" || network === "x" || network === "linkedin" || network === "messenger") {
    const logo = LOGO[network === "messenger" ? "facebook" : network];
    const s = Math.round(size * logo.scale);
    return { bg: logo.bg, fg: logo.fg, glyph: <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden fill="currentColor"><path d={logo.d} /></svg> };
  }
  if (network === "instagram") {
    return {
      bg: "linear-gradient(45deg, #F58529, #DD2A7B 50%, #8134AF)", fg: "#fff",
      glyph: (
        <svg viewBox="0 0 24 24" width={icon} height={icon} aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    };
  }
  const Icon = network === "email" ? Mail : network === "phone" ? Phone : MessageCircle;
  return { bg: "var(--kora-accent)", fg: "var(--kora-accent-fg)", glyph: <Icon size={icon} aria-hidden /> };
}

const edge = "1rem";
// Clears the iPhone home indicator and the BottomNav of AppShell (its variable already holds the safe area).
const BOTTOM = `calc(${edge} + max(var(--kora-bottom-nav, 0px), env(safe-area-inset-bottom)))`;
const TOP = `calc(${edge} + env(safe-area-inset-top))`;

function place(position: SocialFloatPosition): CSSProperties {
  const [y, x] = position.split("-") as ["top" | "bottom", "left" | "right"];
  return { [y]: y === "bottom" ? BOTTOM : TOP, [x]: `calc(${edge} + env(safe-area-inset-${x}))` };
}

function Badge({ network, size, className }: { network: SocialNetwork | "mixed"; size: number; className?: string }) {
  const m = mark({ network, size });
  return (
    <span className={cn("kr:flex kr:shrink-0 kr:items-center kr:justify-center kr:rounded-full", className)} style={{ width: size, height: size, background: m.bg, color: m.fg }}>
      {m.glyph}
    </span>
  );
}

/**
 * Floating contact button: WhatsApp, Telegram, Instagram, Messenger, X, LinkedIn, email, or phone.
 * One contact opens it straight away; several open a menu (arrows, Enter, Escape). Mixed networks show a chat icon.
 */
export function SocialFloat({ contacts, message, position = "bottom-right", label, menuTitle, className }: SocialFloatProps) {
  const t = useLabels();
  const list = contacts.flatMap((c) => {
    const network = c.network ?? "whatsapp";
    const href = socialUrl(network, c.to, c.message ?? message);
    return href ? [{ ...c, network, href }] : [];
  });
  if (list.length === 0) return null;
  const networks = new Set(list.map((c) => c.network));
  const only = networks.size === 1 ? list[0]!.network : null;
  const left = position.endsWith("left");
  const name = label ?? (only ? t.socialOn.replace("{network}", NAMES[only]) : t.socialChat);
  // Links that leave the site open in a new tab; mailto and tel hand off to the app.
  const external = (href: string) => (href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {});

  const button = <Badge network={only ?? "mixed"} size={56} className="kr:shadow-overlay kr:transition-transform kr:motion-safe:group-hover:scale-105" />;
  const pill = label && (
    <span className="kr:hidden kr:rounded-full kr:border kr:border-line kr:bg-surface kr:px-3 kr:py-1.5 kr:text-sm kr:font-medium kr:text-fg kr:shadow-overlay kr:sm:block">{label}</span>
  );
  const triggerClass = cn("kr:group kr:flex kr:items-center kr:gap-3 kr:rounded-full", left && "kr:flex-row-reverse", focusRing);

  return (
    <div className={cn("kr:fixed kr:z-40", className)} style={place(position)}>
      {list.length === 1 ? (
        <a href={list[0]!.href} {...external(list[0]!.href)} aria-label={name} className={triggerClass}>
          {pill}{button}
        </a>
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger aria-label={name} className={cn(triggerClass, "kr:cursor-pointer")}>{pill}{button}</DropdownMenuTrigger>
          <DropdownMenuContent side={position.startsWith("top") ? "bottom" : "top"} align={left ? "start" : "end"} sideOffset={8} className="kr:w-72">
            <DropdownMenuLabel>{menuTitle ?? t.socialChoose}</DropdownMenuLabel>
            {list.map((c) => (
              <DropdownMenuItem key={`${c.network}-${c.name}-${c.to}`} asChild className="kr:h-auto kr:gap-3 kr:py-2">
                <a href={c.href} {...external(c.href)}>
                  {!only && <Badge network={c.network} size={28} />}
                  <span className="kr:flex kr:min-w-0 kr:flex-col">
                    <span className="kr:font-medium">{c.name}</span>
                    {c.detail && <span className="kr:text-xs kr:text-muted">{c.detail}</span>}
                  </span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
