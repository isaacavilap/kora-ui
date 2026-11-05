import { createContext, useContext, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Dialog as D } from "radix-ui";
import { Menu } from "lucide-react";
import { Button, focusRing } from "./button";
import { Badge } from "./display";
import { cn, KoraLink, useKora, useLabels } from "./provider";

const ShellContext = createContext<{ openDrawer?: () => void; closeDrawer?: () => void; hasSidebar: boolean }>({ hasSidebar: false });

/**
 * Page frame. From 1024px the sidebar is a fixed column.
 * Below that it becomes a drawer, opened with the Topbar menu button.
 */
export function AppShell({ sidebar, topbar, children, className }: {
  sidebar?: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [drawer, setDrawer] = useState(false);
  const t = useLabels();
  return (
    <ShellContext.Provider value={{ openDrawer: () => setDrawer(true), closeDrawer: () => setDrawer(false), hasSidebar: Boolean(sidebar) }}>
      <div className={cn("kr:flex kr:min-h-dvh kr:bg-bg kr:text-fg", className)}>
        {sidebar && (
          <>
            <aside className="kr:sticky kr:top-0 kr:hidden kr:h-dvh kr:w-60 kr:shrink-0 kr:border-r kr:border-line kr:bg-surface kr:lg:block">{sidebar}</aside>
            <D.Root open={drawer} onOpenChange={setDrawer}>
              <D.Portal>
                <D.Overlay className="kr:fixed kr:inset-0 kr:z-50 kr:bg-black/50 kr:animate-[kr-fade-in_150ms_ease-out] kr:lg:hidden" />
                <D.Content
                  aria-describedby={undefined}
                  className="kr:fixed kr:inset-y-0 kr:left-0 kr:z-50 kr:w-[min(17rem,85vw)] kr:bg-surface kr:text-fg kr:shadow-overlay kr:outline-none kr:animate-[kr-slide-left_180ms_ease-out] kr:lg:hidden"
                >
                  <D.Title className="kr:sr-only">{t.menu}</D.Title>
                  {sidebar}
                </D.Content>
              </D.Portal>
            </D.Root>
          </>
        )}
        <div className="kr:flex kr:min-w-0 kr:flex-1 kr:flex-col">
          {topbar}
          <main className="kr:min-w-0 kr:flex-1 kr:p-4 kr:lg:p-6">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export function Sidebar({ brand, footer, children, className }: {
  brand?: { name: string; logo?: ReactNode };
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const fallback = useKora().brand;
  const b = brand ?? fallback;
  return (
    <div className={cn("kr:flex kr:h-full kr:flex-col", className)}>
      {b && (
        <div className="kr:flex kr:h-14 kr:shrink-0 kr:items-center kr:gap-2 kr:px-4 kr:text-sm kr:font-semibold">
          {b.logo}
          <span className="kr:truncate">{b.name}</span>
        </div>
      )}
      <nav className="kr:min-h-0 kr:flex-1 kr:space-y-5 kr:overflow-y-auto kr:px-2 kr:py-2">{children}</nav>
      {footer && <div className="kr:shrink-0 kr:border-t kr:border-line kr:p-2">{footer}</div>}
    </div>
  );
}

export function SidebarSection({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <div>
      {label && <p className="kr:px-2 kr:pb-1 kr:text-xs kr:text-muted">{label}</p>}
      <ul className="kr:space-y-0.5">{children}</ul>
    </div>
  );
}

export function SidebarItem({ href, icon, active, badge, onClick, children }: {
  href: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { closeDrawer } = useContext(ShellContext);
  return (
    <li>
        <KoraLink
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={() => {
            onClick?.();
            closeDrawer?.();
          }}
          className={cn(
            "kr:flex kr:h-11 kr:items-center kr:gap-2.5 kr:rounded-md kr:px-2 kr:text-sm kr:transition-colors kr:lg:h-9 kr:[&_svg]:size-4 kr:[&_svg]:shrink-0",
            active ? "kr:bg-accent-soft kr:font-medium kr:text-accent" : "kr:text-muted kr:hover:bg-surface-2 kr:hover:text-fg",
            focusRing,
            "kr:focus-visible:-outline-offset-2",
          )}
        >
          {icon}
          <span className="kr:min-w-0 kr:flex-1 kr:truncate">{children}</span>
          {badge != null && <Badge>{badge}</Badge>}
        </KoraLink>
    </li>
  );
}

export function Topbar({ children, className }: { children?: ReactNode; className?: string }) {
  const { openDrawer, hasSidebar } = useContext(ShellContext);
  const t = useLabels();
  return (
    <header className={cn("kr:sticky kr:top-0 kr:z-40 kr:flex kr:h-14 kr:shrink-0 kr:items-center kr:gap-2 kr:border-b kr:border-line kr:bg-surface kr:px-2 kr:lg:px-6", className)}>
      {hasSidebar && (
        <Button variant="ghost" size="icon" aria-label={t.menu} onClick={openDrawer} className="kr:lg:hidden">
          <Menu aria-hidden />
        </Button>
      )}
      <div className="kr:flex kr:min-w-0 kr:flex-1 kr:items-center kr:gap-2 kr:pr-2 kr:lg:pr-0">{children}</div>
    </header>
  );
}

/** Title block. Actions move below the title on phones. */
export function PageHeader({ title, description, actions, className }: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("kr:mb-5 kr:flex kr:flex-col kr:gap-3 kr:md:flex-row kr:md:items-start kr:md:justify-between", className)}>
      <div className="kr:min-w-0">
        <h1 className="kr:text-xl kr:font-semibold kr:text-fg">{title}</h1>
        {description && <p className="kr:mt-1 kr:text-sm kr:text-muted">{description}</p>}
      </div>
      {actions && <div className="kr:flex kr:flex-wrap kr:items-center kr:gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Responsive grid.
 * `min` fits as many columns as there is room for, each at least that wide.
 * `cols` sets explicit tracks from 1024px, such as "2fr 1fr", and stacks below.
 */
export function Grid({ min = "15rem", cols, className, style, ...props }: HTMLAttributes<HTMLDivElement> & { min?: string; cols?: string }) {
  return (
    <div
      className={cn(
        "kr:grid kr:gap-[var(--kora-gap)]",
        cols ? "kr:grid-cols-1 kr:lg:[grid-template-columns:var(--kr-cols)]" : "kr:[grid-template-columns:repeat(auto-fit,minmax(min(var(--kr-min),100%),1fr))]",
        className,
      )}
      style={{ "--kr-cols": cols, "--kr-min": min, ...style } as CSSProperties}
      {...props}
    />
  );
}
