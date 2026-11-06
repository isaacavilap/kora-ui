import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Dialog as D, Popover } from "radix-ui";
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button, focusRing, popoverClass } from "./button";
import { Badge } from "./display";
import { Tooltip } from "./overlay";
import { cn, KoraLink, useKora, useLabels } from "./provider";

const COLLAPSED_KEY = "kora-sidebar-collapsed";

type Shell = { openDrawer?: () => void; closeDrawer?: () => void; toggleCollapsed?: () => void; collapsed: boolean; hasSidebar: boolean };
const ShellContext = createContext<Shell>({ collapsed: false, hasSidebar: false });
/** True only inside the desktop icon rail. The phone drawer always shows full labels. */
const RailContext = createContext(false);
/** Lets an active item tell the groups around it, so they open and show that they hold the current page. */
const noReport = () => {};
const GroupContext = createContext<(delta: number) => void>(noReport);

/** For custom topbars and sidebar footers: `toggle` works on desktop, and `rail` is true in the icon rail. */
export function useSidebar() {
  const { collapsed, toggleCollapsed } = useContext(ShellContext);
  return { collapsed, toggle: toggleCollapsed, rail: useContext(RailContext) };
}

/**
 * Page frame. From 1024px the sidebar is a fixed column that collapses to icons or hides.
 * Below that it becomes a drawer, opened with the Topbar menu button.
 */
export function AppShell({ sidebar, topbar, collapseMode = "rail", collapsed: controlled, defaultCollapsed = false, onCollapsedChange, children, className }: {
  sidebar?: ReactNode;
  topbar?: ReactNode;
  /** `rail` keeps a column of icons when collapsed. `hidden` removes the sidebar. */
  collapseMode?: "rail" | "hidden";
  /** Controlled state. Without it, the choice is saved in localStorage. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  const [drawer, setDrawer] = useState(false);
  const [saved, setSaved] = useState(defaultCollapsed);
  const t = useLabels();
  const isControlled = controlled !== undefined;
  const collapsed = controlled ?? saved;

  // ponytail: read after mount so server and client markup match. A saved collapse appears one frame late.
  useEffect(() => {
    if (isControlled) return;
    try {
      const value = localStorage.getItem(COLLAPSED_KEY);
      if (value !== null) setSaved(value === "1");
    } catch {} // Storage can be blocked. The sidebar still works for this page view.
  }, [isControlled]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setSaved(next);
    onCollapsedChange?.(next);
    if (isControlled) return;
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {}
  };

  const rail = collapsed && collapseMode === "rail";
  return (
    <ShellContext.Provider value={{ openDrawer: () => setDrawer(true), closeDrawer: () => setDrawer(false), toggleCollapsed, collapsed, hasSidebar: Boolean(sidebar) }}>
      <div className={cn("kr:flex kr:min-h-dvh kr:bg-bg kr:text-fg", className)}>
        {sidebar && (
          <>
            <aside
              className={cn(
                "kr:sticky kr:top-0 kr:hidden kr:h-dvh kr:shrink-0 kr:overflow-hidden kr:border-r kr:border-line kr:bg-surface kr:transition-[width] kr:duration-150",
                rail ? "kr:w-14" : "kr:w-60",
                !(collapsed && collapseMode === "hidden") && "kr:lg:block",
              )}
            >
              <RailContext.Provider value={rail}>{sidebar}</RailContext.Provider>
            </aside>
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

const initial = (text: unknown) => (typeof text === "string" && text ? text[0]!.toUpperCase() : "•");

/** In the icon rail `footer` gets only 56px. SidebarUser adapts by itself. For other content, use `useSidebar`. */
export function Sidebar({ brand, footer, children, className }: {
  brand?: { name: string; logo?: ReactNode };
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const fallback = useKora().brand;
  const rail = useContext(RailContext);
  const b = brand ?? fallback;
  return (
    <div className={cn("kr:flex kr:h-full kr:flex-col", className)}>
      {b && (
        <div className={cn("kr:flex kr:h-14 kr:shrink-0 kr:items-center kr:gap-2 kr:text-sm kr:font-semibold", rail ? "kr:justify-center" : "kr:px-4")}>
          {b.logo ?? (rail && <span aria-hidden>{initial(b.name)}</span>)}
          <span className={rail ? "kr:sr-only" : "kr:truncate"}>{b.name}</span>
        </div>
      )}
      <nav className="kr:min-h-0 kr:flex-1 kr:space-y-5 kr:overflow-x-hidden kr:overflow-y-auto kr:px-2 kr:py-2">{children}</nav>
      {footer && <div className="kr:shrink-0 kr:overflow-hidden kr:border-t kr:border-line kr:p-2">{footer}</div>}
    </div>
  );
}

export function SidebarSection({ label, children }: { label?: ReactNode; children: ReactNode }) {
  const rail = useContext(RailContext);
  return (
    <div>
      {label && !rail && <p className="kr:px-2 kr:pb-1 kr:text-xs kr:text-muted">{label}</p>}
      <ul className="kr:space-y-0.5">{children}</ul>
    </div>
  );
}

const rowClass = (rail: boolean) =>
  cn(
    "kr:relative kr:flex kr:h-11 kr:items-center kr:gap-2.5 kr:rounded-md kr:text-sm kr:transition-colors kr:lg:h-9 kr:[&_svg]:size-4 kr:[&_svg]:shrink-0",
    rail ? "kr:justify-center" : "kr:px-2",
    focusRing,
    "kr:focus-visible:-outline-offset-2",
  );
const activeRow = "kr:bg-accent-soft kr:font-medium kr:text-accent";
const idleRow = "kr:text-muted kr:hover:bg-surface-2 kr:hover:text-fg";

export function SidebarItem({ href, icon, active, badge, onClick, children }: {
  href: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { closeDrawer } = useContext(ShellContext);
  const rail = useContext(RailContext);
  const report = useContext(GroupContext);
  useEffect(() => {
    if (!active) return;
    report(1);
    return () => report(-1);
  }, [active, report]);

  const link = (
    <KoraLink
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        onClick?.();
        closeDrawer?.();
      }}
      className={cn(rowClass(rail), active ? activeRow : idleRow)}
    >
      {icon ?? (rail && <span aria-hidden className="kr:text-xs kr:font-medium">{initial(children)}</span>)}
      <span className={rail ? "kr:sr-only" : "kr:min-w-0 kr:flex-1 kr:truncate"}>{children}</span>
      {badge != null &&
        (rail ? (
          <>
            <span className="kr:sr-only">({badge})</span>
            <span aria-hidden className="kr:absolute kr:top-1.5 kr:right-1.5 kr:size-1.5 kr:rounded-full kr:bg-accent" />
          </>
        ) : (
          <Badge>{badge}</Badge>
        ))}
    </KoraLink>
  );
  return (
    <li>
      {rail ? (
        <Tooltip content={children} side="right">
          <span className="kr:block">{link}</span>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
}

/**
 * A menu level that opens and closes. Nest groups for more levels.
 * It opens by itself when it holds the active item. In the icon rail, it opens as a side menu.
 */
export function SidebarGroup({ label, icon, defaultOpen = false, children }: {
  label: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const shell = useContext(ShellContext);
  const rail = useContext(RailContext);
  const report = useContext(GroupContext);
  const [open, setOpen] = useState(defaultOpen);
  const [flyout, setFlyout] = useState(false);
  const [activeItems, setActiveItems] = useState(0);
  const listId = useId();
  const hasActive = activeItems > 0;

  const reportUp = useCallback(
    (delta: number) => {
      setActiveItems((n) => n + delta);
      report(delta);
    },
    [report],
  );
  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  const flyoutShell = useMemo(() => ({ ...shell, closeDrawer: () => setFlyout(false) }), [shell]);

  // This hidden list stays mounted in every mode, so active items below can always report.
  const list = (
    <GroupContext.Provider value={reportUp}>
      <RailContext.Provider value={false}>
        <ul id={listId} hidden={rail || !open} className="kr:mt-0.5 kr:ml-4 kr:space-y-0.5 kr:border-l kr:border-line kr:pl-2">
          {children}
        </ul>
      </RailContext.Provider>
    </GroupContext.Provider>
  );

  if (rail) {
    return (
      <li>
        <Popover.Root open={flyout} onOpenChange={setFlyout}>
          <Popover.Trigger className={cn(rowClass(true), "kr:w-full kr:cursor-pointer", hasActive ? activeRow : idleRow)}>
            {icon ?? <span aria-hidden className="kr:text-xs kr:font-medium">{initial(label)}</span>}
            <span className="kr:sr-only">{label}</span>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="right" align="start" sideOffset={8} collisionPadding={8} className={cn(popoverClass, "kr:max-h-[80dvh] kr:w-56 kr:overflow-y-auto kr:p-1")}>
              <p className="kr:px-2 kr:py-1.5 kr:text-xs kr:text-muted">{label}</p>
              <ShellContext.Provider value={flyoutShell}>
                <GroupContext.Provider value={noReport}>
                  <RailContext.Provider value={false}>
                    <ul className="kr:space-y-0.5">{children}</ul>
                  </RailContext.Provider>
                </GroupContext.Provider>
              </ShellContext.Provider>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        {list}
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className={cn(rowClass(false), "kr:w-full kr:cursor-pointer kr:text-left", hasActive && !open ? activeRow : hasActive ? "kr:font-medium kr:text-fg kr:hover:bg-surface-2" : idleRow)}
      >
        {icon}
        <span className="kr:min-w-0 kr:flex-1 kr:truncate">{label}</span>
        <ChevronRight aria-hidden className={cn("kr:transition-transform", open && "kr:rotate-90")} />
      </button>
      {list}
    </li>
  );
}

export function Topbar({ children, className }: { children?: ReactNode; className?: string }) {
  const { openDrawer, toggleCollapsed, collapsed, hasSidebar } = useContext(ShellContext);
  const t = useLabels();
  return (
    <header className={cn("kr:sticky kr:top-0 kr:z-40 kr:flex kr:h-14 kr:shrink-0 kr:items-center kr:gap-2 kr:border-b kr:border-line kr:bg-surface kr:px-2 kr:lg:px-6", className)}>
      {hasSidebar && (
        <>
          <Button variant="ghost" size="icon" aria-label={t.menu} onClick={openDrawer} className="kr:lg:hidden">
            <Menu aria-hidden />
          </Button>
          {/* The wrapper hides the button, because `hidden` loses to the inline-flex of Button in the compiled CSS. */}
          <span className="kr:hidden kr:lg:contents">
            <Button variant="ghost" size="icon" aria-label={collapsed ? t.expandSidebar : t.collapseSidebar} aria-expanded={!collapsed} onClick={toggleCollapsed}>
              {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
            </Button>
          </span>
        </>
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
