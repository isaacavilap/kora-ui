import type { ReactNode } from "react";
import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../components/button";
import { EmptyState, Skeleton } from "../components/display";
import { cn, useKora, useLabels } from "../components/provider";

const SLOTS = 6;

/** Slots follow fixed order. Past the sixth, fold extra series into "Other" instead of adding hues. */
function slotColor(index: number) {
  return index < SLOTS ? `var(--kora-chart-${index + 1})` : "var(--kora-line-strong)";
}

export type ChartSeries = { key: string; label: string; color?: string };
type Row = Record<string, unknown>;
type Format = (value: number) => string;

type ChartStateProps = {
  /** Describes the chart for screen readers. A data table is also exposed to them. */
  summary: string;
  height?: number;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  empty?: ReactNode;
  className?: string;
};

export type CartesianChartProps = ChartStateProps & {
  data: Row[];
  /** Key of the row that holds the horizontal axis value. */
  x: string;
  series: ChartSeries[];
  xFormat?: (value: string) => string;
  valueFormat?: Format;
};

function Frame({ summary, height = 260, loading, error, onRetry, empty, isEmpty, className, legend, table, children }: ChartStateProps & {
  isEmpty: boolean;
  legend?: ReactNode;
  table: ReactNode;
  children: ReactNode;
}) {
  const t = useLabels();
  const state = error ? (
    <EmptyState
      title={typeof error === "string" ? error : t.loadFailed}
      action={onRetry && <Button variant="secondary" onClick={onRetry}>{t.retry}</Button>}
    />
  ) : loading ? (
    <Skeleton role="status" aria-hidden={false} aria-label={t.loading} className="kr:size-full" />
  ) : isEmpty ? (
    (empty ?? <EmptyState title={t.emptyTitle} description={t.emptyDescription} />)
  ) : null;
  return (
    <figure aria-label={summary} className={cn("kr:min-w-0", className)}>
      {!state && legend}
      <div style={{ height }} className="kr:min-w-0 kr:text-xs">
        {state ?? children}
      </div>
      {!state && <div className="kr:sr-only">{table}</div>}
    </figure>
  );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  if (items.length < 2) return null;
  return (
    <ul className="kr:mb-2 kr:flex kr:flex-wrap kr:gap-x-3 kr:gap-y-1 kr:text-[0.8125rem] kr:text-muted">
      {items.map((item) => (
        <li key={item.label} className="kr:inline-flex kr:items-center kr:gap-1.5">
          <span aria-hidden className="kr:size-2.5 kr:rounded-[3px]" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function DataTableFallback({ summary, data, x, series }: { summary: string; data: Row[]; x: string; series: ChartSeries[] }) {
  return (
    <table>
      <caption>{summary}</caption>
      <thead>
        <tr>
          <th scope="col">{x}</th>
          {series.map((s) => (
            <th key={s.key} scope="col">{s.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <th scope="row">{String(row[x])}</th>
            {series.map((s) => (
              <td key={s.key}>{String(row[s.key] ?? "")}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type TooltipEntry = { name?: unknown; value?: unknown; color?: string; payload?: { fill?: string } };

function ChartTooltip({ active, payload, label, xFormat, format }: {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: unknown;
  xFormat?: (value: string) => string;
  format: Format;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="kr:rounded-md kr:border kr:border-line kr:bg-surface kr:px-2.5 kr:py-2 kr:text-xs kr:text-fg kr:shadow-overlay">
      {label != null && <p className="kr:mb-1 kr:font-medium">{xFormat ? xFormat(String(label)) : String(label)}</p>}
      <ul className="kr:space-y-0.5">
        {payload.map((entry) => (
          <li key={String(entry.name)} className="kr:flex kr:items-center kr:gap-1.5">
            <span aria-hidden className="kr:size-2 kr:rounded-[2px]" style={{ background: entry.color ?? entry.payload?.fill }} />
            <span className="kr:text-muted">{String(entry.name)}</span>
            <span className="kr:ml-auto kr:pl-3 kr:font-medium kr:tabular-nums">{format(Number(entry.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useFormats(valueFormat?: Format) {
  const { locale } = useKora();
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const standard = new Intl.NumberFormat(locale);
  return { axis: valueFormat ?? ((v: number) => compact.format(v)), value: valueFormat ?? ((v: number) => standard.format(v)) };
}

const axisTick = { fill: "var(--kora-muted)", fontSize: 12 };

function axes(x: string, xFormat: CartesianChartProps["xFormat"], axisFormat: Format) {
  return [
    <CartesianGrid key="grid" vertical={false} stroke="var(--kora-line)" />,
    <XAxis
      key="x"
      dataKey={x}
      tick={axisTick}
      tickFormatter={xFormat}
      axisLine={{ stroke: "var(--kora-line)" }}
      tickLine={false}
      minTickGap={24}
      interval="preserveStartEnd"
      tickMargin={6}
    />,
    <YAxis key="y" tick={axisTick} tickFormatter={axisFormat} axisLine={false} tickLine={false} width="auto" />,
  ];
}

function resolved(series: ChartSeries[]) {
  return series.map((s, i) => ({ ...s, color: s.color ?? slotColor(i) }));
}

const margin = { top: 6, right: 8, bottom: 0, left: 0 };

export function LineChart({ data, x, series, xFormat, valueFormat, ...state }: CartesianChartProps) {
  const f = useFormats(valueFormat);
  const items = resolved(series);
  return (
    <Frame {...state} isEmpty={data.length === 0} legend={<Legend items={items} />} table={<DataTableFallback summary={state.summary} data={data} x={x} series={series} />}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={margin}>
          {axes(x, xFormat, f.axis)}
          <Tooltip cursor={{ stroke: "var(--kora-line-strong)" }} content={(p) => <ChartTooltip {...(p as object)} xFormat={xFormat} format={f.value} />} />
          {items.map((s) => (
            <Line key={s.key} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--kora-surface)" }} isAnimationActive={false} />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </Frame>
  );
}

export function AreaChart({ data, x, series, xFormat, valueFormat, stacked, ...state }: CartesianChartProps & { stacked?: boolean }) {
  const f = useFormats(valueFormat);
  const items = resolved(series);
  return (
    <Frame {...state} isEmpty={data.length === 0} legend={<Legend items={items} />} table={<DataTableFallback summary={state.summary} data={data} x={x} series={series} />}>
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={margin}>
          {axes(x, xFormat, f.axis)}
          <Tooltip cursor={{ stroke: "var(--kora-line-strong)" }} content={(p) => <ChartTooltip {...(p as object)} xFormat={xFormat} format={f.value} />} />
          {items.map((s) => (
            <Area key={s.key} dataKey={s.key} name={s.label} stackId={stacked ? "stack" : undefined} stroke={s.color} strokeWidth={2} fill={s.color} fillOpacity={0.14} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--kora-surface)" }} isAnimationActive={false} />
          ))}
        </RAreaChart>
      </ResponsiveContainer>
    </Frame>
  );
}

export function BarChart({ data, x, series, xFormat, valueFormat, stacked, ...state }: CartesianChartProps & { stacked?: boolean }) {
  const f = useFormats(valueFormat);
  const items = resolved(series);
  return (
    <Frame {...state} isEmpty={data.length === 0} legend={<Legend items={items} />} table={<DataTableFallback summary={state.summary} data={data} x={x} series={series} />}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={margin} barGap={2} barCategoryGap="28%">
          {axes(x, xFormat, f.axis)}
          <Tooltip cursor={{ fill: "var(--kora-surface-2)" }} content={(p) => <ChartTooltip {...(p as object)} xFormat={xFormat} format={f.value} />} />
          {items.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              maxBarSize={32}
              stackId={stacked ? "stack" : undefined}
              stroke={stacked ? "var(--kora-surface)" : undefined}
              strokeWidth={stacked ? 2 : 0}
              radius={!stacked || i === items.length - 1 ? [4, 4, 0, 0] : 0}
              isAnimationActive={false}
            />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </Frame>
  );
}

export type DonutSlice = { name: string; value: number; color?: string };

/** Keep to about five slices. Stacks its legend below the ring on phones. */
export function DonutChart({ data, centerLabel, valueFormat, height = 220, ...state }: ChartStateProps & {
  data: DonutSlice[];
  /** Text under the total in the middle of the ring. */
  centerLabel?: string;
  valueFormat?: Format;
}) {
  const f = useFormats(valueFormat);
  const total = data.reduce((sum, s) => sum + s.value, 0);
  const slices = data.map((s, i) => ({ ...s, fill: s.color ?? slotColor(i) }));
  return (
    <Frame
      {...state}
      height={undefined}
      isEmpty={total === 0}
      table={<DataTableFallback summary={state.summary} data={data} x="name" series={[{ key: "value", label: state.summary }]} />}
    >
      <div className="kr:flex kr:flex-col kr:items-center kr:gap-4 kr:md:flex-row">
        <div className="kr:relative kr:w-full kr:min-w-0 kr:md:w-1/2" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="100%" stroke="var(--kora-surface)" strokeWidth={2} isAnimationActive={false} />
              <Tooltip content={(p) => <ChartTooltip active={p.active} payload={p.payload as readonly TooltipEntry[]} format={f.value} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="kr:pointer-events-none kr:absolute kr:inset-0 kr:flex kr:flex-col kr:items-center kr:justify-center">
            <span className="kr:text-xl kr:font-semibold kr:text-fg kr:tabular-nums">{f.axis(total)}</span>
            {centerLabel && <span className="kr:text-xs kr:text-muted">{centerLabel}</span>}
          </div>
        </div>
        <ul className="kr:w-full kr:min-w-0 kr:space-y-1.5 kr:text-[0.8125rem] kr:md:w-1/2">
          {slices.map((s) => (
            <li key={s.name} className="kr:flex kr:items-center kr:gap-2">
              <span aria-hidden className="kr:size-2.5 kr:shrink-0 kr:rounded-[3px]" style={{ background: s.fill }} />
              <span className="kr:min-w-0 kr:truncate kr:text-muted">{s.name}</span>
              <span className="kr:ml-auto kr:font-medium kr:text-fg kr:tabular-nums">{f.value(s.value)}</span>
              <span className="kr:w-9 kr:text-right kr:text-muted kr:tabular-nums">{total ? Math.round((s.value / total) * 100) : 0}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}
