import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Check, ChevronRight, Copy, Link } from "lucide-react";
import { useCopy } from "./code";
import { fill } from "./labels";
import { cn, useLabels } from "./provider";

type Key = string | number;
type Row = { id: string; path: Key[]; value: unknown; level: number; size: number; pos: number; open: boolean; expandable: boolean };

const isBranch = (value: unknown): value is object => value !== null && typeof value === "object";
const entriesOf = (value: object): Array<[Key, unknown]> => (Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value));

/** A JavaScript accessor for the path: user.tags[0], or ["first name"] for keys that are not plain names. */
export function jsonPath(path: Key[]) {
  return path.map((key, i) => (typeof key === "number" ? `[${key}]` : /^[A-Za-z_$][\w$]*$/.test(key) ? (i ? `.${key}` : key) : `[${JSON.stringify(key)}]`)).join("");
}

/** The visible rows: a node is open up to expandDepth levels, unless it was toggled. */
export function jsonRows(data: unknown, expandDepth: number, toggled: Set<string>): Row[] {
  const rows: Row[] = [];
  const walk = (entries: Array<[Key, unknown]>, parent: Key[], level: number) => {
    entries.forEach(([key, value], i) => {
      const path = [...parent, key];
      const id = JSON.stringify(path);
      const expandable = isBranch(value) && entriesOf(value).length > 0;
      const open = expandable && (level <= expandDepth) !== toggled.has(id);
      rows.push({ id, path, value, level, size: entries.length, pos: i + 1, open, expandable });
      if (open) walk(entriesOf(value as object), path, level + 1);
    });
  };
  if (isBranch(data)) walk(entriesOf(data), [], 1);
  else rows.push({ id: "[]", path: [], value: data, level: 1, size: 1, pos: 1, open: false, expandable: false });
  return rows;
}

const copyText = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? String(value));

export function JsonViewer({ data, expandDepth = 1, maxStringLength = 80, className, "aria-label": ariaLabel = "JSON" }: {
  data: unknown;
  /** Levels open at start. 0 shows only the top keys. Default 1. */
  expandDepth?: number;
  /** Longer strings are cut, with a button to show all. Default 80. */
  maxStringLength?: number;
  className?: string;
  "aria-label"?: string;
}) {
  const t = useLabels();
  const [toggled, setToggled] = useState(() => new Set<string>());
  const [fullStrings, setFullStrings] = useState(() => new Set<string>());
  const [active, setActive] = useState(0);
  const { copied, copy } = useCopy();
  const rows = useMemo(() => jsonRows(data, expandDepth, toggled), [data, expandDepth, toggled]);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const moveFocus = useRef(false);
  const current = Math.min(active, rows.length - 1);

  useEffect(() => {
    if (moveFocus.current) refs.current[current]?.focus();
    moveFocus.current = false;
  }, [current, rows]);

  const flip = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (!next.delete(id)) next.add(id);
    return next;
  };
  const toggle = (row: Row) => setToggled((s) => flip(s, row.id));
  const isLong = (row: Row) => typeof row.value === "string" && row.value.length > maxStringLength;
  const go = (i: number) => {
    moveFocus.current = true;
    setActive(Math.max(0, Math.min(i, rows.length - 1)));
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const row = rows[i]!;
    const keys: Record<string, () => void> = {
      ArrowDown: () => go(i + 1),
      ArrowUp: () => go(i - 1),
      Home: () => go(0),
      End: () => go(rows.length - 1),
      ArrowRight: () => (row.expandable && !row.open ? toggle(row) : row.open && go(i + 1)),
      ArrowLeft: () => {
        if (row.open) return toggle(row);
        for (let j = i - 1; j >= 0; j--) if (rows[j]!.level === row.level - 1) return go(j);
      },
      Enter: () => (row.expandable ? toggle(row) : isLong(row) && setFullStrings((s) => flip(s, row.id))),
      " ": () => keys.Enter!(),
      c: () => copy(copyText(row.value), `${row.id}value`),
      p: () => row.path.length > 0 && copy(jsonPath(row.path), `${row.id}path`),
    };
    const action = keys[e.key];
    if (!action || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    action();
  };

  return (
    <div className={cn("kr:min-w-0 kr:max-w-full kr:overflow-auto kr:rounded-md kr:border kr:border-line kr:bg-surface kr:p-1.5 kr:font-mono kr:[&_*]:font-mono kr:text-[0.8125rem] kr:leading-6 kr:text-fg", className)}>
      <div role="tree" aria-label={ariaLabel}>
        {rows.map((row, i) => {
          const key = row.path[row.path.length - 1];
          const full = fullStrings.has(row.id);
          return (
            <div
              key={row.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="treeitem"
              aria-level={row.level}
              aria-setsize={row.size}
              aria-posinset={row.pos}
              aria-expanded={row.expandable ? row.open : undefined}
              tabIndex={i === current ? 0 : -1}
              onFocus={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => row.expandable && toggle(row)}
              className={cn(
                "kr:group kr:flex kr:items-start kr:gap-1 kr:rounded-sm kr:pr-1 kr:outline-none kr:hover:bg-surface-2 kr:focus-visible:ring-2 kr:focus-visible:ring-inset kr:focus-visible:ring-accent",
                row.expandable && "kr:cursor-pointer",
              )}
              style={{ paddingLeft: `${(row.level - 1) * 1.25 + 0.25}rem` }}
            >
              <ChevronRight aria-hidden className={cn("kr:mt-1 kr:size-4 kr:shrink-0 kr:text-muted kr:transition-transform", row.open && "kr:rotate-90", !row.expandable && "kr:invisible")} />
              <span className="kr:min-w-0 kr:flex-1 kr:whitespace-pre-wrap kr:[overflow-wrap:anywhere]">
                {key !== undefined && (
                  <>
                    <span className={typeof key === "number" ? "kr:text-muted" : "kr:text-fg"}>{key}</span>
                    <span className="kr:text-muted">: </span>
                  </>
                )}
                <Value value={row.value} open={row.open} cut={!full && isLong(row) ? maxStringLength : undefined} itemCount={(n) => (n === 1 ? t.oneItem : fill(t.itemCount, { count: n }))} />
                {isLong(row) && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullStrings((s) => flip(s, row.id));
                    }}
                    className="kr:ml-1 kr:cursor-pointer kr:text-xs kr:text-muted kr:underline kr:underline-offset-2 kr:hover:text-fg"
                  >
                    {full ? t.showLess : t.showMore}
                  </button>
                )}
              </span>
              <span className="kr:flex kr:shrink-0 kr:gap-0.5 kr:opacity-0 kr:group-hover:opacity-100 kr:group-focus-visible:opacity-100 kr:[@media(hover:none)]:opacity-100">
                {row.path.length > 0 && (
                  <RowButton label={t.copyPath} done={copied === `${row.id}path`} icon={<Link aria-hidden />} onClick={() => copy(jsonPath(row.path), `${row.id}path`)} />
                )}
                <RowButton label={t.copyValue} done={copied === `${row.id}value`} icon={<Copy aria-hidden />} onClick={() => copy(copyText(row.value), `${row.id}value`)} />
              </span>
            </div>
          );
        })}
      </div>
      <span aria-live="polite" className="kr:sr-only">{copied ? t.copied : ""}</span>
    </div>
  );
}

/** Mouse and touch shortcut; keyboard people press c and p on the row. */
function RowButton({ label, done, icon, onClick }: { label: string; done: boolean; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="kr:inline-flex kr:size-6 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-sm kr:text-muted kr:hover:bg-surface kr:hover:text-fg kr:[&_svg]:size-3.5"
    >
      {done ? <Check aria-hidden className="kr:text-success" /> : icon}
    </button>
  );
}

function Value({ value, open, cut, itemCount }: { value: unknown; open: boolean; cut?: number; itemCount: (n: number) => string }) {
  if (isBranch(value)) {
    const n = entriesOf(value).length;
    const [l, r] = Array.isArray(value) ? ["[", "]"] : ["{", "}"];
    return (
      <span className="kr:text-muted">
        {open ? l : n ? `${l}…${r}` : `${l}${r}`}
        <span className="kr:ml-2 kr:text-xs">{itemCount(n)}</span>
      </span>
    );
  }
  if (typeof value === "string") return <span className="kr:text-success">"{cut ? `${value.slice(0, cut)}…` : value}"</span>;
  if (typeof value === "number" || typeof value === "bigint") return <span className="kr:text-info">{String(value)}</span>;
  if (typeof value === "boolean") return <span className="kr:text-warning">{String(value)}</span>;
  return <span className="kr:text-muted kr:italic">{value === null ? "null" : String(value)}</span>;
}
