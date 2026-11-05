import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { DayPicker, type DateRange } from "@daypicker/react";
import { es as dayEs } from "@daypicker/react/locale";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { FieldContext, Input, useFieldProps } from "./form";
import { Button } from "./button";
import { cn, useKora, useLabels } from "./provider";

export type { DateRange };

const popoverClass =
  "kr:z-50 kr:rounded-md kr:border kr:border-line kr:bg-surface kr:text-fg kr:shadow-overlay kr:outline-none kr:animate-[kr-pop-in_120ms_ease-out]";

export type ComboboxOption = { value: string; label: string };

export function filterOptions(options: ComboboxOption[], query: string) {
  const q = query.trim().toLowerCase();
  return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
}

export function Combobox({ options, value, onChange, placeholder, searchPlaceholder, emptyText, disabled, className, id, "aria-label": ariaLabel }: {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const t = useLabels();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const results = useMemo(() => filterOptions(options, query), [options, query]);
  const selected = options.find((o) => o.value === value);
  const field = useFieldProps({ id });

  useEffect(() => setActive(0), [query, open]);
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (option?: ComboboxOption) => {
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          {...field}
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn("kr:w-full kr:justify-between kr:px-3 kr:font-normal", !selected && "kr:text-muted", className)}
        >
          <span className="kr:truncate">{selected?.label ?? placeholder ?? t.selectPlaceholder}</span>
          <ChevronDown aria-hidden className="kr:text-muted" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={4} collisionPadding={8} className={cn(popoverClass, "kr:w-[var(--radix-popover-trigger-width)] kr:min-w-56 kr:max-w-[calc(100vw-1rem)] kr:p-1")}>
          <FieldContext.Provider value={null}>
          <Input
            autoFocus
            role="searchbox"
            aria-controls={listId}
            aria-label={searchPlaceholder ?? t.searchPlaceholder}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            placeholder={searchPlaceholder ?? t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                choose(results[active]);
              }
            }}
          />
          </FieldContext.Provider>
          <ul ref={listRef} id={listId} role="listbox" className="kr:mt-1 kr:max-h-60 kr:overflow-y-auto">
            {results.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === value}
                onClick={() => choose(o)}
                onMouseMove={() => setActive(i)}
                className={cn(
                  "kr:flex kr:min-h-10 kr:cursor-pointer kr:items-center kr:justify-between kr:gap-3 kr:rounded-sm kr:px-2.5 kr:text-sm kr:md:min-h-8",
                  i === active && "kr:bg-surface-2",
                )}
              >
                {o.label}
                {o.value === value && <Check aria-hidden className="kr:size-4 kr:text-accent" />}
              </li>
            ))}
            {results.length === 0 && <li className="kr:px-2.5 kr:py-3 kr:text-center kr:text-sm kr:text-muted">{emptyText ?? t.noResults}</li>}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 48rem)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

export type DatePreset = { label: string; range: () => DateRange };

/** Shows two months on desktop and one on phones. */
export function DateRangePicker({ value, onChange, presets, placeholder, disabled, className, id, "aria-label": ariaLabel }: {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  presets?: DatePreset[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const t = useLabels();
  const { locale } = useKora();
  const wide = useIsWide();
  const [open, setOpen] = useState(false);
  const field = useFieldProps({ id });
  const format = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }), [locale]);
  const text = value?.from ? (value.to ? format.formatRange(value.from, value.to) : format.format(value.from)) : (placeholder ?? t.pickDates);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button {...field} variant="secondary" aria-label={ariaLabel} disabled={disabled} className={cn("kr:justify-start kr:px-3 kr:font-normal", !value?.from && "kr:text-muted", className)}>
          <Calendar aria-hidden className="kr:text-muted" />
          <span className="kr:truncate">{text}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={4} collisionPadding={8} className={cn(popoverClass, "kr:max-w-[calc(100vw-1rem)] kr:p-3")}>
          <div className="kr:flex kr:flex-col kr:gap-3 kr:md:flex-row">
            {presets && (
              <div className="kr:flex kr:gap-1 kr:overflow-x-auto kr:md:flex-col kr:md:border-r kr:md:border-line kr:md:pr-3">
                {presets.map((p) => (
                  <Button key={p.label} variant="ghost" size="sm" className="kr:justify-start" onClick={() => onChange(p.range())}>
                    {p.label}
                  </Button>
                ))}
              </div>
            )}
            <DayPicker
              mode="range"
              selected={value}
              onSelect={onChange}
              numberOfMonths={wide ? 2 : 1}
              locale={locale === "es" ? dayEs : undefined}
              defaultMonth={value?.from}
              classNames={{
                root: "kr:text-sm",
                months: "kr:relative kr:flex kr:gap-4",
                month_caption: "kr:flex kr:h-9 kr:items-center kr:justify-center kr:font-medium",
                nav: "kr:absolute kr:inset-x-0 kr:top-0 kr:z-10 kr:flex kr:justify-between",
                button_previous: "kr:inline-flex kr:size-9 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-md kr:hover:bg-surface-2",
                button_next: "kr:inline-flex kr:size-9 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-md kr:hover:bg-surface-2",
                chevron: "kr:size-4 kr:fill-current",
                month_grid: "kr:mt-1 kr:border-collapse",
                weekday: "kr:size-10 kr:text-xs kr:font-normal kr:text-muted kr:md:size-9",
                day: "kr:size-10 kr:p-0 kr:text-center kr:md:size-9",
                day_button: "kr:size-full kr:cursor-pointer kr:rounded-sm kr:tabular-nums kr:outline-none kr:hover:bg-surface-2 kr:focus-visible:ring-2 kr:focus-visible:ring-accent",
                today: "kr:font-semibold kr:text-accent",
                outside: "kr:text-muted kr:opacity-50",
                disabled: "kr:opacity-40",
                range_start: "kr:[&_button]:bg-accent kr:[&_button]:text-accent-fg kr:[&_button]:hover:bg-accent-hover",
                range_end: "kr:[&_button]:bg-accent kr:[&_button]:text-accent-fg kr:[&_button]:hover:bg-accent-hover",
                range_middle: "kr:bg-accent-soft",
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
