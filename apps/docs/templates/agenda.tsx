"use client";
import { useMemo, useState } from "react";
import { Button, DescriptionList, Dialog, DialogContent, EventCalendar, Field, Input, PageHeader, Select, Sheet, SheetContent, Toaster, toast, type CalendarEvent } from "kora-ui";
import { Plus } from "lucide-react";
import { DemoShell } from "./shell";

type Visit = CalendarEvent & { title: string; location: string };
const locations = ["Downtown", "Airport", "Riverside"].map((l) => ({ value: l, label: l }));

function sampleVisits(): Visit[] {
  const now = new Date();
  const on = (day: number) => new Date(now.getFullYear(), now.getMonth(), day);
  return [
    { id: "1", title: "Fridge technician", date: on(now.getDate()), time: "09:30", tone: "warning", location: "Downtown" },
    { id: "2", title: "Supply delivery", date: on(now.getDate()), time: "13:00", location: "Airport" },
    { id: "3", title: "Health inspection", date: on(12), time: "10:00", tone: "danger", location: "Riverside" },
    { id: "4", title: "Grinder service", date: on(8), time: "15:00", location: "Riverside" },
    { id: "5", title: "Team training", date: on(20), time: "08:30", tone: "success", location: "Downtown" },
    { id: "6", title: "Register install", date: on(24), time: "11:00", location: "Airport" },
    { id: "7", title: "Monthly review", date: on(24), time: "16:00", location: "Downtown" },
  ];
}

const toInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Template() {
  const initial = useMemo(sampleVisits, []);
  const [visits, setVisits] = useState(initial);
  const [viewing, setViewing] = useState<Visit>();
  const [adding, setAdding] = useState<string>();
  const [location, setLocation] = useState("Downtown");

  return (
    <DemoShell page="agenda" title="Agenda">
      <Toaster />
      <PageHeader
        title="Agenda"
        description="Visits and deliveries at every location."
        actions={<Button onClick={() => setAdding(toInput(new Date()))} className="max-md:w-full"><Plus aria-hidden />Schedule a visit</Button>}
      />
      <EventCalendar events={visits} onEventClick={(event) => setViewing(event as Visit)} onDayClick={(day) => setAdding(toInput(day))} />

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(undefined)}>
        <SheetContent title={viewing?.title} description={viewing?.location}>
          {viewing && (
            <div className="grid gap-4">
              <DescriptionList
                items={[
                  { label: "Date", value: new Date(viewing.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Time", value: viewing.time },
                  { label: "Location", value: viewing.location },
                ]}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  setVisits(visits.filter((v) => v.id !== viewing.id));
                  setViewing(undefined);
                  toast.success("Visit canceled.");
                }}
              >
                Cancel visit
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(adding)} onOpenChange={(open) => !open && setAdding(undefined)}>
        <DialogContent title="Schedule a visit" description="It appears in the agenda of the location.">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              setVisits([...visits, { id: String(Date.now()), title: String(form.get("title")), date: String(form.get("date")), time: String(form.get("time")), location }]);
              setAdding(undefined);
              toast.success("Visit scheduled.");
            }}
          >
            <Field label="What is the visit for?"><Input name="title" required /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><Input name="date" type="date" defaultValue={adding} required /></Field>
              <Field label="Time"><Input name="time" type="time" defaultValue="09:00" required /></Field>
            </div>
            <Field label="Location"><Select value={location} onValueChange={setLocation} options={locations} /></Field>
            <Button type="submit" className="justify-self-end max-md:w-full">Schedule visit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </DemoShell>
  );
}
