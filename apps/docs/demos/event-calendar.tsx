"use client";
import { useMemo } from "react";
import { EventCalendar, toast, Toaster } from "kora-ui";

export default function Demo() {
  const events = useMemo(() => {
    const now = new Date();
    const on = (day: number) => new Date(now.getFullYear(), now.getMonth(), day);
    return [
      { id: "1", title: "Fridge technician", date: on(now.getDate()), time: "09:30", endTime: "11:00", tone: "warning" as const },
      { id: "4", title: "Supply delivery", date: on(now.getDate()), time: "10:00" },
      { id: "5", title: "Holiday hours", date: on(now.getDate()) },
      { id: "2", title: "Health inspection", date: on(12), time: "10:00", tone: "danger" as const },
      { id: "3", title: "Team training", date: on(20), time: "08:30", tone: "success" as const },
    ];
  }, []);
  return (
    <>
      <Toaster />
      <EventCalendar events={events} onEventClick={(event) => toast(String(event.title))} />
    </>
  );
}
