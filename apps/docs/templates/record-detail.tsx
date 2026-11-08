"use client";
import { useState } from "react";
import { Badge, Button, Card, CardContent, CardHeader, ConfirmDialog, DescriptionList, DocumentList, Field, FileDropzone, Form, Grid, KoraLink, PageHeader, Stack, Stepper, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Timeline, Toaster, toast, type DocumentItem, type TimelineEvent } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { money, requests, stages, wait } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const request = requests[1]!;
type Line = { id: string; item: string; quantity: number; price: number };
const lines: Line[] = [
  { id: "1", item: "Technician visit", quantity: 1, price: 180 },
  { id: "2", item: "Compressor part", quantity: 1, price: 420 },
  { id: "3", item: "Refrigerant", quantity: 2, price: 65 },
];

const lineColumns: DataTableColumn<Line>[] = [
  { id: "item", header: "Item", accessor: "item", footer: () => "Total" },
  { id: "quantity", header: "Qty", accessor: "quantity", align: "right" },
  { id: "price", header: "Price", accessor: "price", align: "right", cell: (l) => money(l.price) },
  { id: "total", header: "Total", accessor: (l) => l.quantity * l.price, align: "right", cell: (l) => money(l.quantity * l.price), footer: (rows) => money(rows.reduce((sum, l) => sum + l.quantity * l.price, 0)) },
];

const initialHistory: TimelineEvent[] = [
  { id: "approved", title: "Approved by Marta Ríos", time: "Oct 27, 11:02", tone: "success" },
  { id: "assigned", title: `Assigned to ${request.assignee}`, time: "Oct 26, 16:20" },
  { id: "created", title: `Opened by ${request.requester}`, description: "From the Downtown site.", time: "Oct 26, 16:18" },
];

export default function Template() {
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState(initialHistory);
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: "1", name: "quote-compressor.pdf", meta: "240 KB, added Oct 26" },
    { id: "2", name: "fridge-photo.jpg", meta: "1.2 MB, added Oct 26" },
  ]);
  const [confirming, setConfirming] = useState(false);
  const next = stages[step + 1];
  const action = stages[step]!.action;

  return (
    <DemoShell page="record-detail" title={request.id}>
      <Toaster />
      <PageHeader
        back={{ href: "/preview/workflow", label: "Requests" }}
        title={`${request.id}: ${request.title}`}
        description={`Opened on ${request.date} by ${request.requester}`}
        status={<Badge tone={step === 3 ? "success" : "accent"}>{stages[step]!.label}</Badge>}
        actions={
          <>
            <Button asChild variant="secondary" className="max-md:w-full"><KoraLink href="/preview/record-form">Edit</KoraLink></Button>
            {action && <Button onClick={() => setConfirming(true)} className="max-md:w-full">{action}</Button>}
          </>
        }
      />
      <Card className="mb-4">
        <CardContent className="pt-4">
          <Stepper steps={stages.map((s) => s.label)} current={step} />
        </CardContent>
      </Card>
      <Grid cols="2fr 1fr">
        <Tabs defaultValue="summary" className="min-w-0">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-3 grid gap-[var(--kora-gap)]">
            <DataTable columns={lineColumns} data={lines} getRowId={(l) => l.id} />
            <Card>
              <CardHeader title="Notes" />
              <CardContent>
                <Form className="gap-3" onSubmit={(e) => { e.preventDefault(); toast.success("Note saved."); }}>
                  <Field label="Only your team sees this">
                    <Textarea defaultValue="The fridge holds temperature until noon. Plan the visit before the morning delivery." />
                  </Field>
                  <Button type="submit" variant="secondary" className="justify-self-end max-md:w-full">Save note</Button>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documents" className="mt-3">
            <Card>
              <CardContent className="grid gap-3 pt-4">
                <Field label="Add documents">
                  <FileDropzone
                    multiple
                    hint="PDF or images, up to 10 MB"
                    onFiles={(files) => {
                      setDocuments([...documents, ...files.map((f) => ({ id: `${f.name}-${f.lastModified}`, name: f.name, meta: `${Math.max(1, Math.round(f.size / 1024))} KB, added just now` }))]);
                      toast.success(files.length === 1 ? "Document added." : `${files.length} documents added.`);
                    }}
                  />
                </Field>
                <DocumentList documents={documents} onRemove={(doc) => setDocuments(documents.filter((d) => d.id !== doc.id))} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-3">
            <Card><CardContent className="pt-4"><Timeline events={history} /></CardContent></Card>
          </TabsContent>
        </Tabs>
        <Stack>
          <Card>
            <CardHeader title="Details" />
            <CardContent>
              <DescriptionList
                items={[
                  { label: "Assigned to", value: request.assignee },
                  { label: "Location", value: request.location },
                  { label: "Priority", value: request.priority },
                  { label: "Due", value: "November 4, 2026" },
                ]}
              />
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`${action ?? "Move"} this request?`}
        description={next && `This moves it to ${next.label}.`}
        confirmLabel={action}
        onConfirm={async () => {
          await wait();
          setHistory([{ id: `moved-${step}`, title: `Moved to ${next!.label}`, time: "Just now", tone: "accent" }, ...history]);
          setStep(step + 1);
          toast.success(`Moved to ${next!.label}.`);
        }}
      />
    </DemoShell>
  );
}
