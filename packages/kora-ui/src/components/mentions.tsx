import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, SyntheticEvent } from "react";
import { insertText } from "./code";
import { Avatar } from "./display";
import { fill } from "./labels";
import { Input, Textarea } from "./form";
import { Spinner } from "./button";
import { cn, useLabels } from "./provider";

/** value is what goes in the text after the trigger, so it can have no spaces: a handle like "ana.garcia". */
export type MentionOption = { value: string; label: string; description?: string; avatar?: string };

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const HANDLE = String.raw`[\p{L}\p{N}_.-]`;
const HANDLE_END = String.raw`[\p{L}\p{N}_]`;

/** The handles mentioned in a text, in order and without repeats: parseMentions("hi @ana and @luis") is ["ana", "luis"]. */
export function parseMentions(text: string, trigger = "@") {
  const re = new RegExp(String.raw`(?:^|[^\p{L}\p{N}_])${escapeRegex(trigger)}(${HANDLE}*${HANDLE_END})`, "gu");
  return [...new Set([...text.matchAll(re)].map((m) => m[1]!))];
}

/** The query being typed right before the caret, or null when the caret is not in a mention. */
export function mentionQuery(text: string, caret: number, trigger = "@") {
  const match = new RegExp(String.raw`(?:^|\s)${escapeRegex(trigger)}(${HANDLE}*)$`, "u").exec(text.slice(0, caret));
  return match ? match[1]! : null;
}

export function filterMentions(options: MentionOption[], query: string) {
  const q = fold(query);
  return options.filter((o) => fold(o.label).includes(q) || fold(o.value).includes(q));
}

type MentionsProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** The people or things to mention. Filtered by label and value as people type. */
  options?: MentionOption[];
  /** Finds options on a server instead, for each query. Calls are delayed 150ms while typing, and late answers are dropped. */
  onSearch?: (query: string) => Promise<MentionOption[]> | MentionOption[];
  trigger?: string;
  /** One line instead of a textarea. */
  singleLine?: boolean;
  rows?: number;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  emptyText?: string;
  "aria-label"?: string;
};

/** A text field that suggests people after @. The value stays plain text, with mentions as @handle (see parseMentions). */
export function Mentions({ value, defaultValue = "", onChange, options = [], onSearch, trigger = "@", singleLine, rows = 3, className, emptyText, ...props }: MentionsProps) {
  const t = useLabels();
  const listId = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const [query, setQuery] = useState<string | null>(null);
  const [results, setResults] = useState<MentionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const field = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const request = useRef(0);

  useEffect(() => {
    setActive(0);
    if (query === null) return;
    if (!onSearch) return setResults(filterMentions(options, query).slice(0, 8));
    const ticket = ++request.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      let found: MentionOption[] = [];
      try {
        found = await onSearch(query);
      } catch {
        found = [];
      }
      if (ticket !== request.current) return;
      setResults(found);
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
    // options often comes as a new array each render; the query is what should rerun the search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, onSearch]);

  const detect = ({ currentTarget: el }: SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setQuery(el.selectionStart === el.selectionEnd ? mentionQuery(el.value, el.selectionStart ?? 0, trigger) : null);
  };

  const choose = (option?: MentionOption) => {
    const el = field.current;
    if (!option || !el || query === null) return;
    const caret = el.selectionStart ?? current.length;
    const start = caret - query.length - trigger.length;
    insertText(el, `${trigger}${option.value} `, start, caret);
    setQuery(null);
  };

  const open = query !== null && (loading || results.length > 0 || query.length > 0);
  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (results.length ? (a + step + results.length) % results.length : 0));
    } else if ((e.key === "Enter" || e.key === "Tab") && results[active] && !loading) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery(null);
    }
  };

  const shared = {
    ...props,
    ref: field,
    value: current,
    autoComplete: "off",
    "aria-autocomplete": "list" as const,
    "aria-controls": open ? listId : undefined,
    "aria-activedescendant": open && results[active] ? `${listId}-${active}` : undefined,
    onChange: (e: SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const next = e.currentTarget.value;
      if (value === undefined) setInner(next);
      onChange?.(next);
      detect(e);
    },
    onSelect: detect,
    onKeyDown,
    onBlur: () => setQuery(null),
  };

  return (
    <div className={cn("kr:relative kr:min-w-0", className)}>
      {singleLine ? <Input {...shared} role="combobox" aria-expanded={open} /> : <Textarea {...shared} rows={rows} />}
      {open && (
        <ul id={listId} role="listbox" aria-label={t.mentionSuggestions} className="kr:absolute kr:top-full kr:left-0 kr:z-50 kr:mt-1 kr:max-h-64 kr:w-72 kr:max-w-full kr:overflow-y-auto kr:rounded-md kr:border kr:border-line kr:bg-surface kr:p-1 kr:text-fg kr:shadow-overlay kr:animate-[kr-pop-in_120ms_ease-out]">
          {loading && <li className="kr:flex kr:items-center kr:gap-2 kr:px-2.5 kr:py-2 kr:text-sm kr:text-muted"><Spinner />{t.loading}</li>}
          {!loading && results.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              onMouseMove={() => setActive(i)}
              className={cn("kr:flex kr:min-h-10 kr:cursor-pointer kr:items-center kr:gap-2.5 kr:rounded-sm kr:px-2 kr:py-1 kr:text-sm", i === active && "kr:bg-surface-2")}
            >
              <Avatar name={o.label} src={o.avatar} size={28} />
              <span className="kr:flex kr:min-w-0 kr:flex-col">
                <span className="kr:truncate kr:font-medium">{o.label}</span>
                <span className="kr:truncate kr:text-xs kr:text-muted">{o.description ?? `${trigger}${o.value}`}</span>
              </span>
            </li>
          ))}
          {!loading && results.length === 0 && <li className="kr:px-2.5 kr:py-2 kr:text-sm kr:text-muted">{emptyText ?? t.noResults}</li>}
        </ul>
      )}
      <span aria-live="polite" className="kr:sr-only">{open && !loading ? fill(t.resultCount, { count: results.length }) : ""}</span>
    </div>
  );
}
