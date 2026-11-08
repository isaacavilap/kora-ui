import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { labels as dictionaries, type Labels, type Locale } from "./labels";

/** Intl range output uses thin or no-break spaces that differ between Node and browsers (hydration mismatch): make them plain. */
export const plainSpaces = (s: string) => s.replace(/[\u2009\u202f\u00a0]/g, " ");

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type Brand = { name: string; logo?: ReactNode };

/** The brand logo, fitted to a fixed height so any image or svg (even with width/height attributes) stays in its slot. */
export function BrandLogo({ logo, size = "md" }: { logo?: ReactNode; size?: "sm" | "md" }) {
  if (!logo) return null;
  return (
    <span aria-hidden className={cn(
      // object-contain keeps the logo's own proportions when the width cap is tighter than its natural width (wide logos in the rail).
      "kr:flex kr:shrink-0 kr:items-center kr:justify-center kr:overflow-hidden kr:[&_img]:h-full kr:[&_img]:w-auto kr:[&_img]:max-w-full kr:[&_img]:object-contain kr:[&>svg]:h-full kr:[&>svg]:w-auto kr:[&>svg]:max-w-full",
      size === "sm" ? "kr:h-6 kr:max-w-8" : "kr:h-7 kr:max-w-32",
    )}>{logo}</span>
  );
}
type LinkProps = { href: string; className?: string; children?: ReactNode; onClick?: () => void; "aria-current"?: "page"; target?: string; rel?: string; download?: boolean | string };
export type LinkComponent = ComponentType<LinkProps>;

type KoraConfig = { locale: Locale; linkComponent: LinkComponent | "a"; brand?: Brand };

const KoraContext = createContext<KoraConfig>({ locale: "en", linkComponent: "a" });

export type KoraProviderProps = Partial<KoraConfig> & { children: ReactNode };

export function KoraProvider({ locale = "en", linkComponent = "a", brand, children }: KoraProviderProps) {
  const value = useMemo(() => ({ locale, linkComponent, brand }), [locale, linkComponent, brand]);
  return <KoraContext.Provider value={value}>{children}</KoraContext.Provider>;
}

export function useKora() {
  return useContext(KoraContext);
}

export function useLabels(overrides?: Partial<Labels>): Labels {
  const { locale } = useKora();
  return overrides ? { ...dictionaries[locale], ...overrides } : dictionaries[locale];
}

/** Renders the router link set on KoraProvider, or a plain anchor. */
export function KoraLink(props: LinkProps) {
  const Link = useKora().linkComponent;
  return <Link {...props} />;
}

/**
 * The submit contract shared by every screen: blocks repeat submits while the
 * promise is pending, and turns a rejection into a generic message.
 */
export function useSubmit<A extends unknown[]>(fn: ((...args: A) => unknown) | undefined, genericError: string) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: A) => {
      if (!fn || inFlight.current) return false;
      inFlight.current = true;
      setPending(true);
      setError(undefined);
      try {
        await fn(...args);
        return true;
      } catch {
        setError(genericError);
        return false;
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [fn, genericError],
  );

  return { pending, error, run };
}
