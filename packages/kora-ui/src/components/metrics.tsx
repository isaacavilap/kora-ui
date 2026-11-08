import { useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Progress as RadixProgress } from "radix-ui";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Card } from "./display";
import { Skeleton } from "./display";
import { cn } from "./provider";

/** Decorative trend line. Pair it with a visible value, since it has no axis. */
export function Sparkline({ data, width = 96, height = 28, color = "var(--kora-chart-1)", className }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const range = Math.max(...data) - min || 1;
  const pad = 3;
  const x = (i: number) => (i / (data.length - 1)) * width;
  const y = (v: number) => height - pad - ((v - min) / range) * (height - pad * 2);
  const points = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const end = data[data.length - 1] as number;
  return (
    <svg aria-hidden width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("kr:block kr:shrink-0 kr:overflow-visible", className)}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(data.length - 1)} cy={y(end)} r={2.5} fill={color} />
    </svg>
  );
}

export function deltaTone(delta: number, invert = false) {
  if (delta === 0) return "neutral" as const;
  return delta > 0 !== invert ? ("good" as const) : ("bad" as const);
}

export function Delta({ value, invert, label, className }: {
  /** Percent change, such as 12.5 or -3. */
  value: number;
  /** Set when a decrease is the good direction, such as churn or latency. */
  invert?: boolean;
  label?: ReactNode;
  className?: string;
}) {
  const tone = deltaTone(value, invert);
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : ArrowRight;
  return (
    <span className={cn("kr:inline-flex kr:flex-wrap kr:items-center kr:gap-x-1 kr:text-[0.8125rem] kr:tabular-nums", className)}>
      <span className={cn("kr:inline-flex kr:items-center kr:gap-0.5 kr:font-medium", tone === "good" ? "kr:text-success" : tone === "bad" ? "kr:text-danger" : "kr:text-muted")}>
        <Icon aria-hidden className="kr:size-3.5" />
        {value > 0 ? "+" : ""}
        {value}%
      </span>
      {label && <span className="kr:text-muted">{label}</span>}
    </span>
  );
}

export function KpiCard({ label, value, delta, deltaLabel, invertDelta, trend, hint, loading, className, ...props }: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  value: ReactNode;
  delta?: number;
  deltaLabel?: ReactNode;
  invertDelta?: boolean;
  trend?: number[];
  /** A note under the value, when there is no percent change to show. */
  hint?: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("kr:p-4", props.onClick && "kr:cursor-pointer kr:hover:border-line-strong", className)} aria-busy={loading || undefined} {...props}>
      <p className="kr:text-[0.8125rem] kr:text-muted">{label}</p>
      {loading ? (
        <>
          <Skeleton className="kr:mt-2 kr:h-7 kr:w-24" />
          <Skeleton className="kr:mt-2 kr:h-4 kr:w-32" />
        </>
      ) : (
        <>
          <div className="kr:mt-1 kr:flex kr:flex-wrap kr:items-end kr:justify-between kr:gap-x-3 kr:gap-y-1">
            <p className="kr:min-w-0 kr:wrap-anywhere kr:text-2xl kr:font-semibold kr:text-fg kr:tabular-nums">{value}</p>
            {trend && <Sparkline data={trend} />}
          </div>
          {delta !== undefined && <Delta value={delta} invert={invertDelta} label={deltaLabel} className="kr:mt-1" />}
          {hint && <div className="kr:mt-1 kr:text-[0.8125rem] kr:text-muted">{hint}</div>}
        </>
      )}
    </Card>
  );
}

export type Stat = { label: ReactNode; value: ReactNode; delta?: number; invertDelta?: boolean };

/** One card with several numbers. Two columns on phones, one row from 768px. */
export function StatGroup({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <Card className={cn("kr:overflow-hidden", className)}>
      {/* The negative margin hides the borders on the outer edge, at any number of columns. */}
      <div className="kr:-mt-px kr:-ml-px kr:grid kr:grid-cols-2 kr:md:auto-cols-fr kr:md:grid-flow-col kr:md:grid-cols-none">
        {stats.map((s, i) => (
          <div key={i} className="kr:min-w-0 kr:border-t kr:border-l kr:border-line kr:p-4">
            <p className="kr:truncate kr:text-[0.8125rem] kr:text-muted">{s.label}</p>
            <div className="kr:mt-1 kr:flex kr:flex-wrap kr:items-baseline kr:gap-x-2">
              <p className="kr:text-xl kr:font-semibold kr:text-fg kr:tabular-nums">{s.value}</p>
              {s.delta !== undefined && <Delta value={s.delta} invert={s.invertDelta} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

type ProgressTone = "accent" | "success" | "warning" | "danger";
export type ProgressRange = {
  /** The range ends at this value, in the same unit as `value`. */
  upTo: number;
  tone: ProgressTone;
};

const toneColor = (tone: ProgressTone) => `var(--kora-${tone})`;

/** The tone of the first range that contains the value. Values above the last range use its tone. */
export function rangeTone(value: number, ranges: ProgressRange[], fallback: ProgressTone = "accent") {
  const sorted = [...ranges].sort((a, b) => a.upTo - b.upTo);
  return (sorted.find((r) => value <= r.upTo) ?? sorted[sorted.length - 1])?.tone ?? fallback;
}

/** A gradient for the whole track, with each tone at the middle of its range. */
export function progressGradient(max: number, ranges: ProgressRange[], tone: ProgressTone) {
  if (!ranges.length) return `linear-gradient(90deg, color-mix(in oklab, ${toneColor(tone)} 35%, transparent), ${toneColor(tone)})`;
  let from = 0;
  const stops = [...ranges].sort((a, b) => a.upTo - b.upTo).map((r) => {
    const middle = ((from + Math.min(r.upTo, max)) / 2 / max) * 100;
    from = r.upTo;
    return `${toneColor(r.tone)} ${middle}%`;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

/** A bar. With `ranges`, it takes its color from the value. */
export function Progress({ value, max = 100, label, showValue, tone = "accent", ranges = [], fill = "solid", segments = 10, className }: {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  tone?: ProgressTone;
  /** Colors by value, such as [{ upTo: 50, tone: "danger" }, { upTo: 80, tone: "warning" }, { upTo: 100, tone: "success" }]. */
  ranges?: ProgressRange[];
  /** "solid" is one color. "gradient" blends the ranges. "segments" draws separate pieces. */
  fill?: "solid" | "gradient" | "segments";
  /** The number of pieces when fill is "segments". */
  segments?: number;
  className?: string;
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const labelId = useId();
  const painted = Math.round((percent / 100) * segments);
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="kr:mb-1 kr:flex kr:justify-between kr:gap-3 kr:text-[0.8125rem]">
          <span id={labelId} className="kr:min-w-0 kr:truncate kr:text-fg">{label}</span>
          {showValue && <span className="kr:text-muted kr:tabular-nums">{Math.round(percent)}%</span>}
        </div>
      )}
      <RadixProgress.Root
        value={value}
        max={max}
        aria-labelledby={label ? labelId : undefined}
        className={cn("kr:h-1.5", fill === "segments" ? "kr:flex kr:gap-0.5" : "kr:overflow-hidden kr:rounded-full kr:bg-surface-2")}
      >
        {fill === "segments" ? (
          Array.from({ length: segments }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="kr:min-w-0 kr:flex-1 kr:rounded-[1px] kr:bg-surface-2"
              // Each piece keeps the color of its own place in the ranges.
              style={i < painted ? { background: toneColor(rangeTone(((i + 1) / segments) * max, ranges, tone)) } : undefined}
            />
          ))
        ) : (
          <RadixProgress.Indicator
            className="kr:h-full kr:rounded-full kr:transition-[width]"
            style={{
              width: `${percent}%`,
              // The gradient keeps the size of the whole track, so a short bar shows only its first part.
              ...(fill === "gradient"
                ? { backgroundImage: progressGradient(max, ranges, tone), backgroundSize: percent > 0 ? `${10000 / percent}% 100%` : undefined }
                : { background: toneColor(rangeTone(value, ranges, tone)) }),
            }}
          />
        )}
      </RadixProgress.Root>
    </div>
  );
}
