"use client";
import { useState } from "react";
import { Button, Card, CardContent, CardFooter, CardHeader, ConfirmDialog, Dialog, DialogContent, DropdownMenuItem, Field, Input, PageHeader, Select, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Toaster, toast } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { Plus } from "lucide-react";
import { wait } from "@/lib/demo-data";
import { DemoShell } from "./shell";

type Site = { id: string; name: string; city: string; phone: string };
const initialSites: Site[] = [
  { id: "1", name: "Downtown", city: "Panama City", phone: "+507 6000-0001" },
  { id: "2", name: "Airport", city: "Tocumen", phone: "+507 6000-0002" },
  { id: "3", name: "Riverside", city: "David", phone: "+507 6000-0003" },
];

const columns: DataTableColumn<Site>[] = [
  { id: "name", header: "Name", accessor: "name", sortable: true },
  { id: "city", header: "City", accessor: "city", sortable: true },
  { id: "phone", header: "Phone", accessor: "phone" },
];

const alerts = [
  { id: "new", label: "New requests", description: "When someone opens a request." },
  { id: "due", label: "Past due work", description: "Once a day, while anything is past due." },
  { id: "report", label: "Monthly report", description: "On the first day of each month." },
];

export default function Template() {
  const [sites, setSites] = useState(initialSites);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Site>();
  const [timezone, setTimezone] = useState("America/Panama");
  const [currency, setCurrency] = useState("USD");
  const [on, setOn] = useState<Record<string, boolean>>({ new: true, due: true, report: false });

  return (
    <DemoShell page="workspace-settings" title="Settings">
      <Toaster />
      <PageHeader title="Settings" description="Applies to everyone in this workspace." />
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-3 max-w-2xl">
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved."); }}>
            <Card>
              <CardHeader title="Company" />
              <CardContent className="grid gap-4">
                <Field label="Name"><Input defaultValue="Kora Coffee" /></Field>
                <Field label="Time zone">
                  <Select value={timezone} onValueChange={setTimezone} options={[{ value: "America/Panama", label: "Panama" }, { value: "America/Bogota", label: "Bogotá" }, { value: "America/Mexico_City", label: "Mexico City" }]} />
                </Field>
                <Field label="Currency" hint="New records use this currency.">
                  <Select value={currency} onValueChange={setCurrency} options={[{ value: "USD", label: "US dollar" }, { value: "EUR", label: "Euro" }]} />
                </Field>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" className="max-md:w-full">Save changes</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="locations" className="mt-3">
          <DataTable
            columns={columns}
            data={sites}
            getRowId={(s) => s.id}
            toolbarActions={<Button onClick={() => setAdding(true)}><Plus aria-hidden />Add location</Button>}
            rowActions={(s) => <DropdownMenuItem onSelect={() => setRemoving(s)}>Remove</DropdownMenuItem>}
          />
        </TabsContent>
        <TabsContent value="notifications" className="mt-3 max-w-2xl">
          <Card>
            <CardHeader title="Email me about" />
            <CardContent className="grid gap-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{alert.label}</p>
                    <p className="text-[0.8125rem] text-[var(--kora-muted)]">{alert.description}</p>
                  </div>
                  <Switch aria-label={alert.label} checked={on[alert.id]} onCheckedChange={(value) => setOn({ ...on, [alert.id]: value })} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent title="Add location">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              setSites([...sites, { id: String(Date.now()), name: String(form.get("name")), city: String(form.get("city")), phone: String(form.get("phone")) }]);
              setAdding(false);
              toast.success("Location added.");
            }}
          >
            <Field label="Name"><Input name="name" required /></Field>
            <Field label="City"><Input name="city" required /></Field>
            <Field label="Phone"><Input name="phone" type="tel" /></Field>
            <Button type="submit" className="justify-self-end max-md:w-full">Add location</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        danger
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(undefined)}
        title={`Remove ${removing?.name}?`}
        description="Its records stay, but no one can choose this location again."
        confirmLabel="Remove location"
        onConfirm={async () => {
          await wait();
          setSites(sites.filter((s) => s.id !== removing!.id));
          toast.success("Location removed.");
        }}
      />
    </DemoShell>
  );
}
