"use client";
import { useMemo, useState } from "react";
import { DescriptionList, EventCalendar, PageHeader, Sheet, SheetContent, type CalendarEvent, type CalendarPerson } from "kora-ui";
import { DemoShell } from "./shell";

const people: CalendarPerson[] = [
  { id: "marta", name: "Marta Ríos" },
  { id: "tomas", name: "Tomás Vega" },
  { id: "lucia", name: "Lucía Herrera" },
  { id: "diego", name: "Diego Paredes" },
];

type Visit = CalendarEvent & { title: string; customer: string };

function sampleVisits(): Visit[] {
  const now = new Date();
  const visit = (id: string, personId: string, title: string, customer: string, time: string, endTime: string, tone?: CalendarEvent["tone"]): Visit => ({ id, personId, title, customer, date: now, time, endTime, tone });
  return [
    visit("1", "marta", "Consultation", "Ana Castillo", "09:00", "10:00"),
    visit("2", "marta", "Follow-up", "Hugo Navarro", "11:30", "12:00", "success"),
    visit("3", "marta", "Consultation", "Elena Soto", "14:00", "15:30"),
    visit("4", "tomas", "Installation", "Pablo Mora", "08:30", "11:00", "warning"),
    visit("5", "tomas", "Inspection", "Clara Méndez", "13:00", "14:00"),
    visit("6", "lucia", "Consultation", "Iván Quintero", "10:00", "11:00"),
    visit("7", "lucia", "Urgent repair", "Marta Ríos", "10:30", "12:00", "danger"),
    visit("8", "lucia", "Follow-up", "Raúl Ibarra", "16:00", "16:30", "success"),
    visit("9", "diego", "Training", "Whole team", "09:30", "12:30"),
    { id: "10", title: "Waiting for a person", customer: "Sofía Delgado", date: now, time: "15:00", endTime: "16:00" },
  ];
}

export default function Template() {
  const visits = useMemo(sampleVisits, []);
  const [viewing, setViewing] = useState<Visit>();
  return (
    <DemoShell page="agenda" title="Team agenda">
      <PageHeader title="Team agenda" description="What each person has today." />
      <EventCalendar events={visits} people={people} defaultView="day" onEventClick={(event) => setViewing(event as Visit)} />
      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(undefined)}>
        <SheetContent title={viewing?.title} description={viewing?.customer}>
          {viewing && (
            <DescriptionList
              items={[
                { label: "With", value: people.find((person) => person.id === viewing.personId)?.name ?? "Unassigned" },
                { label: "Time", value: `${viewing.time} to ${viewing.endTime}` },
              ]}
            />
          )}
        </SheetContent>
      </Sheet>
    </DemoShell>
  );
}
