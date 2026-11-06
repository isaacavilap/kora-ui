import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Dialog as D, Popover } from "radix-ui";
import { Bell, Check, ChevronsUpDown, Moon, Search, Sun } from "lucide-react";
import { Button, focusRing, popoverClass } from "./button";
import { Avatar } from "./display";
import { Input } from "./form";
import { useSidebar } from "./layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./overlay";
import { cn, KoraLink, useLabels } from "./provider";

const THEME_KEY = "kora-theme";

/** Add to an inline script in the document head, so the saved theme applies before the first paint. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

/** Put it in the document head, so the saved theme applies before the first paint. Works in a server layout. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

/** Switches the `.dark` class on the page and saves the choice. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useLabels();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t.toggleTheme}
      className={className}
      onClick={() => {
        const dark = document.documentElement.classList.toggle("dark");
        try {
          localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
        } catch {}
      }}
    >
      <Sun aria-hidden className="kr:hidden kr:dark:block" />
      <Moon aria-hidden className="kr:dark:hidden" />
    </Button>
  );
}

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  icon?: ReactNode;
  /** Extra words to match, such as "billing" for an Invoices page. */
  keywords?: string;
  /** Links through the router set on KoraProvider. */
  href?: string;
  onSelect?: () => void;
};

export function filterCommands(items: CommandItem[], query: string) {
  const q = query.trim().toLowerCase();
  return q ? items.filter((i) => `${i.label} ${i.keywords ?? ""} ${i.group ?? ""}`.toLowerCase().includes(q)) : items;
}

/** Search for pages and actions. Opens with its button, or with Cmd+K or Ctrl+K. */
export function CommandPalette({ items, placeholder, className }: { items: CommandItem[]; placeholder?: string; className?: string }) {
  const t = useLabels();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => filterCommands(items, query), [items, query]);
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of results) map.set(item.group ?? "", [...(map.get(item.group ?? "") ?? []), item]);
    return [...map];
  }, [results]);
  const ordered = groups.flatMap(([, list]) => list);
  const options = () => listRef.current?.querySelectorAll<HTMLElement>("[role=option]");

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘K");
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => setActive(0), [query, open]);
  useEffect(() => {
    options()?.[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const change = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };
  const optionClass = (selected: boolean) =>
    cn(
      "kr:flex kr:min-h-11 kr:w-full kr:cursor-pointer kr:items-center kr:gap-2.5 kr:rounded-sm kr:px-2.5 kr:text-left kr:text-sm kr:md:min-h-9 kr:[&_svg]:size-4 kr:[&_svg]:shrink-0 kr:[&_svg]:text-muted",
      selected && "kr:bg-surface-2",
    );

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className={cn("kr:px-2.5 kr:font-normal kr:text-muted", className)}>
        <Search aria-hidden />
        <span className="kr:sr-only kr:md:not-sr-only">{t.search}</span>
        <kbd aria-hidden className="kr:hidden kr:rounded-sm kr:border kr:border-line kr:px-1 kr:font-sans kr:text-xs kr:md:inline">{shortcut}</kbd>
      </Button>
      <D.Root open={open} onOpenChange={change}>
        <D.Portal>
          <D.Overlay className="kr:fixed kr:inset-0 kr:z-50 kr:bg-black/50 kr:animate-[kr-fade-in_150ms_ease-out]" />
          <D.Content aria-describedby={undefined} className={cn(popoverClass, "kr:fixed kr:inset-x-3 kr:top-[10dvh] kr:mx-auto kr:max-w-xl kr:p-2")}>
            <D.Title className="kr:sr-only">{t.commandTitle}</D.Title>
            <Input
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-label={placeholder ?? t.commandPlaceholder}
              aria-activedescendant={ordered[active] ? `${listId}-${ordered[active]!.id}` : undefined}
              placeholder={placeholder ?? t.commandPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, ordered.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  options()?.[active]?.click();
                }
              }}
            />
            <div ref={listRef} id={listId} role="listbox" aria-label={t.commandTitle} className="kr:mt-2 kr:max-h-[50dvh] kr:overflow-y-auto">
              {groups.map(([group, list]) => (
                <div key={group} role="group" aria-label={group || undefined} className="kr:mb-1">
                  {group && <p aria-hidden className="kr:px-2.5 kr:py-1 kr:text-xs kr:text-muted">{group}</p>}
                  {list.map((item) => {
                    const selected = ordered[active]?.id === item.id;
                    const shared = {
                      id: `${listId}-${item.id}`,
                      role: "option",
                      "aria-selected": selected,
                      tabIndex: -1,
                      className: optionClass(selected),
                      onMouseMove: () => setActive(ordered.indexOf(item)),
                      onClick: () => {
                        item.onSelect?.();
                        change(false);
                      },
                    };
                    return item.href ? (
                      <KoraLink key={item.id} href={item.href} {...shared}>{item.icon}{item.label}</KoraLink>
                    ) : (
                      <button key={item.id} type="button" {...shared}>{item.icon}{item.label}</button>
                    );
                  })}
                </div>
              ))}
              {results.length === 0 && <p className="kr:px-2.5 kr:py-6 kr:text-center kr:text-sm kr:text-muted">{t.noResults}</p>}
            </div>
          </D.Content>
        </D.Portal>
      </D.Root>
    </>
  );
}

export type Notification = { id: string; title: ReactNode; description?: ReactNode; time?: ReactNode; unread?: boolean; href?: string };

/** Bell with the unread count, and a list of notifications. Reading state stays in your code. */
export function NotificationsMenu({ items, onMarkAllRead, onSelect, className }: {
  items: Notification[];
  onMarkAllRead?: () => void;
  onSelect?: (item: Notification) => void;
  className?: string;
}) {
  const t = useLabels();
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => i.unread).length;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" className={cn("kr:relative", className)}>
          <Bell aria-hidden />
          <span className="kr:sr-only">{t.notifications} </span>
          {unread > 0 && (
            <span className="kr:absolute kr:top-1 kr:right-1 kr:flex kr:h-4 kr:min-w-4 kr:items-center kr:justify-center kr:rounded-full kr:bg-accent kr:px-1 kr:text-[0.625rem] kr:font-medium kr:text-accent-fg kr:tabular-nums">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={6} collisionPadding={8} className={cn(popoverClass, "kr:w-[min(22rem,calc(100vw-1rem))]")}>
          <div className="kr:flex kr:min-h-11 kr:items-center kr:justify-between kr:gap-2 kr:border-b kr:border-line kr:px-3">
            <p className="kr:text-sm kr:font-medium">{t.notifications}</p>
            {onMarkAllRead && unread > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllRead}>{t.markAllRead}</Button>
            )}
          </div>
          <ul className="kr:max-h-[60dvh] kr:divide-y kr:divide-line kr:overflow-y-auto">
            {items.map((item) => {
              const content = (
                <>
                  <span aria-hidden className={cn("kr:mt-1.5 kr:size-2 kr:shrink-0 kr:rounded-full", item.unread ? "kr:bg-accent" : "kr:bg-transparent")} />
                  <span className="kr:min-w-0 kr:flex-1">
                    <span className={cn("kr:block kr:text-sm", item.unread && "kr:font-medium")}>{item.title}</span>
                    {item.description && <span className="kr:block kr:text-[0.8125rem] kr:text-muted">{item.description}</span>}
                    {item.time && <span className="kr:mt-0.5 kr:block kr:text-xs kr:text-muted">{item.time}</span>}
                  </span>
                </>
              );
              const rowClass = cn("kr:flex kr:w-full kr:cursor-pointer kr:gap-2 kr:p-3 kr:text-left kr:hover:bg-surface-2", focusRing, "kr:focus-visible:-outline-offset-2");
              const select = () => {
                onSelect?.(item);
                setOpen(false);
              };
              return (
                <li key={item.id}>
                  {item.href ? (
                    <KoraLink href={item.href} onClick={select} className={rowClass}>{content}</KoraLink>
                  ) : (
                    <button type="button" onClick={select} className={rowClass}>{content}</button>
                  )}
                </li>
              );
            })}
            {items.length === 0 && <li className="kr:px-3 kr:py-8 kr:text-center kr:text-sm kr:text-muted">{t.noNotifications}</li>}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** User row for the Sidebar footer. It shrinks to the avatar in the icon rail. `children` are the menu items. */
export function SidebarUser({ name, email, avatar, children }: { name: string; email?: string; avatar?: string; children: ReactNode }) {
  const { rail } = useSidebar();
  const t = useLabels();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("kr:flex kr:min-h-11 kr:w-full kr:cursor-pointer kr:items-center kr:gap-2.5 kr:rounded-md kr:text-left kr:hover:bg-surface-2 kr:lg:min-h-9", rail ? "kr:justify-center" : "kr:px-1.5", focusRing, "kr:focus-visible:-outline-offset-2")}
      >
        <span className="kr:sr-only">{`${t.accountMenu}: `}{rail && name}</span>
        <span aria-hidden className="kr:flex kr:shrink-0"><Avatar name={name} src={avatar} size={rail ? 28 : 30} /></span>
        {!rail && (
          <>
            <span className="kr:min-w-0 kr:flex-1">
              <span className="kr:block kr:truncate kr:text-sm kr:font-medium">{name}</span>
              {email && <span className="kr:block kr:truncate kr:text-xs kr:text-muted">{email}</span>}
            </span>
            <ChevronsUpDown aria-hidden className="kr:size-4 kr:shrink-0 kr:text-muted" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={rail ? "right" : "top"} align={rail ? "end" : "start"}>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export type ScopeOption = {
  value: string;
  label: string;
  description?: ReactNode;
  logo?: ReactNode;
  /** Options with the same group sit together under this heading, such as "Companies". */
  group?: string;
};

/** Sets what the whole app is showing, such as a company, branch, or team. Put it in the Sidebar `scope` slot. */
export function ScopeSwitcher({ label, options, value, onChange }: { label: string; options: ScopeOption[]; value: string; onChange: (value: string) => void }) {
  const { rail } = useSidebar();
  const t = useLabels();
  const current = options.find((o) => o.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("kr:flex kr:min-h-11 kr:w-full kr:cursor-pointer kr:items-center kr:gap-2 kr:rounded-md kr:border kr:border-line kr:text-left kr:text-sm kr:hover:bg-surface-2 kr:lg:min-h-9", rail ? "kr:justify-center" : "kr:px-2.5", focusRing)}
      >
        <span className="kr:sr-only">{`${t.switchScope} ${label}: `}{rail && current?.label}</span>
        {rail ? (
          <span aria-hidden>{current?.logo ?? <span className="kr:text-xs kr:font-medium">{current?.label[0]?.toUpperCase()}</span>}</span>
        ) : (
          <>
            {current?.logo && <span aria-hidden className="kr:flex">{current.logo}</span>}
            <span className="kr:min-w-0 kr:flex-1 kr:truncate kr:font-medium">{current?.label}</span>
            <ChevronsUpDown aria-hidden className="kr:size-4 kr:shrink-0 kr:text-muted" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side={rail ? "right" : "bottom"} className="kr:w-[max(var(--radix-dropdown-menu-trigger-width),16rem)] kr:p-1.5">
        {options.map((o, i) => (
          <Fragment key={o.value}>
            {o.group !== options[i - 1]?.group && i > 0 && <DropdownMenuSeparator className="kr:my-1.5" />}
            {o.group && o.group !== options[i - 1]?.group && <DropdownMenuLabel className="kr:block">{o.group}</DropdownMenuLabel>}
            <DropdownMenuItem className="kr:gap-2.5 kr:py-2 kr:not-first:mt-0.5" onSelect={() => onChange(o.value)}>
              {o.logo && <span aria-hidden className="kr:flex">{o.logo}</span>}
              <span className="kr:min-w-0 kr:flex-1">
                <span className="kr:block kr:truncate kr:leading-5">{o.label}</span>
                {o.description && <span className="kr:mt-0.5 kr:block kr:truncate kr:text-xs kr:leading-4 kr:text-muted">{o.description}</span>}
              </span>
              {o.value === value && <Check aria-hidden className="kr:size-4 kr:text-accent" />}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
