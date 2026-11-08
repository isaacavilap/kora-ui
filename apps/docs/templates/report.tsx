"use client";
import { Alert, Card, CardContent, CardHeader, ChartCard, DescriptionList, Grid, Heading, KpiCard, PageHeader, RankedList, Stack } from "kora-ui";
import { BarChart } from "kora-ui/charts";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { money, requests, revenue, type WorkRequest } from "@/lib/demo-data";
import { DemoShell } from "./shell";

type Row = { id: string; location: string; requests: number; spent: number; items: WorkRequest[] };
const rows: Row[] = ["Downtown", "Airport", "Riverside"].map((location) => {
  const items = requests.filter((r) => r.location === location);
  return { id: location, location, requests: items.length, spent: items.reduce((sum, r) => sum + r.amount, 0), items };
});

const columns: DataTableColumn<Row>[] = [
  { id: "location", header: "Location", accessor: "location", sortable: true, footer: () => "Total" },
  { id: "requests", header: "Requests", accessor: "requests", sortable: true, align: "right", footer: (list) => list.reduce((sum, r) => sum + r.requests, 0) },
  { id: "spent", header: "Spent", accessor: "spent", sortable: true, align: "right", cell: (r) => money(r.spent), footer: (list) => money(list.reduce((sum, r) => sum + r.spent, 0)) },
];

const assigneeTotals = Object.entries(
  requests.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.assignee]: (acc[r.assignee] ?? 0) + 1 }), {}),
).map(([label, value]) => ({ label, value }));

export default function Template() {
  const spent = rows.reduce((sum, r) => sum + r.spent, 0);
  return (
    <DemoShell page="report" title="Monthly report">
      <PageHeader title="Monthly report" description="Costs and work for the last closed month, by location." />
      <Alert tone="warning" title="October is not closed yet" className="mb-4">These numbers can change until every request is reviewed.</Alert>
      <Stack>
        <Grid min="10.5rem">
          <KpiCard label="Spent" value={money(spent)} delta={3.1} invertDelta deltaLabel="vs September" />
          <KpiCard label="Requests" value={requests.length} delta={-4} deltaLabel="vs September" />
          <KpiCard label="Average per request" value={money(Math.round(spent / requests.length))} />
        </Grid>
        <Stack gap="none">
          <Heading className="mb-2">By location</Heading>
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(r) => r.id}
            exportFilename="monthly-report"
            renderExpanded={(r) => (
              <DescriptionList
                items={r.items.slice(0, 4).map((item) => ({ label: item.id, value: `${item.title}, ${money(item.amount)}` }))}
              />
            )}
          />
        </Stack>
        <Grid cols="2fr 1fr">
          <ChartCard title="Costs by month" description="This year">
            <BarChart summary="Costs by month this year" data={revenue} x="month" valueFormat={money} height={260} series={[{ key: "costs", label: "Costs" }]} />
          </ChartCard>
          <Card>
            <CardHeader title="Requests by person" description="Assigned this month" />
            <CardContent><RankedList items={assigneeTotals} /></CardContent>
          </Card>
        </Grid>
      </Stack>
    </DemoShell>
  );
}
