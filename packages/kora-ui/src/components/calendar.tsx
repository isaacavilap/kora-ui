import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, focusRing } from "./button";
import type { Tone } from "./display";
import { cn, useKora, useLabels } from "./provider";

export type CalendarEvent = {
  id: string;
  title: ReactNode;
  /** A Date, or a "YYYY-MM-DD" string read as a local day. */
  date: Date | string;
  time?: string;
  tone?: Tone;
};

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

/** Month view with events. On phones it becomes a list of the days that have events. */
export function EventCalendar({ events, defaultMonth, onEventClick, onDayClick, className }: {
  events: CalendarEvent[];
  defaultMonth?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  /** Lets people add an event on a day. */
  onDayClick?: (day: Date) => void;
  className?: string;
}) {
  const t = useLabels();
  const { locale } = useKora();
  const [visible, setVisible] = useState(() => defaultMonth ?? new Date());
  const [today, setToday] = useState<string>();
  // Read after mount, because the server may be in another time zone.
  useEffect(() => setToday(dayKey(new Date())), []);

  const year = visible.getFullYear();
  const month = visible.getMonth();
  const weekStart = locale === "es" ? 1 : 0;
  const weeks = useMemo(() => monthWeeks(year, month, weekStart), [year, month, weekStart]);
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dayKey(toDate(event.date));
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visible);
  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const monthDays = weeks.flat().filter((d) => d.getMonth() === month && byDay.has(dayKey(d)));
  const eventClass = "kr:flex kr:w-full kr:cursor-pointer kr:items-center kr:gap-1.5 kr:rounded-sm kr:text-left kr:hover:bg-surface-2";
  const eventDot = (event: CalendarEvent) => <span aria-hidden className={cn("kr:size-2 kr:shrink-0 kr:rounded-full", (event.tone && dot[event.tone]) ?? "kr:bg-accent")} />;

  return (
    <div className={cn("kr:min-w-0 kr:overflow-hidden kr:rounded-lg kr:border kr:border-line kr:bg-surface kr:text-fg", className)}>
      <div className="kr:flex kr:items-center kr:gap-1 kr:border-b kr:border-line kr:p-2">
        <h2 aria-live="polite" className="kr:mr-auto kr:pl-2 kr:text-sm kr:font-semibold kr:capitalize">{title}</h2>
        <Button variant="ghost" size="sm" onClick={() => setVisible(new Date())}>{t.today}</Button>
        <Button variant="ghost" size="icon" aria-label={t.previous} onClick={() => setVisible(new Date(year, month - 1, 1))}><ChevronLeft aria-hidden /></Button>
        <Button variant="ghost" size="icon" aria-label={t.next} onClick={() => setVisible(new Date(year, month + 1, 1))}><ChevronRight aria-hidden /></Button>
      </div>

      {/* Phone list */}
      <div className="kr:md:hidden">
        {monthDays.length === 0 && <p className="kr:p-6 kr:text-center kr:text-sm kr:text-muted">{t.noEvents}</p>}
        <ul className="kr:divide-y kr:divide-line">
          {monthDays.map((day) => (
            <li key={dayKey(day)} className="kr:p-3">
              <p className={cn("kr:mb-1.5 kr:text-[0.8125rem] kr:font-medium kr:capitalize", dayKey(day) === today ? "kr:text-accent" : "kr:text-muted")}>{dayLabel.format(day)}</p>
              <ul className="kr:space-y-0.5">
                {byDay.get(dayKey(day))!.map((event) => (
                  <li key={event.id}>
                    <button type="button" onClick={() => onEventClick?.(event)} className={cn(eventClass, "kr:min-h-11 kr:px-1 kr:text-sm", focusRing)}>
                      {eventDot(event)}
                      <span className="kr:min-w-0 kr:flex-1 kr:truncate">{event.title}</span>
                      {event.time && <span className="kr:shrink-0 kr:text-muted kr:tabular-nums">{event.time}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Month grid */}
      <table className="kr:hidden kr:w-full kr:table-fixed kr:border-collapse kr:md:table">
        <caption className="kr:sr-only">{title}</caption>
        <thead>
          <tr>
            {weeks[0]!.map((d) => (
              <th key={d.getDay()} scope="col" className="kr:border-b kr:border-line kr:py-1.5 kr:text-xs kr:font-normal kr:capitalize kr:text-muted">{weekday.format(d)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={dayKey(week[0]!)}>
              {week.map((day) => {
                const key = dayKey(day);
                const list = byDay.get(key) ?? [];
                const outside = day.getMonth() !== month;
                const number = (
                  <span className={cn("kr:inline-flex kr:size-6 kr:items-center kr:justify-center kr:rounded-full kr:text-xs kr:tabular-nums", key === today ? "kr:bg-accent kr:font-medium kr:text-accent-fg" : outside && "kr:text-muted")}>
                    {day.getDate()}
                  </span>
                );
                return (
                  <td key={key} className={cn("kr:h-24 kr:border-b kr:border-l kr:border-line kr:p-1 kr:align-top kr:first:border-l-0", outside && "kr:bg-surface-2/50")}>
                    {onDayClick ? (
                      <button type="button" aria-label={dayLabel.format(day)} onClick={() => onDayClick(day)} className={cn("kr:cursor-pointer kr:rounded-full", focusRing)}>{number}</button>
                    ) : (
                      number
                    )}
                    <ul className="kr:mt-0.5 kr:space-y-0.5">
                      {list.slice(0, 3).map((event) => (
                        <li key={event.id}>
                          <button type="button" onClick={() => onEventClick?.(event)} className={cn(eventClass, "kr:px-1 kr:py-0.5 kr:text-xs", focusRing)}>
                            {eventDot(event)}
                            <span className="kr:min-w-0 kr:flex-1 kr:truncate">{event.title}</span>
                          </button>
                        </li>
                      ))}
                      {list.length > 3 && <li className="kr:px-1 kr:text-xs kr:text-muted">+{list.length - 3}</li>}
                    </ul>
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
