"use client";
import { AlertList, Avatar, Badge, Button, Card, CardContent, CardFooter, CardHeader, ChartCard, Delta, DescriptionList, Grid, KpiCard, PageHeader, Timeline } from "kora-ui";
import { BarChart } from "kora-ui/charts";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { COMPANY_KEY, companies, money, requests, revenueByCompany, stages, stageTone, type WorkRequest } from "@/lib/demo-data";
import { DemoShell } from "./shell";

type Row = WorkRequest & { company: string };
const rows: Row[] = requests.filter((r) => r.stage !== "done").map((r, i) => ({ ...r, company: companies[i % companies.length]!.name }));

const columns: DataTableColumn<Row>[] = [
  { id: "company", header: "Company", accessor: "company", sortable: true, filter: { type: "select" } },
  { id: "title", header: "Request", accessor: "title", sortable: true },
  { id: "assignee", header: "Assigned to", accessor: "assignee", hideOnMobile: true },
  { id: "stage", header: "Stage", accessor: "stage", cell: (r) => <Badge tone={stageTone[r.stage]}>{stages.find((s) => s.value === r.stage)!.label}</Badge> },
  { id: "amount", header: "Amount", accessor: "amount", sortable: true, align: "right", cell: (r) => money(r.amount), footer: (list) => money(list.reduce((sum, r) => sum + r.amount, 0)) },
];

const sum = (pick: (c: (typeof companies)[number]) => number) => companies.reduce((total, c) => total + pick(c), 0);
const openCompany = (id: string) => {
  localStorage.setItem(COMPANY_KEY, id);
  window.location.href = "/preview/home";
};

export default function Template() {
  return (
    <DemoShell page="group-overview" title="Overview">
      <PageHeader title="All companies" description="Totals for the group. Open a company to work in it." />
      <div className="grid gap-[var(--kora-gap)]">
        <Grid min="10.5rem">
          <KpiCard label="Group revenue" value={money(sum((c) => c.revenue))} delta={5.1} deltaLabel="vs September" />
          <KpiCard label="Open requests" value={sum((c) => c.open)} delta={-4} invertDelta deltaLabel="vs September" />
          <KpiCard label="Past due" value={sum((c) => c.pastDue)} />
          <KpiCard label="People" value={sum((c) => c.people)} />
        </Grid>
        <Grid min="16rem">
          {companies.map((company) => (
            <Card key={company.id} className="flex flex-col">
              <CardHeader
                title={<span className="flex items-center gap-2"><Avatar name={company.name} size={24} className="rounded-md" />{company.name}</span>}
                description={company.description}
              />
              <CardContent className="flex-1">
                <DescriptionList
                  items={[
                    { label: "Revenue", value: <span className="flex items-center gap-2">{money(company.revenue)} <Delta value={company.delta} /></span> },
                    { label: "Open requests", value: company.open },
                    { label: "Past due", value: company.pastDue === 0 ? "None" : <Badge tone="danger">{company.pastDue}</Badge> },
                  ]}
                />
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full" aria-label={`Open company: ${company.name}`} onClick={() => openCompany(company.id)}>Open company</Button>
              </CardFooter>
            </Card>
          ))}
        </Grid>
        <Grid cols="2fr 1fr">
          <ChartCard title="Revenue by company" description="Last 4 months">
            <BarChart
              summary="Revenue by company over the last 4 months"
              data={revenueByCompany}
              x="month"
              valueFormat={money}
              height={340}
              series={companies.map((c) => ({ key: c.id, label: c.name }))}
            />
          </ChartCard>
          <div className="grid min-w-0 content-start gap-[var(--kora-gap)]">
            <Card>
              <CardHeader title="Needs attention" />
              <CardContent>
                <AlertList
                  alerts={[
                    { id: "1", tone: "danger", title: "Kora Coffee has 2 requests past due", action: { label: "Review them", href: "/preview/workflow" } },
                    { id: "2", tone: "warning", title: "Norte Roasters revenue fell 3.4%", action: { label: "Open report", href: "/preview/report" } },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Scheduled today" />
              <CardContent>
                <Timeline
                  events={[
                    { id: "1", title: "Fridge technician", description: "Kora Coffee", time: "09:30", tone: "warning" },
                    { id: "2", title: "Quality audit", description: "Norte Roasters", time: "11:00" },
                    { id: "3", title: "Route review", description: "Vía Logistics", time: "15:00" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </Grid>
        <div className="min-w-0">
          <h2 className="mb-2 text-sm font-semibold">Open requests in all companies</h2>
          <DataTable columns={columns} data={rows} getRowId={(r) => r.id} searchable searchPlaceholder="Search requests" exportFilename="group-requests" pageSize={6} />
        </div>
      </div>
    </DemoShell>
  );
}
