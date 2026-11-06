"use client";
import { useMemo } from "react";
import { EventCalendar, toast, Toaster } from "kora-ui";

export default function Demo() {
  const events = useMemo(() => {
    const now = new Date();
    const on = (day: number) => new Date(now.getFullYear(), now.getMonth(), day);
    return [
      { id: "1", title: "Fridge technician", date: on(now.getDate()), time: "09:30", tone: "warning" as const },
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
