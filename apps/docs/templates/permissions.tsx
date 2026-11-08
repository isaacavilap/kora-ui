"use client";
import { useState } from "react";
import { Avatar, Badge, Button, Checkbox, Dialog, DialogContent, DropdownMenuItem, Field, Fieldset, Form, Inline, PageHeader, Select, Tabs, TabsContent, TabsList, TabsTrigger, Text, Toaster, toast } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { Check, Minus } from "lucide-react";
import { companies } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const roles = ["Owner", "Manager", "Staff", "Viewer"] as const;
type Role = (typeof roles)[number];
type Capability = { id: string; label: string; allowed: Role[] };

const capabilities: Capability[] = [
  { id: "view", label: "See records and reports", allowed: ["Owner", "Manager", "Staff", "Viewer"] },
  { id: "create", label: "Create and edit records", allowed: ["Owner", "Manager", "Staff"] },
  { id: "approve", label: "Approve requests", allowed: ["Owner", "Manager"] },
  { id: "export", label: "Export data", allowed: ["Owner", "Manager"] },
  { id: "delete", label: "Delete records", allowed: ["Owner", "Manager"] },
  { id: "people", label: "Manage people and access", allowed: ["Owner"] },
  { id: "settings", label: "Change company settings", allowed: ["Owner"] },
];

const matrix: DataTableColumn<Capability>[] = [
  { id: "label", header: "Permission", accessor: "label" },
  ...roles.map((role): DataTableColumn<Capability> => ({
    id: role,
    header: role,
    accessor: (c) => (c.allowed.includes(role) ? "Yes" : "No"),
    cell: (c) => c.allowed.includes(role)
      ? <Text inline tone="success" className="inline-flex items-center gap-1"><Check aria-hidden className="size-4" /><Text inline className="sr-only">Allowed</Text></Text>
      : <Text inline tone="muted" className="inline-flex items-center gap-1"><Minus aria-hidden className="size-4" /><Text inline className="sr-only">Not allowed</Text></Text>,
  })),
];

type Person = { id: string; name: string; role: Role; companyIds: string[] };
const initialPeople: Person[] = [
  { id: "1", name: "Marta Ríos", role: "Owner", companyIds: companies.map((c) => c.id) },
  { id: "2", name: "Tomás Vega", role: "Manager", companyIds: ["coffee", "roasters"] },
  { id: "3", name: "Lucía Herrera", role: "Staff", companyIds: ["coffee"] },
  { id: "4", name: "Diego Paredes", role: "Staff", companyIds: ["logistics"] },
  { id: "5", name: "Ana Castillo", role: "Viewer", companyIds: ["roasters", "logistics"] },
];
const nameOf = (id: string) => companies.find((c) => c.id === id)!.name;

const peopleColumns: DataTableColumn<Person>[] = [
  { id: "name", header: "Person", accessor: "name", sortable: true, cell: (p) => <Inline wrap={false}><Avatar name={p.name} size={24} />{p.name}</Inline> },
  { id: "role", header: "Role", accessor: "role", sortable: true, filter: { type: "select" } },
  {
    id: "companies",
    header: "Companies",
    accessor: (p) => p.companyIds.map(nameOf).join(", "),
    cell: (p) => <Inline gap="xs" align="stretch">{p.companyIds.map((id) => <Badge key={id}>{nameOf(id)}</Badge>)}</Inline>,
  },
];

export default function Template() {
  const [people, setPeople] = useState(initialPeople);
  const [editing, setEditing] = useState<Person>();

  return (
    <DemoShell page="permissions" title="Permissions">
      <Toaster />
      <PageHeader title="Permissions" description="A role sets what someone can do. Their company list sets where they can do it." />
      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>
        <TabsContent value="roles" className="mt-3">
          <DataTable columns={matrix} data={capabilities} getRowId={(c) => c.id} />
        </TabsContent>
        <TabsContent value="people" className="mt-3">
          <DataTable
            columns={peopleColumns}
            data={people}
            getRowId={(p) => p.id}
            searchable
            searchPlaceholder="Search people"
            rowActions={(p) => <DropdownMenuItem onSelect={() => setEditing(p)}>Change access</DropdownMenuItem>}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(undefined)}>
        <DialogContent title={`Change access for ${editing?.name}`}>
          {editing && (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                setPeople(people.map((p) => (p.id === editing.id ? editing : p)));
                setEditing(undefined);
                toast.success("Access changed.");
              }}
            >
              <Field label="Role">
                <Select value={editing.role} onValueChange={(role) => setEditing({ ...editing, role: role as Role })} options={roles.map((r) => ({ value: r, label: r }))} />
              </Field>
              <Fieldset legend="Companies" className="gap-2 [&>legend]:mb-1">
                {companies.map((company) => (
                  <Checkbox
                    key={company.id}
                    label={company.name}
                    checked={editing.companyIds.includes(company.id)}
                    onCheckedChange={(on) => setEditing({ ...editing, companyIds: on ? [...editing.companyIds, company.id] : editing.companyIds.filter((id) => id !== company.id) })}
                  />
                ))}
              </Fieldset>
              <Button type="submit" disabled={editing.companyIds.length === 0} className="justify-self-end max-md:w-full">Change access</Button>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </DemoShell>
  );
}
