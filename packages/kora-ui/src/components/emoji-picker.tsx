import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Apple, Clock, Flag, Heart, Lightbulb, PawPrint, Plane, Smile, Trophy, Hand } from "lucide-react";
import type { EmojiCategory, EmojiEntry } from "./emoji-data";
import { Spinner } from "./button";
import { FieldContext, Input } from "./form";
import type { Labels } from "./labels";
import { cn, useKora, useLabels } from "./provider";

type Section = { id: EmojiCategory | "recent"; emojis: EmojiEntry[] };

const ICONS = { recent: Clock, smileys: Smile, people: Hand, animals: PawPrint, food: Apple, travel: Plane, activities: Trophy, objects: Lightbulb, symbols: Heart, flags: Flag };
const NAMES: Record<Section["id"], keyof Labels> = {
  recent: "emojiRecent", smileys: "emojiSmileys", people: "emojiPeople", animals: "emojiAnimals", food: "emojiFood",
  travel: "emojiTravel", activities: "emojiActivities", objects: "emojiObjects", symbols: "emojiSymbols", flags: "emojiFlags",
};
const COLUMNS = 8;

/** Lowercase, without accents, so "corazon" finds "corazón". */
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Emojis whose English or Spanish name or keywords contain every word of the query. */
export function searchEmoji(data: Array<[EmojiCategory, EmojiEntry[]]>, query: string) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return data.flatMap(([, list]) => list).filter(([, en, es]) => {
    const text = fold(`${en} ${es}`);
    return words.every((w) => text.includes(w));
  });
}

function readRecent(key: string): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(saved) ? saved.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
}

export function EmojiPicker({ onSelect, recentKey = "kora-emoji-recent", maxRecent = 16, autoFocus, className }: {
  onSelect: (emoji: string) => void;
  /** localStorage key for the recent emojis. Pass null to keep none. */
  recentKey?: string | null;
  maxRecent?: number;
  autoFocus?: boolean;
  className?: string;
}) {
  const t = useLabels();
  const { locale } = useKora();
  const baseId = useId();
  const [data, setData] = useState<Array<[EmojiCategory, EmojiEntry[]]> | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    let live = true;
    import("./emoji-data").then((m) => live && setData(m.EMOJI));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (recentKey) setRecent(readRecent(recentKey));
  }, [recentKey]);

  const sections = useMemo<Section[]>(() => {
    if (!data) return [];
    if (query.trim()) return [{ id: "smileys", emojis: searchEmoji(data, query) }];
    const byEmoji = new Map(data.flatMap(([, list]) => list.map((e) => [e[0], e] as const)));
    const recents = recent.map((e) => byEmoji.get(e) ?? ([e, e, e] as EmojiEntry));
    return [...(recents.length ? [{ id: "recent" as const, emojis: recents }] : []), ...data.map(([id, emojis]) => ({ id, emojis }))];
  }, [data, recent, query]);
  const flat = useMemo(() => sections.flatMap((s) => s.emojis), [sections]);
  const current = Math.min(active, Math.max(flat.length - 1, 0));
  const nameOf = (entry: EmojiEntry) => (locale === "es" ? entry[2] : entry[1]).split("|")[0]!;

  useEffect(() => setActive(0), [query]);

  const choose = (emoji: string) => {
    onSelect(emoji);
    if (!recentKey) return;
    const next = [emoji, ...readRecent(recentKey).filter((e) => e !== emoji)].slice(0, maxRecent);
    setRecent(next);
    try {
      localStorage.setItem(recentKey, JSON.stringify(next));
    } catch {
      // Private mode or blocked storage: recents just stay for this visit.
    }
  };
  const focusAt = (i: number) => {
    const next = Math.max(0, Math.min(i, flat.length - 1));
    setActive(next);
    buttons.current[next]?.focus();
  };

  // ponytail: up and down move by 8 in the flat order, so they drift a column at a section boundary; per-section rows if it bothers.
  const onGridKey = (e: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS };
    if (e.key in moves) {
      e.preventDefault();
      if (e.key === "ArrowUp" && current < COLUMNS) return document.getElementById(`${baseId}-search`)?.focus();
      focusAt(current + moves[e.key]!);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(flat.length - 1);
    }
  };

  const shown = flat[current];
  let index = -1;
  return (
    <div className={cn("kr:flex kr:w-80 kr:max-w-full kr:flex-col kr:overflow-hidden kr:rounded-md kr:border kr:border-line kr:bg-surface kr:text-fg", className)}>
      <div className="kr:p-2">
        <FieldContext.Provider value={null}>
          <Input
            id={`${baseId}-search`}
            type="search"
            autoFocus={autoFocus}
            aria-label={t.emojiSearch}
            placeholder={t.emojiSearch}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                focusAt(0);
              } else if (e.key === "Enter" && flat[0]) {
                e.preventDefault();
                choose(flat[0][0]);
              }
            }}
          />
        </FieldContext.Provider>
      </div>
      {!query.trim() && data && (
        <nav aria-label={t.emojiCategories} className="kr:flex kr:justify-between kr:border-b kr:border-line kr:px-1.5 kr:pb-1">
          {sections.map((s) => {
            const Icon = ICONS[s.id];
            return (
              <button
                key={s.id}
                type="button"
                title={t[NAMES[s.id]]}
                aria-label={t[NAMES[s.id]]}
                onClick={() => {
                  const heading = document.getElementById(`${baseId}-${s.id}`);
                  if (heading && scroller.current) scroller.current.scrollTop = heading.offsetTop - scroller.current.offsetTop;
                }}
                className="kr:inline-flex kr:size-8 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-sm kr:text-muted kr:outline-none kr:hover:bg-surface-2 kr:hover:text-fg kr:focus-visible:ring-2 kr:focus-visible:ring-accent"
              >
                <Icon aria-hidden className="kr:size-4" />
              </button>
            );
          })}
        </nav>
      )}
      <div ref={scroller} onKeyDown={onGridKey} className="kr:relative kr:h-64 kr:overflow-y-auto kr:px-2 kr:pb-2">
        {!data && <div className="kr:flex kr:h-full kr:items-center kr:justify-center kr:text-muted"><Spinner /><span className="kr:sr-only">{t.loading}</span></div>}
        {data && flat.length === 0 && <p className="kr:py-8 kr:text-center kr:text-sm kr:text-muted">{t.noResults}</p>}
        {sections.map((s) => s.emojis.length > 0 && (
          <section key={s.id} aria-labelledby={`${baseId}-${s.id}`}>
            <h3 id={`${baseId}-${s.id}`} className={cn("kr:sticky kr:top-0 kr:z-10 kr:bg-surface kr:pt-2 kr:pb-1 kr:text-xs kr:font-medium kr:text-muted", query.trim() && "kr:sr-only")}>
              {query.trim() ? t.search : t[NAMES[s.id]]}
            </h3>
            <div className="kr:grid kr:grid-cols-8">
              {s.emojis.map((entry) => {
                const i = ++index;
                return (
                  <button
                    key={`${s.id}${entry[0]}`}
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    type="button"
                    tabIndex={i === current ? 0 : -1}
                    aria-label={nameOf(entry)}
                    onFocus={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(entry[0])}
                    className={cn(
                      "kr:flex kr:aspect-square kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-sm kr:text-[1.375rem] kr:leading-none kr:outline-none kr:focus-visible:ring-2 kr:focus-visible:ring-accent",
                      i === current && "kr:bg-surface-2",
                    )}
                  >
                    {entry[0]}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div aria-hidden className="kr:flex kr:h-10 kr:items-center kr:gap-2 kr:border-t kr:border-line kr:px-3 kr:text-sm kr:text-muted">
        {shown && <><span className="kr:text-xl kr:leading-none">{shown[0]}</span><span className="kr:truncate">{nameOf(shown)}</span></>}
      </div>
    </div>
  );
}
