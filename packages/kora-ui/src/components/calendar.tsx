import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button, focusRing } from "./button";
import type { Tone } from "./display";
import { Avatar } from "./display";
import { fill } from "./labels";
import { cn, plainSpaces, useKora, useLabels } from "./provider";
import { SegmentedControl } from "./widgets";

export type CalendarEvent = {
  id: string;
  title: ReactNode;
  /** A Date, or a "YYYY-MM-DD" string read as a local day. */
  date: Date | string;
  /** Start, such as "09:30" or "2:30 pm". Without it, the event lasts all day. */
  time?: string;
  /** End, in the same format. Without it, the event lasts one hour. */
  endTime?: string;
  tone?: Tone;
  /** The `id` of one of the `people`. */
  personId?: string;
};

export type CalendarPerson = {
  id: string;
  name: string;
  /** A photo. Without it, the avatar is generated from the id. */
  avatar?: string;
};

type GridColumn = { key: string; header?: ReactNode; events: CalendarEvent[] };

export type CalendarView = "day" | "week" | "month" | "year" | "list";

const allViews: CalendarView[] = ["day", "week", "month", "year", "list"];
/** Height of one hour in the day and week views, in rem. */
const HOUR = 3;

const dot: Partial<Record<Tone, string>> = {
  success: "kr:bg-success",
  warning: "kr:bg-warning",
  danger: "kr:bg-danger",
};

const toDate = (value: Date | string) => (typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00`) : value);
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Whole weeks that contain the month. `weekStart` is 0 for Sunday and 1 for Monday. */
export function monthWeeks(year: number, month: number, weekStart: number) {
  const first = new Date(year, month, 1);
  const cursor = new Date(year, month, 1 - ((first.getDay() - weekStart + 7) % 7));
  const weeks: Date[][] = [];
  do {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  } while (cursor.getMonth() === month);
  return weeks;
}

/** The seven days of the week that contains `date`. */
export function weekDays(date: Date, weekStart: number) {
  const offset = (date.getDay() - weekStart + 7) % 7;
  return Array.from({ length: 7 }, (_, i) => new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset + i));
}

/** Moves `steps` days, weeks, months, or years, depending on the view. */
export function shiftDate(date: Date, view: CalendarView, steps: number) {
  const [y, m, d] = [date.getFullYear(), date.getMonth(), date.getDate()];
  if (view === "day") return new Date(y, m, d + steps);
  if (view === "week") return new Date(y, m, d + steps * 7);
  if (view === "year") return new Date(y + steps, m, 1);
  return new Date(y, m + steps, 1);
}

/** Minutes after midnight for "09:30" or "2:30 pm". Returns null if the text is not a time. */
export function parseTime(value?: string) {
  const match = value?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])?\.?\s*(?:m\.?)?$/i);
  if (!match) return null;
  const minutes = Number(match[2] ?? 0);
  let hours = Number(match[1]);
  const period = match[3]?.toLowerCase();
  if (period && (hours < 1 || hours > 12)) return null;
  if (period) hours = (hours % 12) + (period === "p" ? 12 : 0);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

export type PlacedEvent = { event: CalendarEvent; start: number; end: number; lane: number; lanes: number };

/** Gives the timed events of one day a position. Events at the same time share the width of the day. */
export function placeEvents(events: CalendarEvent[]) {
  const placed = events
    .flatMap((event): PlacedEvent[] => {
      const start = parseTime(event.time);
      if (start === null) return [];
      return [{ event, start, end: Math.min(1440, Math.max(parseTime(event.endTime) ?? start + 60, start + 30)), lane: 0, lanes: 1 }];
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  let group: PlacedEvent[] = [];
  const closeGroup = () => {
    const lanes = Math.max(...group.map((p) => p.lane)) + 1;
    for (const p of group) p.lanes = lanes;
    group = [];
  };
  for (const p of placed) {
    if (group.length && group.every((other) => other.end <= p.start)) closeGroup();
    while (group.some((other) => other.lane === p.lane && other.end > p.start)) p.lane++;
    group.push(p);
  }
  if (group.length) closeGroup();
  return placed;
}

const eventDot = (event: CalendarEvent) => <span aria-hidden className={cn("kr:size-2 kr:shrink-0 kr:rounded-full", (event.tone && dot[event.tone]) ?? "kr:bg-accent")} />;
const eventHover = "kr:cursor-pointer kr:rounded-sm kr:text-left kr:hover:bg-surface-2";

function EventRow({ event, onClick }: { event: CalendarEvent; onClick?: (event: CalendarEvent) => void }) {
  return (
    <button type="button" onClick={() => onClick?.(event)} className={cn("kr:flex kr:min-h-11 kr:w-full kr:items-center kr:gap-2 kr:px-1 kr:text-sm kr:md:min-h-9", eventHover, focusRing)}>
      {eventDot(event)}
      <span className="kr:min-w-0 kr:flex-1 kr:truncate">{event.title}</span>
      {event.time && <span className="kr:shrink-0 kr:text-muted kr:tabular-nums">{event.time}</span>}
    </button>
  );
}

/** A calendar with day, week, month, year, and list views. Every view works on phones. */
export function EventCalendar({ events, defaultDate, defaultView = "month", views = allViews, people, onEventClick, onAddEvent, className }: {
  events: CalendarEvent[];
  /** The first date to show. The default is today. */
  defaultDate?: Date;
  defaultView?: CalendarView;
  /** The views people can choose. With only one view, the switch does not show. */
  views?: CalendarView[];
  /** Gives the day view one column for each person, with their avatar on top. */
  people?: CalendarPerson[];
  onEventClick?: (event: CalendarEvent) => void;
  /** Shows an add button on each open day. */
  onAddEvent?: (day: Date) => void;
  className?: string;
}) {
  const t = useLabels();
  const { locale } = useKora();
  const [view, setView] = useState(defaultView);
  const [visible, setVisible] = useState(defaultDate);
  const [today, setToday] = useState<string>();
  // Read after mount, because the server may be in another time zone.
  useEffect(() => {
    setToday(dayKey(new Date()));
    setVisible((current) => current ?? new Date());
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dayKey(toDate(event.date));
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    // Events that last all day go first.
    for (const list of map.values()) list.sort((a, b) => (parseTime(a.time) ?? -1) - (parseTime(b.time) ?? -1));
    return map;
  }, [events]);

  const frame = "kr:min-w-0 kr:overflow-hidden kr:rounded-lg kr:border kr:border-line kr:bg-surface kr:text-fg";
  if (!visible) return <div className={cn(frame, "kr:h-96", className)} />;

  const year = visible.getFullYear();
  const month = visible.getMonth();
  const weekStart = locale === "es" ? 1 : 0;
  const weeks = monthWeeks(year, month, weekStart);
  const week = weekDays(visible, weekStart);
  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const monthName = new Intl.DateTimeFormat(locale, { month: "long" });
  const eventsOn = (day: Date) => byDay.get(dayKey(day)) ?? [];
  const eventCount = (count: number) => (count === 1 ? t.oneEvent : fill(t.eventCount, { count }));

  const monthTitle = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visible);
  const title = {
    day: new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(visible),
    week: plainSpaces(new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).formatRange(week[0]!, week[6]!)),
    month: monthTitle,
    list: monthTitle,
    year: String(year),
  }[view];

  const open = (next: CalendarView, date: Date) => {
    setVisible(date);
    if (views.includes(next)) setView(next);
  };
  const addButton = (day: Date) =>
    onAddEvent && (
      <Button variant="ghost" size="icon" aria-label={`${t.addEvent}, ${dayLabel.format(day)}`} onClick={() => onAddEvent(day)}>
        <Plus aria-hidden />
      </Button>
    );

  /** One day as a heading and its events. */
  const dayBlock = (day: Date, { showEmpty = false, linked = false, showEvents = true } = {}) => {
    const list = eventsOn(day);
    const isToday = dayKey(day) === today;
    return (
      <section key={dayKey(day)} className="kr:p-3">
        <div className="kr:flex kr:min-h-9 kr:items-center kr:gap-2">
          <h3 className={cn("kr:mr-auto kr:text-[0.8125rem] kr:font-medium kr:capitalize", isToday ? "kr:text-accent" : "kr:text-muted")}>
            {linked ? (
              <button type="button" onClick={() => open("day", day)} className={cn("kr:cursor-pointer kr:rounded-sm kr:capitalize kr:hover:underline", focusRing)}>{dayLabel.format(day)}</button>
            ) : (
              dayLabel.format(day)
            )}
          </h3>
          {addButton(day)}
        </div>
        {!showEvents ? null : list.length > 0 ? (
          <ul className="kr:space-y-0.5">
            {list.map((event) => (
              <li key={event.id}><EventRow event={event} onClick={onEventClick} /></li>
            ))}
          </ul>
        ) : (
          showEmpty && <p className="kr:px-1 kr:text-sm kr:text-muted">{t.noEvents}</p>
        )}
      </section>
    );
  };

  /** Hours in rows, with one column for each day or person. */
  const timeGrid = (columns: GridColumn[], { gridClass, scroll }: { gridClass?: string; scroll?: boolean } = {}) => {
    const placed = columns.map((column) => placeEvents(column.events));
    const timed = placed.flat();
    const from = Math.min(8, ...timed.map((p) => Math.floor(p.start / 60)));
    const to = Math.max(18, ...timed.map((p) => Math.ceil(p.end / 60)));
    const hours = Array.from({ length: to - from }, (_, i) => from + i);
    const hourLabel = new Intl.DateTimeFormat(locale, { hour: "numeric" });
    const allDay = columns.map((column) => column.events.filter((event) => parseTime(event.time) === null));
    const template = { gridTemplateColumns: `3.5rem repeat(${columns.length}, minmax(${scroll ? "7.5rem" : "0"}, 1fr))` };
    // When the columns scroll sideways, the hours stay in view.
    const pinned = scroll && "kr:sticky kr:left-0 kr:z-10 kr:bg-surface";
    const grid = (
      <div style={template} className={cn("kr:grid", gridClass)}>
        {columns.some((column) => column.header) && (
          <>
            <div className={cn("kr:border-b kr:border-line", pinned)} />
            {columns.map((column) => (
              <div key={column.key} className="kr:min-w-0 kr:border-b kr:border-l kr:border-line kr:p-1 kr:text-center">{column.header}</div>
            ))}
          </>
        )}
        {allDay.some((list) => list.length > 0) && (
          <>
            <div className={cn("kr:border-b kr:border-line kr:p-1 kr:text-xs kr:text-muted", pinned)}>{t.allDay}</div>
            {allDay.map((list, i) => (
              <ul key={columns[i]!.key} className="kr:min-w-0 kr:space-y-0.5 kr:border-b kr:border-l kr:border-line kr:p-1">
                {list.map((event) => (
                  <li key={event.id}>
                    <button type="button" onClick={() => onEventClick?.(event)} className={cn("kr:flex kr:w-full kr:items-center kr:gap-1.5 kr:px-1 kr:py-0.5 kr:text-xs", eventHover, focusRing)}>
                      {eventDot(event)}
                      <span className="kr:min-w-0 kr:flex-1 kr:truncate">{event.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          </>
        )}
        <div aria-hidden className={cn(pinned)}>
          {hours.map((hour) => (
            <div key={hour} style={{ height: `${HOUR}rem` }} className="kr:border-t kr:border-line kr:px-1.5 kr:pt-0.5 kr:text-right kr:text-xs kr:text-muted kr:tabular-nums kr:first:border-t-0">
              {hourLabel.format(new Date(2026, 0, 1, hour))}
            </div>
          ))}
        </div>
        {placed.map((list, i) => (
          <div key={columns[i]!.key} className="kr:relative kr:min-w-0 kr:border-l kr:border-line">
            {hours.map((hour) => (
              <div key={hour} aria-hidden style={{ height: `${HOUR}rem` }} className="kr:border-t kr:border-line kr:first:border-t-0" />
            ))}
            {list.map((p) => (
              <button
                key={p.event.id}
                type="button"
                onClick={() => onEventClick?.(p.event)}
                style={{
                  top: `${((p.start - from * 60) / 60) * HOUR}rem`,
                  height: `${((p.end - p.start) / 60) * HOUR}rem`,
                  left: `${(p.lane / p.lanes) * 100}%`,
                  width: `${100 / p.lanes}%`,
                }}
                className={cn("kr:absolute kr:flex kr:cursor-pointer kr:flex-col kr:overflow-hidden kr:rounded-sm kr:border kr:border-line kr:bg-surface-2 kr:px-1.5 kr:text-left kr:text-xs kr:hover:bg-surface", focusRing)}
              >
                <span className="kr:flex kr:w-full kr:items-center kr:gap-1.5 kr:pt-0.5">
                  {eventDot(p.event)}
                  <span className="kr:min-w-0 kr:flex-1 kr:truncate kr:font-medium">{p.event.title}</span>
                </span>
                {/* A short event has room for one line, so only screen readers get the time. */}
                <span className={p.end - p.start < 45 ? "kr:sr-only" : "kr:truncate kr:text-muted kr:tabular-nums"}>{p.event.time}{p.event.endTime && ` – ${p.event.endTime}`}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
    return scroll ? <div role="region" tabIndex={0} aria-label={dayLabel.format(visible)} className={cn("kr:overflow-x-auto", focusRing)}>{grid}</div> : grid;
  };

  const dayColumns = (): GridColumn[] => {
    const onDay = eventsOn(visible);
    if (!people?.length) return [{ key: dayKey(visible), events: onDay }];
    const known = new Set(people.map((person) => person.id));
    const unassigned = onDay.filter((event) => !event.personId || !known.has(event.personId));
    const columns: GridColumn[] = people.map((person) => ({
      key: person.id,
      events: onDay.filter((event) => event.personId === person.id),
      header: (
        <span className="kr:flex kr:min-w-0 kr:flex-col kr:items-center kr:gap-1 kr:py-1">
          <Avatar name={person.name} src={person.avatar} seed={person.id} size={32} />
          <span className="kr:w-full kr:truncate kr:text-xs kr:font-medium">{person.name}</span>
        </span>
      ),
    }));
    // Events with no person stay visible, in their own column.
    if (unassigned.length) columns.push({ key: "kr-unassigned", events: unassigned, header: <span className="kr:block kr:py-1 kr:text-xs kr:text-muted">{t.unassigned}</span> });
    return columns;
  };

  const weekColumns = week.map((day): GridColumn => ({
    key: dayKey(day),
    events: eventsOn(day),
    header: (
      <button
        type="button"
        aria-current={dayKey(day) === today ? "date" : undefined}
        onClick={() => open("day", day)}
        className={cn("kr:cursor-pointer kr:rounded-sm kr:px-1.5 kr:text-xs kr:capitalize kr:hover:bg-surface-2", dayKey(day) === today ? "kr:font-semibold kr:text-accent" : "kr:text-muted", focusRing)}
      >
        {weekday.format(day)} {day.getDate()}
      </button>
    ),
  }));

  const monthEvents = weeks.flat().filter((d) => d.getMonth() === month && byDay.has(dayKey(d)));
  const viewOptions = { day: t.day, week: t.week, month: t.month, year: t.year, list: t.list };

  return (
    <div className={cn(frame, className)}>
      <div className="kr:flex kr:flex-wrap kr:items-center kr:gap-1 kr:border-b kr:border-line kr:p-2">
        <h2 aria-live="polite" className="kr:mr-auto kr:min-w-0 kr:pl-2 kr:text-sm kr:font-semibold kr:capitalize">{title}</h2>
        {views.length > 1 && (
          <SegmentedControl
            aria-label={t.calendarView}
            options={views.map((value) => ({ value, label: viewOptions[value] }))}
            value={view}
            onChange={(next) => setView(next as CalendarView)}
            className="kr:order-last kr:w-full kr:md:order-none kr:md:mr-1 kr:md:w-auto kr:[&>*]:flex-1 kr:[&>*]:px-1 kr:md:[&>*]:px-2.5"
          />
        )}
        <Button variant="ghost" size="sm" onClick={() => setVisible(new Date())}>{t.today}</Button>
        <Button variant="ghost" size="icon" aria-label={t.previous} onClick={() => setVisible(shiftDate(visible, view, -1))}><ChevronLeft aria-hidden /></Button>
        <Button variant="ghost" size="icon" aria-label={t.next} onClick={() => setVisible(shiftDate(visible, view, 1))}><ChevronRight aria-hidden /></Button>
      </div>

      {view === "day" && (
        <>
          {/* The title already names the day, so this row exists only for the add button. */}
          {onAddEvent && dayBlock(visible, { showEvents: false })}
          {timeGrid(dayColumns(), { gridClass: "kr:border-t kr:border-line", scroll: Boolean(people?.length) })}
        </>
      )}

      {view === "week" && (
        <>
          <div className="kr:divide-y kr:divide-line kr:md:hidden">{week.map((day) => dayBlock(day, { showEmpty: true, linked: true }))}</div>
          {timeGrid(weekColumns, { gridClass: "kr:hidden kr:md:grid" })}
        </>
      )}

      {view === "list" && (
        <div className="kr:divide-y kr:divide-line">
          {monthEvents.length === 0 && <p className="kr:p-6 kr:text-center kr:text-sm kr:text-muted">{t.noEvents}</p>}
          {monthEvents.map((day) => dayBlock(day, { linked: true }))}
        </div>
      )}

      {view === "month" && (
        <>
          {/* Phone: a compact month, and the events of the chosen day under it. */}
          <div className="kr:md:hidden">
            <div aria-hidden className="kr:grid kr:grid-cols-7 kr:px-2 kr:pt-2">
              {weeks[0]!.map((d) => <span key={d.getDay()} className="kr:text-center kr:text-xs kr:capitalize kr:text-muted">{weekday.format(d)}</span>)}
            </div>
            <div className="kr:grid kr:grid-cols-7 kr:gap-y-0.5 kr:border-b kr:border-line kr:p-2">
              {weeks.flat().map((day) => {
                const key = dayKey(day);
                const count = eventsOn(day).length;
                const selected = key === dayKey(visible);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    aria-current={key === today ? "date" : undefined}
                    aria-label={count ? `${dayLabel.format(day)}, ${eventCount(count)}` : dayLabel.format(day)}
                    onClick={() => setVisible(day)}
                    className={cn("kr:flex kr:h-11 kr:cursor-pointer kr:flex-col kr:items-center kr:justify-center kr:gap-0.5 kr:rounded-md kr:text-sm kr:tabular-nums", selected && "kr:bg-surface-2 kr:font-semibold", day.getMonth() !== month ? "kr:text-muted" : key === today && "kr:font-semibold kr:text-accent", focusRing)}
                  >
                    {day.getDate()}
                    <span aria-hidden className={cn("kr:size-1 kr:rounded-full", count > 0 && "kr:bg-accent")} />
                  </button>
                );
              })}
            </div>
            {dayBlock(visible, { showEmpty: true, linked: true })}
          </div>

          {/* Desktop: the month grid. */}
          <table className="kr:hidden kr:w-full kr:table-fixed kr:border-collapse kr:md:table">
            <caption className="kr:sr-only">{monthTitle}</caption>
            <thead>
              <tr>
                {weeks[0]!.map((d) => (
                  <th key={d.getDay()} scope="col" className="kr:border-b kr:border-line kr:py-1.5 kr:text-xs kr:font-normal kr:capitalize kr:text-muted">{weekday.format(d)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((row) => (
                <tr key={dayKey(row[0]!)}>
                  {row.map((day) => {
                    const key = dayKey(day);
                    const list = eventsOn(day);
                    const outside = day.getMonth() !== month;
                    return (
                      <td key={key} className={cn("kr:h-24 kr:border-b kr:border-l kr:border-line kr:p-1 kr:align-top kr:first:border-l-0", outside && "kr:bg-surface-2/50")}>
                        <button
                          type="button"
                          aria-label={dayLabel.format(day)}
                          aria-current={key === today ? "date" : undefined}
                          onClick={() => open("day", day)}
                          className={cn("kr:inline-flex kr:size-6 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-full kr:text-xs kr:tabular-nums", key === today ? "kr:bg-accent kr:font-medium kr:text-accent-fg" : cn("kr:hover:bg-surface-2", outside && "kr:text-muted"), focusRing)}
                        >
                          {day.getDate()}
                        </button>
                        <ul className="kr:mt-0.5 kr:space-y-0.5">
                          {list.slice(0, 3).map((event) => (
                            <li key={event.id}>
                              <button type="button" onClick={() => onEventClick?.(event)} className={cn("kr:flex kr:w-full kr:items-center kr:gap-1.5 kr:px-1 kr:py-0.5 kr:text-xs", eventHover, focusRing)}>
                                {eventDot(event)}
                                <span className="kr:min-w-0 kr:flex-1 kr:truncate">{event.title}</span>
                              </button>
                            </li>
                          ))}
                          {list.length > 3 && (
                            <li>
                              <button type="button" onClick={() => open("day", day)} className={cn("kr:w-full kr:px-1 kr:text-xs kr:text-muted", eventHover, focusRing)}>+{list.length - 3}</button>
                            </li>
                          )}
                        </ul>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {view === "year" && (
        <div className="kr:grid kr:grid-cols-2 kr:gap-3 kr:p-3 kr:md:grid-cols-3 kr:lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, m) => {
            const first = new Date(year, m, 1);
            const days = monthWeeks(year, m, weekStart).flat();
            const count = days.filter((d) => d.getMonth() === m).reduce((sum, d) => sum + eventsOn(d).length, 0);
            return (
              <button
                key={m}
                type="button"
                onClick={() => open("month", first)}
                className={cn("kr:cursor-pointer kr:self-start kr:rounded-md kr:p-1.5 kr:text-left kr:hover:bg-surface-2", focusRing)}
              >
                <span className="kr:mb-1 kr:block kr:text-[0.8125rem] kr:font-medium kr:capitalize">{monthName.format(first)}</span>
                <span className="kr:sr-only">{year}, {eventCount(count)}</span>
                <span aria-hidden className="kr:grid kr:grid-cols-7 kr:text-center kr:text-[0.625rem] kr:leading-4 kr:tabular-nums">
                  {days.map((day) => {
                    const key = dayKey(day);
                    if (day.getMonth() !== m) return <span key={key} />;
                    return (
                      <span key={key} className={cn("kr:rounded-sm", key === today ? "kr:bg-accent kr:font-semibold kr:text-accent-fg" : byDay.has(key) ? "kr:font-bold kr:text-accent" : "kr:text-muted")}>
                        {day.getDate()}
                      </span>
                    );
                  })}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
