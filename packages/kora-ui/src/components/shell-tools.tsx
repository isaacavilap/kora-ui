import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Dialog as D, Popover } from "radix-ui";
import { DropdownMenu as M } from "radix-ui";
import { Bell, Check, ChevronsUpDown, Monitor, Moon, Search, Sun } from "lucide-react";
import { Button, focusRing, popoverClass } from "./button";
import { Avatar } from "./display";
import { Input } from "./form";
import { useSidebar } from "./layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./overlay";
import { cn, KoraLink, useLabels } from "./provider";

const THEME_KEY = "kora-theme";
const TEXT_KEY = "kora-text-size";

/** The inline script for the document head: applies the saved theme and text size before the first paint.
 * `defaultTheme` is used until the person picks one. */
export function makeThemeScript(defaultTheme: "light" | "dark" | "system" = "system") {
  const fallback = defaultTheme === "system" ? 'matchMedia("(prefers-color-scheme: dark)").matches' : String(defaultTheme === "dark");
  return `(function(){try{var r=document.documentElement,t=localStorage.getItem("${THEME_KEY}"),s=localStorage.getItem("${TEXT_KEY}");var d=t?t==="dark":${fallback};r.classList.toggle("dark",d);if(s)r.style.fontSize=s+"%"}catch(e){}})()`;
}

/** Add to an inline script in the document head, so the saved theme and text size apply before the first paint. */
export const themeScript = makeThemeScript();

/** Put it in the document head, so the saved theme applies before the first paint. Works in a server layout.
 * `defaultTheme` is used until the person picks one. Default system. */
export function ThemeScript({ defaultTheme = "system" }: { defaultTheme?: "light" | "dark" | "system" }) {
  return <script dangerouslySetInnerHTML={{ __html: makeThemeScript(defaultTheme) }} />;
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

/** Percent of the browser size, shown as the pixels of body text. */
const textSizes = [87.5, 100, 112.5, 125] as const;

/** Theme and text size of this person, on this device. A size chosen here wins over the one of the site, set with ThemeColors. */
function DisplayPreferences() {
  const t = useLabels();
  const root = document.documentElement;
  const saved = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const save = (key: string, value: string | null) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {}
  };
  const [theme, setTheme] = useState(() => saved(THEME_KEY) ?? "system");
  // Without a choice, the size shown is the one the site uses now.
  const [size, setSize] = useState(() => String(saved(TEXT_KEY) ?? Math.round((parseFloat(getComputedStyle(root).fontSize) / 16) * 1000) / 10));

  const chooseTheme = (value: string) => {
    setTheme(value);
    save(THEME_KEY, value === "system" ? null : value);
    root.classList.toggle("dark", value === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : value === "dark");
  };
  const chooseSize = (value: string) => {
    setSize(value);
    save(TEXT_KEY, value);
    root.style.fontSize = `${value}%`;
  };
  const chip = "kr:flex kr:min-h-10 kr:flex-1 kr:cursor-pointer kr:items-center kr:justify-center kr:gap-1.5 kr:whitespace-nowrap kr:rounded-sm kr:px-1.5 kr:text-sm kr:outline-none kr:select-none kr:md:min-h-8 kr:[&_svg]:size-4 kr:data-[highlighted]:bg-surface-2 kr:data-[state=checked]:bg-accent-soft kr:data-[state=checked]:font-medium";
  const group = (label: string, value: string, onChange: (value: string) => void, options: Array<{ value: string; label: string; icon?: ReactNode }>) => (
    <M.Group>
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      <M.RadioGroup value={value} onValueChange={onChange} className="kr:flex kr:gap-1 kr:px-1 kr:pb-1">
        {options.map((option) => (
          <M.RadioItem key={option.value} value={option.value} className={chip} aria-label={option.label} title={option.label} onSelect={(event) => event.preventDefault()}>
            {option.icon ?? <span aria-hidden>{option.label.replace(" px", "")}</span>}
          </M.RadioItem>
        ))}
      </M.RadioGroup>
    </M.Group>
  );
  return (
    <>
      {group(t.theme, theme, chooseTheme, [
        { value: "light", label: t.themeLight, icon: <Sun aria-hidden /> },
        { value: "dark", label: t.themeDark, icon: <Moon aria-hidden /> },
        { value: "system", label: t.themeSystem, icon: <Monitor aria-hidden /> },
      ])}
      {group(t.textSize, size, chooseSize, textSizes.map((value) => ({ value: String(value), label: `${(value * 16) / 100} px` })))}
      <DropdownMenuSeparator />
    </>
  );
}

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  icon?: ReactNode;
  /** Extra words to match, such as "billing" for an Invoices page. */
  keywords?: string;
  /** Muted text at the end of the row, such as the customer of an order. */
  description?: ReactNode;
  /** Links through the router set on KoraProvider. */
  href?: string;
  onSelect?: () => void;
};

export function filterCommands(items: CommandItem[], query: string) {
  const q = query.trim().toLowerCase();
  return q ? items.filter((i) => `${i.label} ${i.keywords ?? ""} ${i.group ?? ""}`.toLowerCase().includes(q)) : items;
}

/** Search for pages and actions. Opens with its button, or with Cmd+K or Ctrl+K. */
export function CommandPalette({ items, placeholder, onQueryChange, className }: {
  items: CommandItem[];
  placeholder?: string;
  /** Called with each change of the text, and with "" on close. Use it to fetch results from your server and pass them in `items`. */
  onQueryChange?: (query: string) => void;
  className?: string;
}) {
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
    if (!next) {
      setQuery("");
      onQueryChange?.("");
    }
  };
  const optionClass = (selected: boolean) =>
    cn(
      "kr:flex kr:min-h-11 kr:w-full kr:cursor-pointer kr:items-center kr:gap-2.5 kr:rounded-sm kr:px-2.5 kr:text-left kr:text-sm kr:md:min-h-9 kr:[&_svg]:size-4 kr:[&_svg]:shrink-0 kr:[&_svg]:text-muted",
      selected && "kr:bg-surface-2",
    );

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className={cn("kr:px-2.5 kr:font-normal kr:text-muted kr:max-md:border-transparent kr:max-md:bg-transparent kr:max-md:shadow-none", className)}>
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
              onChange={(e) => {
                setQuery(e.target.value);
                onQueryChange?.(e.target.value);
              }}
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
                    const content = (
                      <>
                        {item.icon}
                        <span className="kr:min-w-0 kr:truncate">{item.label}</span>
                        {item.description && <span className="kr:ml-auto kr:min-w-0 kr:shrink kr:truncate kr:pl-3 kr:text-xs kr:text-muted">{item.description}</span>}
                      </>
                    );
                    return item.href ? (
                      <KoraLink key={item.id} href={item.href} {...shared}>{content}</KoraLink>
                    ) : (
                      <button key={item.id} type="button" {...shared}>{content}</button>
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
                    <span className="kr:block kr:text-sm">{item.title}</span>
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

/** The avatar of the signed-in person, for the Topbar. Touching it opens a menu. Put DropdownMenuItem in `children`. */
export function UserMenu({ name, email, avatar, seed, preferences = true, children, className }: {
  name: string;
  email?: string;
  /** A photo. */
  avatar?: string;
  /** Usually the id of the person. With no photo, it draws a generated avatar in place of the initials. */
  seed?: string;
  /** Theme and text size, saved on this device. On by default. */
  preferences?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const t = useLabels();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t.accountMenu}: ${name}`}
        className={cn("kr:flex kr:size-11 kr:shrink-0 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-md kr:hover:bg-surface-2 kr:md:size-9", focusRing, className)}
      >
        <span aria-hidden className="kr:flex"><Avatar name={name} src={avatar} seed={seed} size={28} /></span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={preferences ? "kr:w-64" : undefined}>
        <div className={cn("kr:border-b kr:border-line kr:px-2.5 kr:pt-1.5 kr:pb-2 kr:mb-1", !preferences && "kr:max-w-64")}>
          <p className="kr:truncate kr:text-sm kr:font-medium kr:text-fg">{name}</p>
          {email && <p className="kr:truncate kr:text-xs kr:text-muted">{email}</p>}
        </div>
        {preferences && <DisplayPreferences />}
        {children}
      </DropdownMenuContent>
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
          <span aria-hidden className="kr:flex kr:[&_svg]:size-4">{current?.logo ?? <span className="kr:text-xs kr:font-medium">{current?.label[0]?.toUpperCase()}</span>}</span>
        ) : (
          <>
            {current?.logo && <span aria-hidden className="kr:flex kr:[&_svg]:size-4">{current.logo}</span>}
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
              {o.logo && <span aria-hidden className="kr:flex kr:[&_svg]:size-4">{o.logo}</span>}
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
