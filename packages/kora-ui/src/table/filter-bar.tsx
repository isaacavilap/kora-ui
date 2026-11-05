import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Button } from "../components/button";
import { Input } from "../components/form";
import { cn, useLabels } from "../components/provider";

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
