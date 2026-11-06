"use client";
import { useState } from "react";
import { Alert, Button, Card, CardContent, CardHeader, Combobox, DocumentList, Field, FileDropzone, Grid, Input, PageHeader, Select, Switch, Textarea, Toaster, toast, useSubmit, type DocumentItem } from "kora-ui";
import { Plus, Trash2 } from "lucide-react";
import { money, wait } from "@/lib/demo-data";
import { DemoShell } from "./shell";

type Line = { key: number; item: string; quantity: string; price: string };
const people = ["Tomás Vega", "Lucía Herrera", "Diego Paredes", "Ana Castillo"].map((p) => ({ value: p, label: p }));
const priorities = ["Low", "Normal", "High"].map((p) => ({ value: p, label: p }));
const locations = ["Downtown", "Airport", "Riverside"].map((l) => ({ value: l, label: l }));

export default function Template() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [urgent, setUrgent] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [lines, setLines] = useState<Line[]>([{ key: 1, item: "", quantity: "1", price: "" }]);
  const [missing, setMissing] = useState<string[]>([]);
  const save = useSubmit(async () => {
    await wait();
    toast.success("Request created.");
  }, "Could not save the request. Check your connection and try again.");

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0), 0);
  const setLine = (key: number, change: Partial<Line>) => setLines(lines.map((l) => (l.key === key ? { ...l, ...change } : l)));

  return (
    <DemoShell page="record-form" title="New request">
      <Toaster />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const gaps = [!title.trim() && "Title", !location && "Location"].filter(Boolean) as string[];
          setMissing(gaps);
          if (gaps.length === 0) void save.run();
        }}
      >
        <PageHeader
          back={{ href: "/preview/workflow", label: "Requests" }}
          title="New request"
          description="Fields with * are required."
          actions={<Button type="submit" loading={save.pending} className="max-md:w-full">Create request</Button>}
        />
        {missing.length > 0 && <Alert tone="danger" title="Some fields are missing" className="mb-4">Complete these fields: {missing.join(", ")}.</Alert>}
        {save.error && <Alert tone="danger" className="mb-4">{save.error}</Alert>}
        <Grid cols="2fr 1fr">
          <div className="grid min-w-0 content-start gap-[var(--kora-gap)]">
            <Card>
              <CardHeader title="What is needed" />
              <CardContent className="grid gap-4">
                <Field label="Title" required error={missing.includes("Title") ? "Enter a title." : undefined}>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <Field label="Description" hint="Include anything the person doing the work should know.">
                  <Textarea rows={4} />
                </Field>
              </CardContent>
            </Card>
            <Card>
              <CardHeader
                title="Items"
                actions={<Button type="button" variant="secondary" size="sm" onClick={() => setLines([...lines, { key: Date.now(), item: "", quantity: "1", price: "" }])}><Plus aria-hidden />Add item</Button>}
              />
              <CardContent className="grid gap-3">
                {lines.map((line, i) => (
                  <fieldset key={line.key} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 md:grid-cols-[3fr_1fr_1fr_auto]">
                    <legend className="sr-only">Item {i + 1}</legend>
                    <Field label="Item" className="col-span-3 md:col-span-1"><Input value={line.item} onChange={(e) => setLine(line.key, { item: e.target.value })} /></Field>
                    <Field label="Qty"><Input type="number" min="1" inputMode="numeric" value={line.quantity} onChange={(e) => setLine(line.key, { quantity: e.target.value })} /></Field>
                    <Field label="Price"><Input type="number" min="0" step="0.01" inputMode="decimal" value={line.price} onChange={(e) => setLine(line.key, { price: e.target.value })} /></Field>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove item ${i + 1}`} disabled={lines.length === 1} onClick={() => setLines(lines.filter((l) => l.key !== line.key))}><Trash2 aria-hidden /></Button>
                  </fieldset>
                ))}
                <p className="text-right text-sm font-medium tabular-nums">Total: {money(total)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Documents" />
              <CardContent className="grid gap-3">
                <Field label="Add documents">
                  <FileDropzone multiple hint="PDF or images, up to 10 MB" onFiles={(files) => setDocuments([...documents, ...files.map((f) => ({ id: `${f.name}-${f.lastModified}`, name: f.name }))])} />
                </Field>
                {documents.length > 0 && <DocumentList documents={documents} onRemove={(doc) => setDocuments(documents.filter((d) => d.id !== doc.id))} />}
              </CardContent>
            </Card>
          </div>
          <Card className="self-start">
            <CardHeader title="Assignment" />
            <CardContent className="grid gap-4">
              <Field label="Location" required error={missing.includes("Location") ? "Choose a location." : undefined}>
                <Select value={location} onValueChange={setLocation} options={locations} />
              </Field>
              <Field label="Assigned to" hint="You can assign it later.">
                <Combobox options={people} value={assignee} onChange={setAssignee} />
              </Field>
              <Field label="Priority">
                <Select value={priority} onValueChange={setPriority} options={priorities} />
              </Field>
              <Switch label="Notify the assigned person" checked={urgent} onCheckedChange={setUrgent} />
            </CardContent>
          </Card>
        </Grid>
      </form>
    </DemoShell>
  );
}
