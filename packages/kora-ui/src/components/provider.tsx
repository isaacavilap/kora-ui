import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { labels as dictionaries, type Labels, type Locale } from "./labels";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type Brand = { name: string; logo?: ReactNode };
type LinkProps = { href: string; className?: string; children?: ReactNode; onClick?: () => void; "aria-current"?: "page" };
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
