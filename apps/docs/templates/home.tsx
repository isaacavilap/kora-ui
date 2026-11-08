"use client";
import { AlertList, Badge, Button, Card, CardContent, CardHeader, Grid, Heading, KoraLink, KpiCard, PageHeader, QuickActions, Stack, StageCounters, Timeline } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { CalendarPlus, FilePlus, FileText, Package } from "lucide-react";
import { money, requests, stages, stageTone, type WorkRequest } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const columns: DataTableColumn<WorkRequest>[] = [
  { id: "title", header: "Request", accessor: "title" },
  { id: "assignee", header: "Assigned to", accessor: "assignee", hideOnMobile: true },
  { id: "stage", header: "Stage", accessor: "stage", cell: (r) => <Badge tone={stageTone[r.stage]}>{stages.find((s) => s.value === r.stage)!.label}</Badge> },
  { id: "amount", header: "Amount", accessor: "amount", align: "right", cell: (r) => money(r.amount) },
];

const open = requests.filter((r) => r.stage !== "done");

export default function Template() {
  return (
    <DemoShell page="home" title="Today">
      <PageHeader
        title="Today"
        description="What is moving, what is stuck, and what comes next."
        actions={<Button asChild className="max-md:w-full"><KoraLink href="/preview/record-form">New request</KoraLink></Button>}
      />
      <Stack>
        <StageCounters
          stages={stages.map((stage) => ({
            id: stage.value,
            label: stage.label,
            count: requests.filter((r) => r.stage === stage.value).length,
            href: "/preview/workflow",
            alert: stage.value === "new",
          }))}
        />
        <Grid min="10.5rem">
          <KpiCard label="Open requests" value={open.length} delta={-6} invertDelta deltaLabel="vs last week" />
          <KpiCard label="Finished this week" value="14" delta={12} deltaLabel="vs last week" trend={[8, 9, 11, 10, 12, 12, 14]} />
          <KpiCard label="Average time to finish" value="2.4 days" delta={-8} invertDelta deltaLabel="vs last week" />
          <KpiCard label="Spent this month" value={money(18240)} delta={3.1} invertDelta deltaLabel="vs last month" />
        </Grid>
        <Grid cols="2fr 1fr">
          <Card>
            <CardHeader title="Needs attention" />
            <CardContent>
              <AlertList
                alerts={[
                  { id: "1", tone: "danger", title: "3 requests are past due", description: "The oldest one has waited for 6 days.", action: { label: "Review them", href: "/preview/workflow" } },
                  { id: "2", tone: "warning", title: "Health permit expires in 12 days", action: { label: "Open request", href: "/preview/record-detail" } },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Scheduled today" />
            <CardContent>
              <Timeline
                events={[
                  { id: "1", title: "Fridge technician", description: "Downtown", time: "09:30", tone: "warning" },
                  { id: "2", title: "Supply delivery", description: "Airport", time: "13:00" },
                  { id: "3", title: "Team meeting", time: "16:30" },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
        <Stack gap="none">
          <Heading className="mb-2">Quick actions</Heading>
          <QuickActions
            actions={[
              { id: "request", label: "New request", description: "Ask for work or supplies", icon: <FilePlus aria-hidden />, href: "/preview/record-form" },
              { id: "visit", label: "Schedule a visit", description: "Add it to the agenda", icon: <CalendarPlus aria-hidden />, href: "/preview/agenda" },
              { id: "asset", label: "Find an asset", description: "See where it is", icon: <Package aria-hidden />, href: "/preview/catalog" },
              { id: "report", label: "Monthly report", description: "Costs and totals", icon: <FileText aria-hidden />, href: "/preview/report" },
            ]}
          />
        </Stack>
        <Stack gap="none">
          <Heading className="mb-2">Latest requests</Heading>
          <DataTable columns={columns} data={open} getRowId={(r) => r.id} pageSize={5} onRowClick={() => { window.location.href = "/preview/record-detail"; }} />
        </Stack>
      </Stack>
    </DemoShell>
  );
}
