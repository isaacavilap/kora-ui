import type { ReactNode } from "react";
import { Popover } from "radix-ui";
import { ChevronDown, Search, X } from "lucide-react";
import { Button, popoverClass } from "../components/button";
import { Badge } from "../components/display";
import { Checkbox, Input } from "../components/form";
import { cn, useLabels } from "../components/provider";

export type FilterOption = { value: string; label: ReactNode };

/** Filter that accepts several values. Selected values match any of them. */
export function FilterSelect({ label, icon, hideCount, options, value, onChange, className }: {
  label: string;
  icon?: ReactNode;
  hideCount?: boolean;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const t = useLabels();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" className={cn("kr:w-full kr:justify-between kr:px-3 kr:font-normal", className)}>
          {icon}
          <span className="kr:truncate">{label}</span>
          <span className="kr:ml-auto kr:flex kr:shrink-0 kr:items-center kr:gap-1.5">
            {!hideCount && value.length > 0 && <Badge>{value.length}</Badge>}
            <ChevronDown aria-hidden className="kr:text-muted" />
          </span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={4} collisionPadding={8} className={cn(popoverClass, "kr:max-h-72 kr:w-[var(--radix-popover-trigger-width)] kr:min-w-52 kr:overflow-y-auto kr:p-1")}>
          {options.map((o) => (
            <label key={o.value} className="kr:flex kr:min-h-10 kr:cursor-pointer kr:items-center kr:gap-2.5 kr:rounded-sm kr:px-2.5 kr:text-sm kr:hover:bg-surface-2 kr:md:min-h-8">
              <Checkbox
                checked={value.includes(o.value)}
                onCheckedChange={(checked) => onChange(checked === true ? [...value, o.value] : value.filter((v) => v !== o.value))}
              />
              <span className="kr:min-w-0 kr:truncate">{o.label}</span>
            </label>
          ))}
          {options.length === 0 && <p className="kr:px-2.5 kr:py-3 kr:text-center kr:text-sm kr:text-muted">{t.noResults}</p>}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Search field and filters. They stack on phones and share one row on wider screens. */
export function FilterBar({ search, onSearchChange, searchPlaceholder, onClear, actions, children, className }: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Shows the clear button when set. Pass it only while a filter is active. */
  onClear?: () => void;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const t = useLabels();
  return (
    <div className={cn("kr:mb-3 kr:flex kr:flex-col kr:gap-2 kr:md:flex-row kr:md:flex-wrap kr:md:items-center", className)}>
      {onSearchChange && (
        <div className="kr:relative kr:w-full kr:md:w-64">
          <Search aria-hidden className="kr:pointer-events-none kr:absolute kr:top-1/2 kr:left-3 kr:size-4 kr:-translate-y-1/2 kr:text-muted" />
          <Input
            type="search"
            aria-label={searchPlaceholder ?? t.search}
            placeholder={searchPlaceholder ?? t.searchPlaceholder}
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="kr:pl-9"
          />
        </div>
      )}
      {children && <div className="kr:grid kr:grid-cols-2 kr:gap-2 kr:md:flex kr:md:flex-wrap kr:md:items-center kr:[&>*]:min-w-0 kr:md:[&>*]:w-44">{children}</div>}
      {onClear && (
        <Button variant="ghost" onClick={onClear}>
          <X aria-hidden />
          {t.clearFilters}
        </Button>
      )}
      {actions && <div className="kr:flex kr:flex-wrap kr:items-center kr:gap-2 kr:md:ml-auto">{actions}</div>}
    </div>
  );
}
