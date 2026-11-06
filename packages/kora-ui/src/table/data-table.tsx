import { Fragment, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  functionalUpdate,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronsUpDown, Columns3, Download, LayoutGrid, MoreHorizontal, Rows3 } from "lucide-react";
import { Button } from "../components/button";
import { EmptyState, Skeleton } from "../components/display";
import { Checkbox, Select } from "../components/form";
import { DateRangePicker, type DateRange } from "../components/pickers";
import { Pagination } from "../components/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../components/overlay";
import { SegmentedControl } from "../components/widgets";
import { cn, useLabels } from "../components/provider";
import { FilterBar, FilterSelect, type FilterOption } from "./filter-bar";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
});

export type DataTableColumnFilter =
  /** Multiple choice. Client mode builds `options` from the data when omitted. Server mode needs them. */
  | { type: "select"; options?: FilterOption[] }
  | { type: "date" };

/** Select filters hold the chosen values. Date filters hold a range. */
export type DataTableFilters = Record<string, string[] | DateRange | undefined>;

const isActive = (value: DataTableFilters[string]) => (Array.isArray(value) ? value.length > 0 : Boolean(value?.from));

/** Date-only strings parse as local days, because `new Date("2026-03-01")` is UTC and can land on the day before. */
function toTime(value: unknown) {
  if (value === null || value === undefined || value === "") return NaN;
  const text = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  return new Date(text as string | number | Date).getTime();
}

/** The client mode test for one filter. A date range includes all of its last day. */
export function matchesFilter(value: unknown, filter: DataTableFilters[string]) {
  if (!filter || !isActive(filter)) return true;
  if (Array.isArray(filter)) return value !== null && value !== undefined && filter.includes(String(value));
  const time = toTime(value);
  const end = new Date(filter.to ?? filter.from!);
  end.setHours(23, 59, 59, 999);
  const start = new Date(filter.from!);
  start.setHours(0, 0, 0, 0);
  return time >= start.getTime() && time <= end.getTime();
}

const readValue = <T extends Record<string, any>>(row: T, c: DataTableColumn<T>) => {
  const value = typeof c.accessor === "function" ? c.accessor(row) : c.accessor ? row[c.accessor] : undefined;
  return value === null ? undefined : value;
};

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Text label for the phone layout and sort menu. Defaults to `header` when it is a string. */
  label?: string;
  /** A key of the row, or a function that returns the value used to sort and search. */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom rendering. Defaults to the accessor value. */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  /** Adds a control for this column above the table. */
  filter?: DataTableColumnFilter;
  /** A totals row. It receives every filtered row in client mode, and the current page in server mode. */
  footer?: (rows: T[]) => ReactNode;
  align?: "left" | "right";
  /** Leaves the column out of the phone layout. */
  hideOnMobile?: boolean;
};

export type DataTableState = {
  pageIndex: number;
  pageSize: number;
  sorting: Array<{ id: string; desc: boolean }>;
  /** Server mode: apply these when you fetch. Debounce `search`, because it changes on each keystroke. */
  filters?: DataTableFilters;
  search?: string;
};

export type DataTableProps<T extends Record<string, any>> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T, index: number) => string;
  /** Client mode: rows per page, and text to match against all columns. */
  pageSize?: number;
  search?: string;
  /** Adds a search field above the table. Leave off `search` to let the table keep the text. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Shown at the end of the filter row. */
  toolbarActions?: ReactNode;
  /** Adds a menu to show or hide columns. */
  columnToggle?: boolean;
  /** Adds a menu at the end of each row. Return DropdownMenuItem elements. */
  rowActions?: (row: T) => ReactNode;
  /** Adds a table and card switch on wider screens. Phones already use cards. */
  viewToggle?: boolean;
  /** Adds a button to each row that shows more below it. */
  renderExpanded?: (row: T) => ReactNode;
  /** Controlled filters, such as ones kept in the URL. Use with `onFiltersChange`. */
  filters?: DataTableFilters;
  onFiltersChange?: (filters: DataTableFilters) => void;
  onSearchChange?: (search: string) => void;
  /** Adds a CSV button that exports the visible columns of the filtered rows. In server mode it has only the current page, so export from your server for more. */
  exportFilename?: string;
  /** Server mode: the parent fetches each page. `data` holds only the current page. */
  manual?: boolean;
  rowCount?: number;
  state?: DataTableState;
  onStateChange?: (state: DataTableState) => void;
  selectable?: boolean;
  /** Shown while rows are selected. Call `clear` to reset the selection. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  empty?: ReactNode;
  /** Phone layout. `cards` stacks each row; `scroll` keeps the table and scrolls sideways. */
  mobile?: "cards" | "scroll";
  className?: string;
};

/**
 * Text that opens safely in a spreadsheet. A leading quote stops cells such as
 * `=HYPERLINK(...)` from running as formulas, since table data can come from users.
 */
export function toCsv(headers: string[], rows: unknown[][]) {
  const cell = (value: unknown) => {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    let text = String(value);
    if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}

function download(filename: string, text: string) {
  // The byte order mark lets Excel read accents correctly.
  const url = URL.createObjectURL(new Blob(["\ufeff", text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function optionsFrom<T extends Record<string, any>>(data: T[], c: DataTableColumn<T>): FilterOption[] {
  const values = new Set<string>();
  for (const row of data) {
    const value = readValue(row, c);
    if (value !== undefined && value !== "") values.add(String(value));
  }
  return [...values].sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  getRowId,
  pageSize = 10,
  search: searchProp,
  searchable,
  searchPlaceholder,
  toolbarActions,
  columnToggle,
  rowActions,
  viewToggle,
  renderExpanded,
  filters: filtersProp,
  onFiltersChange,
  onSearchChange,
  exportFilename,
  manual,
  rowCount,
  state: controlled,
  onStateChange,
  selectable,
  bulkActions,
  onRowClick,
  loading,
  error,
  onRetry,
  empty,
  mobile = "cards",
  className,
}: DataTableProps<T>) {
  const t = useLabels();
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localPagination, setLocalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [localFilters, setLocalFilters] = useState<DataTableFilters>({});
  const filters = filtersProp ?? localFilters;
  const [view, setView] = useState("table");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const search = searchProp ?? localSearch;

  const sorting = (manual && controlled?.sorting) || localSorting;
  const pagination = manual && controlled ? { pageIndex: controlled.pageIndex, pageSize: controlled.pageSize } : localPagination;

  const onSortingChange = (updater: Updater<SortingState>) => {
    const next = functionalUpdate(updater, sorting);
    setLocalSorting(next);
    setLocalPagination((p) => ({ ...p, pageIndex: 0 }));
    if (manual) onStateChange?.({ ...pagination, pageIndex: 0, sorting: next, filters, search });
  };
  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = functionalUpdate(updater, pagination);
    setLocalPagination(next);
    if (manual) onStateChange?.({ ...next, sorting, filters, search });
  };

  const applyFilters = (nextFilters: DataTableFilters, nextSearch: string) => {
    setLocalFilters(nextFilters);
    setLocalSearch(nextSearch);
    if (nextFilters !== filters) onFiltersChange?.(nextFilters);
    if (nextSearch !== search) onSearchChange?.(nextSearch);
    setLocalPagination((p) => ({ ...p, pageIndex: 0 }));
    if (manual) onStateChange?.({ ...pagination, pageIndex: 0, sorting, filters: nextFilters, search: nextSearch });
  };
  const filterColumns = columns.filter((c) => c.filter);
  const anyFilter = Object.values(filters).some(isActive);
  const filtering = anyFilter || Boolean(search);
  const clearFilters = () => applyFilters({}, "");

  const filteredData = useMemo(
    () => (manual || !anyFilter ? data : data.filter((row) => filterColumns.every((c) => matchesFilter(readValue(row, c), filters[c.id])))),
    // filterColumns comes from columns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, columns, filters, manual, anyFilter],
  );

  const defs = useMemo(
    () =>
      columns.map((c) => ({
        id: c.id,
        header: c.id,
        enableSorting: Boolean(c.sortable),
        accessorFn: (row: T) => readValue(row, c),
      })),
    [columns],
  );

  const table = useTable<typeof features, T>({
    features,
    columns: defs as never,
    data: filteredData,
    getRowId,
    enableRowSelection: Boolean(selectable),
    manualSorting: manual,
    manualPagination: manual,
    manualFiltering: manual,
    rowCount: manual ? rowCount : undefined,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    globalFilterFn: "includesString",
    state: { sorting, pagination, rowSelection, globalFilter: manual ? undefined : search },
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
  });

  // A new search restarts at page 1, and a shrinking list never strands the user on an empty page.
  useEffect(() => {
    if (!manual) setLocalPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [search, filteredData, manual]);
  const pageCount = Math.max(1, table.getPageCount());
  useEffect(() => {
    if (pagination.pageIndex >= pageCount && !loading) table.setPageIndex(pageCount - 1);
  }, [pageCount, pagination.pageIndex, loading, table]);

  const rows = table.getRowModel().rows;
  const total = manual ? (rowCount ?? data.length) : table.getFilteredRowModel().rows.length;
  const selected = table.getSelectedRowModel().rows;
  const allSelected = rows.length > 0 && rows.every((r) => r.getIsSelected());
  const someSelected = rows.some((r) => r.getIsSelected());
  const headerCheck = allSelected ? true : someSelected ? ("indeterminate" as const) : false;
  const toggleAll = (value: boolean) => rows.forEach((r) => r.toggleSelected(value));
  const value = (row: (typeof rows)[number], c: DataTableColumn<T>) => (c.cell ? c.cell(row.original) : (row.getValue(c.id) as ReactNode));
  const textOf = (c: DataTableColumn<T>) => c.label ?? (typeof c.header === "string" ? c.header : c.id);

  const sortable = columns.filter((c) => c.sortable);
  const shownColumns = columns.filter((c) => !hiddenColumns.includes(c.id));
  const cardColumns = shownColumns.filter((c) => !c.hideOnMobile);
  const actionsMenu = (row: T) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.rowActions}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{rowActions?.(row)}</DropdownMenuContent>
    </DropdownMenu>
  );
  const [titleColumn, ...restColumns] = cardColumns;
  const cardsOnly = view === "cards";
  const useCards = mobile === "cards" || cardsOnly;
  const phoneOnly = cardsOnly ? undefined : "kr:md:hidden";
  const footerColumns = shownColumns.filter((c) => c.footer);
  const footerRows = () => (manual ? data : table.getFilteredRowModel().rows.map((r) => r.original));
  const toggleExpanded = (id: string) => setExpanded((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const expandButton = (id: string) => {
    const open = expanded.includes(id);
    return (
      <Button variant="ghost" size="icon" aria-expanded={open} aria-label={open ? t.hideDetails : t.showDetails} onClick={(e) => { e.stopPropagation(); toggleExpanded(id); }}>
        {open ? <ChevronDown aria-hidden /> : <ChevronRight aria-hidden />}
      </Button>
    );
  };

  const body = () => {
    if (error) {
      return (
        <EmptyState
          title={typeof error === "string" ? error : t.loadFailed}
          description={typeof error === "string" ? undefined : error}
          action={onRetry && <Button variant="secondary" onClick={onRetry}>{t.retry}</Button>}
        />
      );
    }
    if (loading) {
      return (
        <div role="status" aria-label={t.loading} className="kr:space-y-3 kr:p-4">
          {Array.from({ length: Math.min(pagination.pageSize, 6) }, (_, i) => (
            <Skeleton key={i} className="kr:h-5 kr:w-full" />
          ))}
        </div>
      );
    }
    if (rows.length === 0 && filtering) {
      return <EmptyState title={t.noResults} action={<Button variant="secondary" onClick={clearFilters}>{t.clearFilters}</Button>} />;
    }
    if (rows.length === 0) return empty ?? <EmptyState title={t.emptyTitle} description={t.emptyDescription} />;
    return null;
  };
  const status = body();

  const exportRows = () => {
    const exportable = table.getFilteredRowModel().rows;
    download(exportFilename!, toCsv(shownColumns.map(textOf), exportable.map((row) => shownColumns.map((c) => readValue(row.original, c)))));
  };

  const toolbar = (searchable || filterColumns.length > 0 || toolbarActions || columnToggle || exportFilename || viewToggle) && (
    <FilterBar
      search={searchable ? search : undefined}
      onSearchChange={searchable ? (text) => applyFilters(filters, text) : undefined}
      searchPlaceholder={searchPlaceholder}
      onClear={anyFilter || (searchable && search) ? clearFilters : undefined}
      actions={
        (toolbarActions || columnToggle || exportFilename || viewToggle) && (
          <>
            {viewToggle && (
              <span className="kr:hidden kr:md:contents">
                <SegmentedControl
                  aria-label={t.viewAs}
                  value={view}
                  onChange={setView}
                  options={[
                    { value: "table", label: <Rows3 aria-label={t.viewTable} className="kr:size-4" /> },
                    { value: "cards", label: <LayoutGrid aria-label={t.viewCards} className="kr:size-4" /> },
                  ]}
                />
              </span>
            )}
            {exportFilename && (
              <Button variant="secondary" onClick={exportRows} disabled={Boolean(loading || error) || total === 0}>
                <Download aria-hidden />
                {t.exportCsv}
              </Button>
            )}
            {columnToggle && (
              // Phone cards already drop columns with hideOnMobile, so the menu would only cost space there.
              <span className="kr:hidden kr:md:contents">
                <FilterSelect
                  label={t.columns}
                  icon={<Columns3 aria-hidden />}
                  hideCount
                  className="kr:w-auto"
                  options={columns.map((c) => ({ value: c.id, label: textOf(c) }))}
                  value={shownColumns.map((c) => c.id)}
                  onChange={(shown) => shown.length > 0 && setHiddenColumns(columns.filter((c) => !shown.includes(c.id)).map((c) => c.id))}
                />
              </span>
            )}
            {toolbarActions}
          </>
        )
      }
    >
      {filterColumns.length > 0 &&
        filterColumns.map((c) =>
          c.filter!.type === "date" ? (
            <DateRangePicker
              key={c.id}
              aria-label={textOf(c)}
              placeholder={textOf(c)}
              className="kr:w-full"
              value={filters[c.id] as DateRange | undefined}
              onChange={(range) => applyFilters({ ...filters, [c.id]: range }, search)}
            />
          ) : (
            <FilterSelect
              key={c.id}
              label={textOf(c)}
              options={c.filter!.options ?? optionsFrom(data, c)}
              value={(filters[c.id] as string[] | undefined) ?? []}
              onChange={(values) => applyFilters({ ...filters, [c.id]: values }, search)}
            />
          ),
        )}
    </FilterBar>
  );

  return (
    <div className={cn("kr:min-w-0", className)}>
    {toolbar}
    <div className="kr:min-w-0 kr:overflow-hidden kr:rounded-lg kr:border kr:border-line kr:bg-surface kr:text-fg">
      {selectable && selected.length > 0 && bulkActions && (
        <div className="kr:flex kr:flex-wrap kr:items-center kr:gap-2 kr:border-b kr:border-line kr:bg-accent-soft kr:px-3 kr:py-2">
          <span className="kr:mr-auto kr:text-sm kr:font-medium kr:tabular-nums">
            {selected.length} {t.rowsSelected}
          </span>
          {bulkActions(selected.map((r) => r.original), () => table.resetRowSelection(true))}
        </div>
      )}

      {useCards && !status && (sortable.length > 0 || selectable) && (
        <div className={cn("kr:flex kr:items-center kr:gap-3 kr:border-b kr:border-line kr:p-3", phoneOnly)}>
          {selectable && <Checkbox aria-label={t.selectAll} checked={headerCheck} onCheckedChange={(v) => toggleAll(v === true)} />}
          {sortable.length > 0 && (
            <>
              <Select
                aria-label={t.sortBy}
                placeholder={t.sortBy}
                className="kr:flex-1"
                value={sorting[0]?.id ?? ""}
                onValueChange={(id) => onSortingChange([{ id, desc: sorting[0]?.desc ?? false }])}
                options={sortable.map((c) => ({ value: c.id, label: textOf(c) }))}
              />
              {sorting[0] && (
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label={t.sortBy}
                  onClick={() => onSortingChange([{ id: sorting[0]!.id, desc: !sorting[0]!.desc }])}
                >
                  {sorting[0].desc ? <ArrowDown aria-hidden /> : <ArrowUp aria-hidden />}
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {status && (
        <div className={useCards ? phoneOnly : "kr:hidden"}>{status}</div>
      )}

      {useCards && !status && (
        <ul className={cardsOnly ? "kr:grid kr:gap-px kr:bg-line kr:md:grid-cols-2 kr:xl:grid-cols-3" : "kr:divide-y kr:divide-line kr:md:hidden"}>
          {rows.map((row) => (
            <li
              key={row.id}
              onClick={onRowClick && ((e) => { if (!(e.target as Element).closest("a, button, input, label, select, textarea")) onRowClick(row.original); })}
              className={cn("kr:flex kr:flex-wrap kr:gap-3 kr:bg-surface kr:p-3", onRowClick && "kr:cursor-pointer kr:active:bg-surface-2")}
            >
              {selectable && (
                <span onClick={(e) => e.stopPropagation()} className="kr:pt-0.5">
                  <Checkbox aria-label={t.selectRow} checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(v === true)} />
                </span>
              )}
              <div className="kr:min-w-0 kr:flex-1">
                {titleColumn && <div className="kr:mb-1.5 kr:text-sm kr:font-medium">{value(row, titleColumn)}</div>}
                <dl className="kr:space-y-1">
                  {restColumns.map((c) => (
                    <div key={c.id} className="kr:flex kr:items-center kr:justify-between kr:gap-4 kr:text-[0.8125rem]">
                      <dt className="kr:shrink-0 kr:text-muted">{c.header}</dt>
                      <dd className="kr:min-w-0 kr:text-right kr:tabular-nums">{value(row, c)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {renderExpanded && <span className="kr:-mt-1 kr:shrink-0">{expandButton(row.id)}</span>}
              {rowActions && <span onClick={(e) => e.stopPropagation()} className="kr:-mt-1 kr:-mr-1 kr:shrink-0">{actionsMenu(row.original)}</span>}
              {renderExpanded && expanded.includes(row.id) && <div className="kr:w-full kr:border-t kr:border-line kr:pt-3 kr:text-sm">{renderExpanded(row.original)}</div>}
            </li>
          ))}
        </ul>
      )}

      {useCards && !status && footerColumns.length > 0 && (
        <dl className={cn("kr:space-y-1 kr:border-t kr:border-line kr:bg-surface-2 kr:p-3 kr:text-sm kr:font-medium", phoneOnly)}>
          {footerColumns.map((c) => (
            <div key={c.id} className="kr:flex kr:justify-between kr:gap-4">
              <dt>{textOf(c)}</dt>
              <dd className="kr:tabular-nums">{c.footer!(footerRows())}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={cn(cardsOnly ? "kr:hidden" : useCards ? "kr:hidden kr:md:block" : "kr:block", "kr:overflow-x-auto")}>
        <table className="kr:w-full kr:border-collapse kr:text-sm" aria-busy={loading || undefined}>
          <thead>
            <tr className="kr:border-b kr:border-line">
              {selectable && (
                <th scope="col" className="kr:w-10 kr:px-3 kr:py-2">
                  <Checkbox aria-label={t.selectAll} checked={headerCheck} onCheckedChange={(v) => toggleAll(v === true)} className="kr:align-middle" />
                </th>
              )}
              {renderExpanded && <th scope="col" className="kr:w-10 kr:px-1"><span className="kr:sr-only">{t.showDetails}</span></th>}
              {shownColumns.map((c) => {
                const sort = sorting.find((s) => s.id === c.id);
                const Icon = !sort ? ChevronsUpDown : sort.desc ? ArrowDown : ArrowUp;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={sort ? (sort.desc ? "descending" : "ascending") : c.sortable ? "none" : undefined}
                    className={cn("kr:px-3 kr:py-2 kr:text-[0.8125rem] kr:font-medium kr:whitespace-nowrap kr:text-muted", c.align === "right" ? "kr:text-right" : "kr:text-left")}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => table.getColumn(c.id)?.toggleSorting()}
                        className={cn(
                          "kr:inline-flex kr:cursor-pointer kr:items-center kr:gap-1 kr:rounded-sm kr:hover:text-fg kr:outline-none kr:focus-visible:ring-2 kr:focus-visible:ring-accent",
                          c.align === "right" && "kr:flex-row-reverse",
                          sort && "kr:text-fg",
                        )}
                      >
                        {c.header}
                        <Icon aria-hidden className="kr:size-3.5" />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowActions && <th scope="col" className="kr:w-10 kr:px-1"><span className="kr:sr-only">{t.rowActions}</span></th>}
            </tr>
          </thead>
          {!status && (
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                <tr
                  onClick={onRowClick && ((e) => { if (!(e.target as Element).closest("a, button, input, label, select, textarea")) onRowClick(row.original); })}
                  data-selected={row.getIsSelected() || undefined}
                  className={cn(
                    "kr:border-b kr:border-line kr:last:border-b-0 kr:hover:bg-surface-2 kr:data-[selected]:bg-accent-soft",
                    onRowClick && "kr:cursor-pointer",
                  )}
                >
                  {selectable && (
                    <td className="kr:px-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={t.selectRow} checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(v === true)} className="kr:align-middle" />
                    </td>
                  )}
                  {renderExpanded && <td className="kr:px-1">{expandButton(row.id)}</td>}
                  {shownColumns.map((c) => (
                    <td
                      key={c.id}
                      className={cn("kr:px-3 kr:py-[var(--kora-cell-y)]", c.align === "right" && "kr:text-right kr:tabular-nums")}
                    >
                      {value(row, c)}
                    </td>
                  ))}
                  {rowActions && <td className="kr:px-1 kr:text-right" onClick={(e) => e.stopPropagation()}>{actionsMenu(row.original)}</td>}
                </tr>
                {renderExpanded && expanded.includes(row.id) && (
                  <tr className="kr:border-b kr:border-line kr:last:border-b-0">
                    <td colSpan={shownColumns.length + (selectable ? 1 : 0) + 1 + (rowActions ? 1 : 0)} className="kr:bg-surface-2/50 kr:px-3 kr:py-3 kr:text-sm">{renderExpanded(row.original)}</td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          )}
          {!status && footerColumns.length > 0 && (
            <tfoot>
              <tr className="kr:border-t kr:border-line kr:bg-surface-2 kr:font-medium">
                {selectable && <td />}
                {renderExpanded && <td />}
                {shownColumns.map((c) => (
                  <td key={c.id} className={cn("kr:px-3 kr:py-2", c.align === "right" && "kr:text-right kr:tabular-nums")}>{c.footer?.(footerRows())}</td>
                ))}
                {rowActions && <td />}
              </tr>
            </tfoot>
          )}
        </table>
        {status && <div className={useCards ? "kr:hidden kr:md:block" : undefined}>{status}</div>}
      </div>

      {!error && !loading && total > 0 && (
        <div className="kr:flex kr:flex-wrap kr:items-center kr:justify-between kr:gap-2 kr:border-t kr:border-line kr:px-3 kr:py-2">
          <p className="kr:text-[0.8125rem] kr:text-muted kr:tabular-nums">
            {pagination.pageIndex * pagination.pageSize + 1}–{Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} {t.of} {total}
          </p>
          {pageCount > 1 && <Pagination page={pagination.pageIndex + 1} pageCount={pageCount} onPageChange={(p) => table.setPageIndex(p - 1)} />}
        </div>
      )}
    </div>
    </div>
  );
}
