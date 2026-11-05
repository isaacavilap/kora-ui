import { useEffect, useMemo, useState } from "react";
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
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "../components/button";
import { EmptyState, Skeleton } from "../components/display";
import { Checkbox, Select } from "../components/form";
import { Pagination } from "../components/navigation";
import { cn, useLabels } from "../components/provider";

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
  align?: "left" | "right";
  /** Leaves the column out of the phone layout. */
  hideOnMobile?: boolean;
};

export type DataTableState = { pageIndex: number; pageSize: number; sorting: Array<{ id: string; desc: boolean }> };

export type DataTableProps<T extends Record<string, any>> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T, index: number) => string;
  /** Client mode: rows per page, and text to match against all columns. */
  pageSize?: number;
  search?: string;
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

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  getRowId,
  pageSize = 10,
  search,
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

  const sorting = (manual && controlled?.sorting) || localSorting;
  const pagination = manual && controlled ? { pageIndex: controlled.pageIndex, pageSize: controlled.pageSize } : localPagination;

  const onSortingChange = (updater: Updater<SortingState>) => {
    const next = functionalUpdate(updater, sorting);
    setLocalSorting(next);
    setLocalPagination((p) => ({ ...p, pageIndex: 0 }));
    if (manual) onStateChange?.({ ...pagination, pageIndex: 0, sorting: next });
  };
  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = functionalUpdate(updater, pagination);
    setLocalPagination(next);
    if (manual) onStateChange?.({ ...next, sorting });
  };

  const defs = useMemo(
    () =>
      columns.map((c) => ({
        id: c.id,
        header: c.id,
        enableSorting: Boolean(c.sortable),
        accessorFn: (row: T) => {
          const value = typeof c.accessor === "function" ? c.accessor(row) : c.accessor ? row[c.accessor] : undefined;
          return value === null ? undefined : value;
        },
      })),
    [columns],
  );

  const table = useTable<typeof features, T>({
    features,
    columns: defs as never,
    data,
    getRowId,
    enableRowSelection: Boolean(selectable),
    manualSorting: manual,
    manualPagination: manual,
    manualFiltering: manual,
    rowCount: manual ? rowCount : undefined,
    autoResetPageIndex: false,
    globalFilterFn: "includesString",
    state: { sorting, pagination, rowSelection, globalFilter: manual ? undefined : search },
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
  });

  // A new search restarts at page 1, and a shrinking list never strands the user on an empty page.
  useEffect(() => {
    if (!manual) setLocalPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [search, manual]);
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
  const cardColumns = columns.filter((c) => !c.hideOnMobile);
  const [titleColumn, ...restColumns] = cardColumns;
  const useCards = mobile === "cards";

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
    if (rows.length === 0) return empty ?? <EmptyState title={t.emptyTitle} description={t.emptyDescription} />;
    return null;
  };
  const status = body();

  return (
    <div className={cn("kr:min-w-0 kr:overflow-hidden kr:rounded-lg kr:border kr:border-line kr:bg-surface kr:text-fg", className)}>
      {selectable && selected.length > 0 && bulkActions && (
        <div className="kr:flex kr:flex-wrap kr:items-center kr:gap-2 kr:border-b kr:border-line kr:bg-accent-soft kr:px-3 kr:py-2">
          <span className="kr:mr-auto kr:text-sm kr:font-medium kr:tabular-nums">
            {selected.length} {t.rowsSelected}
          </span>
          {bulkActions(selected.map((r) => r.original), () => table.resetRowSelection(true))}
        </div>
      )}

      {useCards && !status && (sortable.length > 0 || selectable) && (
        <div className="kr:flex kr:items-center kr:gap-3 kr:border-b kr:border-line kr:p-3 kr:md:hidden">
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
        <div className={useCards ? "kr:md:hidden" : "kr:hidden"}>{status}</div>
      )}

      {useCards && !status && (
        <ul className="kr:divide-y kr:divide-line kr:md:hidden">
          {rows.map((row) => (
            <li
              key={row.id}
              onClick={onRowClick && (() => onRowClick(row.original))}
              className={cn("kr:flex kr:gap-3 kr:p-3", onRowClick && "kr:cursor-pointer kr:active:bg-surface-2")}
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
            </li>
          ))}
        </ul>
      )}

      <div className={cn(useCards ? "kr:hidden kr:md:block" : "kr:block", "kr:overflow-x-auto")}>
        <table className="kr:w-full kr:border-collapse kr:text-sm" aria-busy={loading || undefined}>
          <thead>
            <tr className="kr:border-b kr:border-line">
              {selectable && (
                <th scope="col" className="kr:w-10 kr:px-3 kr:py-2">
                  <Checkbox aria-label={t.selectAll} checked={headerCheck} onCheckedChange={(v) => toggleAll(v === true)} className="kr:align-middle" />
                </th>
              )}
              {columns.map((c) => {
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
            </tr>
          </thead>
          {!status && (
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick && (() => onRowClick(row.original))}
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
                  {columns.map((c) => (
                    <td
                      key={c.id}
                      className={cn("kr:px-3 kr:py-[var(--kora-cell-y)]", c.align === "right" && "kr:text-right kr:tabular-nums")}
                    >
                      {value(row, c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
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
  );
}
