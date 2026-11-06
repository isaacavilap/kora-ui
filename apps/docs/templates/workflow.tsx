"use client";
import { useState } from "react";
import { Badge, Button, ConfirmDialog, DropdownMenuItem, PageHeader, Tabs, TabsContent, TabsList, TabsTrigger, Toaster, toast } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { Plus } from "lucide-react";
import { money, requests as seed, stages, wait, type Stage, type WorkRequest } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const priorityTone = { Low: "neutral", Normal: "info", High: "danger" } as const;

const columns: DataTableColumn<WorkRequest>[] = [
  { id: "id", header: "Request", accessor: "id", sortable: true, cell: (r) => <span className="font-medium">{r.id}</span> },
  { id: "title", header: "Title", accessor: "title", sortable: true },
  { id: "assignee", header: "Assigned to", accessor: "assignee", filter: { type: "select" } },
  { id: "location", header: "Location", accessor: "location", filter: { type: "select" }, hideOnMobile: true },
  { id: "priority", header: "Priority", accessor: "priority", filter: { type: "select" }, cell: (r) => <Badge tone={priorityTone[r.priority]}>{r.priority}</Badge> },
  { id: "date", header: "Opened", accessor: "date", sortable: true, filter: { type: "date" }, hideOnMobile: true },
  { id: "amount", header: "Amount", accessor: "amount", sortable: true, align: "right", cell: (r) => money(r.amount) },
];

export default function Template() {
  const [requests, setRequests] = useState(seed);
  const [moving, setMoving] = useState<WorkRequest[]>();
  const stageOf = (value: Stage) => stages.find((s) => s.value === value)!;
  const current = moving?.[0] && stageOf(moving[0].stage);

  return (
    <DemoShell page="workflow" title="Requests">
      <Toaster />
      <PageHeader
        title="Requests"
        description="Each stage has its own list, and each request has one next step."
        actions={<Button asChild className="max-md:w-full"><a href="/preview/record-form"><Plus aria-hidden />New request</a></Button>}
      />
      <Tabs defaultValue="new">
        <TabsList>
          {stages.map((stage) => (
            <TabsTrigger key={stage.value} value={stage.value}>
              {stage.label}
              <Badge className="ml-1.5">{requests.filter((r) => r.stage === stage.value).length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        {stages.map((stage) => (
          <TabsContent key={stage.value} value={stage.value} className="mt-3">
            <DataTable
              columns={columns}
              data={requests.filter((r) => r.stage === stage.value)}
              getRowId={(r) => r.id}
              searchable
              searchPlaceholder="Search requests"
              columnToggle
              exportFilename={`requests-${stage.value}`}
              selectable={Boolean(stage.next)}
              empty={`No requests are ${stage.label.toLowerCase()}.`}
              onRowClick={() => { window.location.href = "/preview/record-detail"; }}
              bulkActions={stage.action ? (rows, clear) => <Button size="sm" onClick={() => { setMoving(rows); clear(); }}>{stage.action}</Button> : undefined}
              rowActions={(r) => (
                <>
                  <DropdownMenuItem asChild><a href="/preview/record-detail">Open</a></DropdownMenuItem>
                  {stage.action && <DropdownMenuItem onSelect={() => setMoving([r])}>{stage.action}</DropdownMenuItem>}
                </>
              )}
            />
          </TabsContent>
        ))}
      </Tabs>

      <ConfirmDialog
        open={Boolean(moving)}
        onOpenChange={(open) => !open && setMoving(undefined)}
        title={`${current?.action ?? "Move"} ${moving?.length === 1 ? moving[0]!.id : `${moving?.length ?? 0} requests`}?`}
        description={current?.next && `This moves it to ${stageOf(current.next).label}.`}
        confirmLabel={current?.action}
        onConfirm={async () => {
          await wait();
          const ids = new Set(moving!.map((r) => r.id));
          setRequests(requests.map((r) => (ids.has(r.id) ? { ...r, stage: current!.next! } : r)));
          toast.success(`Moved to ${stageOf(current!.next!).label}.`);
        }}
      />
    </DemoShell>
  );
}
