import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { ToggleGroup } from "radix-ui";
import { Download, File as FileIcon, MoreHorizontal, X } from "lucide-react";
import { Button, focusRing } from "./button";
import { Alert, Badge, Card, CardContent, CardHeader, FileName, Skeleton, type Tone } from "./display";
import { Delta } from "./metrics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./overlay";
import { cn, KoraLink, useKora, useLabels } from "./provider";

/** The same three states that DataTable and the charts accept. */
export type WidgetStateProps = { loading?: boolean; error?: ReactNode; empty?: ReactNode };

function useWidgetState({ loading, error, empty }: WidgetStateProps, isEmpty: boolean) {
  const t = useLabels();
  if (error) return <p role="alert" className="kr:py-6 kr:text-center kr:text-sm kr:text-danger">{error === true ? t.loadFailed : error}</p>;
  if (loading) {
    return (
      <div role="status" aria-label={t.loading} className="kr:space-y-3">
        <Skeleton className="kr:h-5 kr:w-full" />
        <Skeleton className="kr:h-5 kr:w-4/5" />
        <Skeleton className="kr:h-5 kr:w-3/5" />
      </div>
    );
  }
  if (isEmpty) return <div className="kr:py-6 kr:text-center kr:text-sm kr:text-muted">{empty ?? t.noResults}</div>;
  return null;
}

const barColor = (i: number) => `var(--kora-chart-${(i % 6) + 1})`;
/** Numbers follow the KoraProvider locale, not the browser, so a page never mixes languages. */
function useFormat(format?: (value: number) => string) {
  const { locale } = useKora();
  return format ?? ((value: number) => value.toLocaleString(locale));
}

/** Pick one option, such as a time range. Scrolls sideways when space runs short. */
export function SegmentedControl({ options, value, onChange, className, "aria-label": ariaLabel }: {
  options: Array<{ value: string; label: ReactNode }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-label": string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={ariaLabel}
      value={value}
      // Radix sends an empty value when the active option is pressed again. One option stays selected.
      onValueChange={(next) => next && onChange(next)}
      className={cn("kr:inline-flex kr:max-w-full kr:gap-0.5 kr:overflow-x-auto kr:rounded-md kr:border kr:border-line kr:bg-surface-2 kr:p-0.5", className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            "kr:h-9 kr:shrink-0 kr:cursor-pointer kr:rounded-sm kr:px-3 kr:text-sm kr:whitespace-nowrap kr:text-muted kr:outline-none kr:transition-colors kr:hover:text-fg kr:md:h-7 kr:md:px-2.5 kr:md:text-[0.8125rem]",
            "kr:focus-visible:ring-2 kr:focus-visible:ring-accent kr:data-[state=on]:bg-surface kr:data-[state=on]:font-medium kr:data-[state=on]:text-fg kr:data-[state=on]:shadow-sm",
          )}
        >
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

/** A chart with its headline number. Put any chart or widget in `children`. */
export function ChartCard({ title, description, value, delta, deltaLabel, invertDelta, actions, children, className }: {
  title: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  delta?: number;
  deltaLabel?: ReactNode;
  invertDelta?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("kr:min-w-0", className)}>
      <CardHeader title={title} description={description} actions={actions} />
      <CardContent>
        {value !== undefined && (
          <div className="kr:mb-3 kr:flex kr:flex-wrap kr:items-baseline kr:gap-x-2">
            <p className="kr:text-2xl kr:font-semibold kr:text-fg kr:tabular-nums">{value}</p>
            {delta !== undefined && <Delta value={delta} invert={invertDelta} label={typeof deltaLabel === "string" ? deltaLabel : undefined} />}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export type RankedItem = { label: ReactNode; value: number; href?: string };

/** Top items, longest bar first. Bars scale to the largest value. */
export function RankedList({ items, format: formatProp, className, ...state }: WidgetStateProps & {
  items: RankedItem[];
  format?: (value: number) => string;
  className?: string;
}) {
  const status = useWidgetState(state, items.length === 0);
  const format = useFormat(formatProp);
  if (status) return <div className={className}>{status}</div>;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((i) => i.value), 1);
  return (
    <ol className={cn("kr:grid kr:gap-3", className)}>
      {sorted.map((item, i) => (
        <li key={i} className="kr:text-sm">
          <div className="kr:mb-1 kr:flex kr:items-baseline kr:justify-between kr:gap-3">
            <span className="kr:min-w-0 kr:truncate kr:text-fg">{item.href ? <a href={item.href} className="kr:hover:underline">{item.label}</a> : item.label}</span>
            <span className="kr:shrink-0 kr:text-muted kr:tabular-nums">{format(item.value)}</span>
          </div>
          <div aria-hidden className="kr:h-1.5 kr:rounded-full kr:bg-surface-2">
            <div className="kr:h-full kr:rounded-full kr:bg-[var(--kora-chart-1)]" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export type SegmentItem = { label: string; value: number };

export function segmentShares(items: SegmentItem[]) {
  const total = items.reduce((sum, i) => sum + Math.max(i.value, 0), 0);
  return items.map((i) => (total > 0 ? (Math.max(i.value, 0) / total) * 100 : 0));
}

/** Parts of a whole on one line, with a legend that names each part. */
export function SegmentBar({ items, format, className, ...state }: WidgetStateProps & {
  items: SegmentItem[];
  format?: (value: number) => string;
  className?: string;
}) {
  const status = useWidgetState(state, items.length === 0);
  if (status) return <div className={className}>{status}</div>;
  const shares = segmentShares(items);
  return (
    <div className={className}>
      <div aria-hidden className="kr:flex kr:h-3 kr:gap-0.5 kr:overflow-hidden kr:rounded-full">
        {items.map((item, i) => (
          <div key={item.label} className="kr:min-w-0" style={{ width: `${shares[i]}%`, background: barColor(i) }} />
        ))}
      </div>
      <ul className="kr:mt-3 kr:grid kr:gap-1.5 kr:text-sm">
        {items.map((item, i) => (
          <li key={item.label} className="kr:flex kr:items-center kr:gap-2">
            <span aria-hidden className="kr:size-2.5 kr:shrink-0 kr:rounded-sm" style={{ background: barColor(i) }} />
            <span className="kr:min-w-0 kr:flex-1 kr:truncate kr:text-fg">{item.label}</span>
            {format && <span className="kr:text-muted kr:tabular-nums">{format(item.value)}</span>}
            <span className="kr:w-10 kr:text-right kr:font-medium kr:text-fg kr:tabular-nums">{Math.round(shares[i]!)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type FunnelStep = { label: string; value: number };

/** Share kept from the step before. The first step has none. */
export function funnelRates(steps: FunnelStep[]) {
  return steps.map((step, i) => {
    const previous = steps[i - 1]?.value;
    return previous ? (step.value / previous) * 100 : undefined;
  });
}

/** Steps where people drop off, with the share kept at each one. */
export function Funnel({ steps, format: formatProp, className, ...state }: WidgetStateProps & {
  steps: FunnelStep[];
  format?: (value: number) => string;
  className?: string;
}) {
  const status = useWidgetState(state, steps.length === 0);
  const format = useFormat(formatProp);
  if (status) return <div className={className}>{status}</div>;
  const first = Math.max(steps[0]?.value ?? 0, 1);
  const rates = funnelRates(steps);
  return (
    <ol className={cn("kr:grid kr:gap-3", className)}>
      {steps.map((step, i) => (
        <li key={step.label} className="kr:text-sm">
          <div className="kr:mb-1 kr:flex kr:items-baseline kr:justify-between kr:gap-3">
            <span className="kr:min-w-0 kr:truncate kr:text-fg">{step.label}</span>
            <span className="kr:shrink-0 kr:text-muted kr:tabular-nums">
              {format(step.value)}
              {rates[i] !== undefined && <span className="kr:ml-2 kr:font-medium kr:text-fg">{rates[i]!.toFixed(1)}%</span>}
            </span>
          </div>
          <div aria-hidden className="kr:h-6 kr:rounded-sm kr:bg-surface-2">
            <div className="kr:h-full kr:rounded-sm kr:bg-[var(--kora-chart-1)]" style={{ width: `${Math.min((step.value / first) * 100, 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

const gaugeStroke: Partial<Record<Tone, string>> = {
  success: "var(--kora-success)",
  warning: "var(--kora-warning)",
  danger: "var(--kora-danger)",
};

export const gaugeShare = (value: number, max: number) => (max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0);

/** One value against a limit, as a half ring. `tone` is yours to set, because only you know the thresholds. */
export function Gauge({ value, max = 100, label, valueLabel, tone, className }: {
  value: number;
  max?: number;
  label: string;
  /** Text in the middle. Defaults to the percentage. */
  valueLabel?: string;
  tone?: Tone;
  className?: string;
}) {
  const share = gaugeShare(value, max);
  const text = valueLabel ?? `${Math.round(share * 100)}%`;
  const radius = 42;
  const length = Math.PI * radius;
  const arc = `M 8 50 A ${radius} ${radius} 0 0 1 92 50`;
  return (
    <div role="img" aria-label={`${label}: ${text}`} className={cn("kr:mx-auto kr:w-full kr:max-w-44 kr:text-center", className)}>
      <div className="kr:relative">
        <svg viewBox="0 0 100 54" aria-hidden className="kr:block kr:w-full">
          <path d={arc} fill="none" stroke="var(--kora-surface-2)" strokeWidth="8" strokeLinecap="round" />
          <path d={arc} fill="none" stroke={(tone && gaugeStroke[tone]) ?? "var(--kora-chart-1)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${share * length} ${length}`} />
        </svg>
        <p className="kr:absolute kr:inset-x-0 kr:bottom-0 kr:text-xl kr:font-semibold kr:text-fg kr:tabular-nums">{text}</p>
      </div>
      <div className="kr:mt-1 kr:text-[0.8125rem] kr:text-muted">{label}</div>
    </div>
  );
}

/** Position of a value between the smallest and largest in the grid, from 0 to 1. */
export function heatShare(value: number, min: number, max: number) {
  return max > min ? (value - min) / (max - min) : 1;
}

/**
 * Values by row and column, such as cohorts or busy hours. Darker means more.
 * It is a real table, so screen readers get every value. Scrolls sideways on phones.
 */
export function Heatmap({ rows, columns, values, caption, format: formatProp, showValues = true, className, ...state }: WidgetStateProps & {
  rows: string[];
  columns: string[];
  /** One array per row. Use null for cells with no data. */
  values: Array<Array<number | null>>;
  caption: string;
  format?: (value: number) => string;
  /** Set to false for many narrow columns. The value stays in the tooltip and for screen readers. */
  showValues?: boolean;
  className?: string;
}) {
  const status = useWidgetState(state, rows.length === 0);
  const format = useFormat(formatProp);
  if (status) return <div className={className}>{status}</div>;
  const known = values.flat().filter((v): v is number => v !== null);
  const min = Math.min(...known);
  const max = Math.max(...known);
  return (
    <div tabIndex={0} role="region" aria-label={caption} className={cn("kr:relative kr:overflow-x-auto kr:rounded-sm kr:outline-none kr:focus-visible:ring-2 kr:focus-visible:ring-accent", className)}>
      <table className="kr:w-full kr:border-separate kr:border-spacing-0.5 kr:text-xs">
        <caption className="kr:sr-only">{caption}</caption>
        <thead>
          <tr>
            <td />
            {columns.map((c) => (
              <th key={c} scope="col" className="kr:px-1 kr:pb-1 kr:font-normal kr:whitespace-nowrap kr:text-muted">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row}>
              <th scope="row" className="kr:pr-2 kr:text-left kr:font-normal kr:whitespace-nowrap kr:text-muted">{row}</th>
              {columns.map((c, col) => {
                const value = values[r]?.[col] ?? null;
                if (value === null) return <td key={c} className="kr:h-7 kr:min-w-7 kr:rounded-sm kr:bg-surface-2/50"><span className="kr:sr-only">-</span></td>;
                const share = heatShare(value, min, max);
                return (
                  <td
                    key={c}
                    title={`${row}, ${c}: ${format(value)}`}
                    className="kr:h-7 kr:min-w-7 kr:rounded-sm kr:px-1 kr:text-center kr:text-fg kr:tabular-nums"
                    // Starts above the surface color, so the smallest value is still visible.
                    // With text in the cell the range stops at 50%, so the text keeps its contrast in both themes.
                    style={{ background: `color-mix(in oklab, var(--kora-accent) ${Math.round(8 + share * (showValues ? 42 : 92))}%, var(--kora-surface))` }}
                  >
                    <span className={showValues ? undefined : "kr:sr-only"}>{format(value)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type StageCount = { id: string; label: ReactNode; count: number; href: string; alert?: boolean; active?: boolean };

/** How many records sit at each stage of a process. Each stage links to its list. */
export function StageCounters({ stages, className }: { stages: StageCount[]; className?: string }) {
  return (
    <ol className={cn("kr:grid kr:grid-cols-2 kr:gap-px kr:overflow-hidden kr:rounded-lg kr:border kr:border-line kr:bg-line kr:md:flex", className)}>
      {stages.map((stage) => (
        <li key={stage.id} className="kr:min-w-0 kr:flex-1">
          <KoraLink
            href={stage.href}
            aria-current={stage.active ? "page" : undefined}
            className={cn("kr:block kr:h-full kr:p-3 kr:transition-colors", stage.active ? "kr:bg-accent-soft" : "kr:bg-surface kr:hover:bg-surface-2", focusRing, "kr:focus-visible:-outline-offset-2")}
          >
            <span className="kr:block kr:truncate kr:text-[0.8125rem] kr:text-muted">{stage.label}</span>
            <span className="kr:mt-1 kr:flex kr:items-center kr:gap-2">
              <span className="kr:text-xl kr:font-semibold kr:text-fg kr:tabular-nums">{stage.count}</span>
              {stage.alert && <Badge tone="warning">!</Badge>}
            </span>
          </KoraLink>
        </li>
      ))}
    </ol>
  );
}

/** A link (`href`) or, without one, a button that calls `onSelect` (to open a dialog, for example). */
export type QuickAction = { id: string; label: ReactNode; description?: ReactNode; icon?: ReactNode; href?: string; onSelect?: () => void };

/** Shortcuts to the most common tasks. */
export function QuickActions({ actions, className }: { actions: QuickAction[]; className?: string }) {
  const tile = cn("kr:flex kr:h-full kr:min-h-11 kr:w-full kr:cursor-pointer kr:items-start kr:gap-2.5 kr:rounded-lg kr:border kr:border-line kr:bg-surface kr:p-3 kr:text-left kr:text-sm kr:transition-colors kr:hover:border-line-strong kr:[&_svg]:mt-0.5 kr:[&_svg]:size-4 kr:[&_svg]:shrink-0 kr:[&_svg]:text-accent", focusRing);
  return (
    <ul className={cn("kr:grid kr:gap-2 kr:[grid-template-columns:repeat(auto-fit,minmax(min(11rem,100%),1fr))]", className)}>
      {actions.map((action) => {
        const body = (
          <>
            {action.icon}
            <span className="kr:min-w-0">
              <span className="kr:block kr:font-medium kr:text-fg">{action.label}</span>
              {action.description && <span className="kr:block kr:text-[0.8125rem] kr:text-muted">{action.description}</span>}
            </span>
          </>
        );
        return (
          <li key={action.id}>
            {action.href !== undefined ? (
              <KoraLink href={action.href} className={tile}>{body}</KoraLink>
            ) : (
              <button type="button" onClick={action.onSelect} className={tile}>{body}</button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export type DocumentItem = { id: string; name: string; meta?: ReactNode; href?: string };

/** Files attached to a record. `onRemove` adds a button, so leave it off for people who cannot remove files. */
export function DocumentList({ documents, onRemove, className, ...state }: WidgetStateProps & {
  documents: DocumentItem[];
  onRemove?: (document: DocumentItem) => void;
  className?: string;
}) {
  const t = useLabels();
  const status = useWidgetState({ ...state, empty: state.empty ?? t.noDocuments }, documents.length === 0);
  if (status) return <div className={className}>{status}</div>;
  return (
    <ul className={cn("kr:divide-y kr:divide-line kr:text-sm", className)}>
      {documents.map((doc) => (
        <li key={doc.id} className="kr:flex kr:items-center kr:gap-2.5 kr:py-1.5">
          <FileIcon aria-hidden className="kr:size-4 kr:shrink-0 kr:text-muted" />
          <span className="kr:min-w-0 kr:flex-1">
            <FileName name={doc.name} className="kr:text-fg" />
            {doc.meta && <span className="kr:block kr:text-xs kr:text-muted">{doc.meta}</span>}
          </span>
          {doc.href && (
            <Button asChild variant="ghost" size="icon">
              <a href={doc.href} download aria-label={`${t.download} ${doc.name}`}><Download aria-hidden /></a>
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="icon" aria-label={`${t.remove} ${doc.name}`} onClick={() => onRemove(doc)}><X aria-hidden /></Button>
          )}
        </li>
      ))}
    </ul>
  );
}

export type AlertItem = { id: string; title: ReactNode; description?: ReactNode; tone?: "info" | "warning" | "danger" | "success"; action?: { label: string; href: string } };

/** What needs attention today. */
export function AlertList({ alerts, className, ...state }: WidgetStateProps & { alerts: AlertItem[]; className?: string }) {
  const status = useWidgetState(state, alerts.length === 0);
  if (status) return <div className={className}>{status}</div>;
  return (
    <ul className={cn("kr:grid kr:gap-2", className)}>
      {alerts.map((alert) => (
        <li key={alert.id}>
          <Alert tone={alert.tone ?? "warning"} title={alert.title}>
            {alert.description}
            {alert.action && (
              <KoraLink href={alert.action.href} className={cn("kr:mt-1 kr:block kr:font-medium kr:underline", focusRing)}>{alert.action.label}</KoraLink>
            )}
          </Alert>
        </li>
      ))}
    </ul>
  );
}

export type KanbanCard = { id: string; title: ReactNode; description?: ReactNode };
/** `count` is the total when only some cards are loaded. It defaults to the cards shown. */
export type KanbanColumn = { id: string; title: ReactNode; count?: number; cards?: KanbanCard[] };

/** A board with one column per stage. It scrolls sideways when the columns do not fit. */
export function Kanban({ columns, onCardClick, onCardMove, loading, className, "aria-label": ariaLabel }: {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard, column: KanbanColumn) => void;
  /** Lets people drag cards between columns, or use the menu of each card. You update `columns`. */
  onCardMove?: (card: KanbanCard, from: KanbanColumn, to: KanbanColumn) => void;
  loading?: boolean;
  className?: string;
  "aria-label": string;
}) {
  const t = useLabels();
  const board = useRef<HTMLDivElement>(null);
  const dragged = useRef<{ card: KanbanCard; from: KanbanColumn } | null>(null);
  const focusAfterMove = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [status, setStatus] = useState<ReactNode>(null);

  // A moved card is a new element in another column, so the focus has to follow it.
  useEffect(() => {
    if (!focusAfterMove.current) return;
    const button = board.current?.querySelector<HTMLElement>(`[data-kanban-card="${CSS.escape(focusAfterMove.current)}"] button`);
    if (button) {
      button.focus();
      focusAfterMove.current = null;
    }
  }, [columns]);

  const move = (card: KanbanCard, from: KanbanColumn, to: KanbanColumn) => {
    if (from.id === to.id) return;
    onCardMove?.(card, from, to);
    setStatus(<>{t.movedTo}: {to.title}</>);
  };
  const endDrag = () => {
    dragged.current = null;
    setDraggingId(null);
    setOverId(null);
  };

  return (
    <div ref={board} role="group" aria-label={ariaLabel} tabIndex={0} className={cn("kr:grid kr:auto-cols-[minmax(13rem,1fr)] kr:grid-flow-col kr:gap-3 kr:overflow-x-auto", className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn("kr:flex kr:min-h-24 kr:min-w-0 kr:flex-col kr:gap-2 kr:rounded-lg kr:bg-surface-2 kr:p-2", overId === column.id && "kr:outline-2 kr:-outline-offset-2 kr:outline-accent")}
          {...(onCardMove && {
            onDragOver: (event: DragEvent) => {
              if (!dragged.current) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setOverId(column.id);
            },
            onDragLeave: (event: DragEvent) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverId(null);
            },
            onDrop: (event: DragEvent) => {
              event.preventDefault();
              if (dragged.current) move(dragged.current.card, dragged.current.from, column);
              endDrag();
            },
          })}
        >
          <div className="kr:flex kr:items-center kr:justify-between kr:gap-2 kr:px-1 kr:text-sm kr:font-medium kr:text-fg">
            <span className="kr:min-w-0">{column.title}</span>
            {(column.count ?? column.cards) !== undefined && <Badge>{column.count ?? column.cards?.length}</Badge>}
          </div>
          {loading && [0, 1].map((i) => <Skeleton key={i} className="kr:h-16 kr:w-full kr:bg-line!" />)}
          {column.cards?.map((card) => {
            const body = (
              <>
                <span className="kr:block kr:text-sm kr:font-medium kr:text-fg">{card.title}</span>
                {card.description && <span className="kr:mt-0.5 kr:block kr:text-[0.8125rem] kr:text-muted">{card.description}</span>}
              </>
            );
            const box = cn("kr:block kr:w-full kr:rounded-md kr:border kr:border-line kr:bg-surface kr:p-3 kr:text-left", onCardMove && "kr:pr-12 kr:lg:pr-10");
            return (
              <div
                key={card.id}
                data-kanban-card={card.id}
                className={cn("kr:relative", onCardMove && "kr:cursor-grab", draggingId === card.id && "kr:opacity-50")}
                {...(onCardMove && {
                  draggable: true,
                  onDragStart: (event: DragEvent) => {
                    dragged.current = { card, from: column };
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", typeof card.title === "string" ? card.title : card.id);
                    setDraggingId(card.id);
                  },
                  onDragEnd: endDrag,
                })}
              >
                {onCardClick ? (
                  <button type="button" className={cn(box, "kr:cursor-pointer kr:hover:border-line-strong", focusRing)} onClick={() => onCardClick(card, column)}>{body}</button>
                ) : (
                  <div className={box}>{body}</div>
                )}
                {onCardMove && (
                  <DropdownMenu>
                    <DropdownMenuTrigger aria-label={typeof card.title === "string" ? `${t.moveCard}: ${card.title}` : t.moveCard} className={cn("kr:absolute kr:top-0 kr:right-0 kr:flex kr:size-11 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-md kr:text-muted kr:hover:text-fg kr:lg:size-9", focusRing)}>
                      <MoreHorizontal aria-hidden className="kr:size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t.moveTo}</DropdownMenuLabel>
                      {columns.filter((other) => other.id !== column.id).map((other) => (
                        <DropdownMenuItem key={other.id} onSelect={() => { focusAfterMove.current = card.id; move(card, column, other); }}>{other.title}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <span role="status" className="kr:sr-only">{status}</span>
    </div>
  );
}

