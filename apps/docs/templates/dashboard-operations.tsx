"use client";
import { Alert, Badge, Card, CardContent, CardHeader, ChartCard, Gauge, Grid, Heading, Heatmap, KpiCard, PageHeader, RankedList, Stack, Timeline } from "kora-ui";
import { AreaChart } from "kora-ui/charts";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { DemoShell } from "./shell";

const latency = [
  { time: "00:00", p50: 112, p95: 280 },
  { time: "04:00", p50: 104, p95: 240 },
  { time: "08:00", p50: 138, p95: 340 },
  { time: "12:00", p50: 164, p95: 420 },
  { time: "16:00", p50: 171, p95: 610 },
  { time: "20:00", p50: 142, p95: 360 },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"];
// ponytail: fixed sample shape. Busy in work hours, and quieter at night and on weekends.
const traffic = days.map((_, d) => hours.map((_, h) => Math.round((d > 4 ? 40 : 90) * Math.sin(((h + 1) / 13) * Math.PI) + 12 + ((d * 7 + h * 3) % 11))));

type Service = { id: string; name: string; status: "Healthy" | "Degraded" | "Down"; uptime: string; latency: number };
const services: Service[] = [
  { id: "api", name: "Public API", status: "Degraded", uptime: "99.82%", latency: 610 },
  { id: "web", name: "Web app", status: "Healthy", uptime: "99.99%", latency: 142 },
  { id: "jobs", name: "Background jobs", status: "Healthy", uptime: "99.97%", latency: 88 },
  { id: "search", name: "Search", status: "Healthy", uptime: "99.95%", latency: 204 },
  { id: "mail", name: "Email delivery", status: "Down", uptime: "98.40%", latency: 0 },
];
const serviceTone = { Healthy: "success", Degraded: "warning", Down: "danger" } as const;

const columns: DataTableColumn<Service>[] = [
  { id: "name", header: "Service", accessor: "name", sortable: true },
  { id: "status", header: "Status", accessor: "status", filter: { type: "select" }, cell: (s) => <Badge tone={serviceTone[s.status]}>{s.status}</Badge> },
  { id: "uptime", header: "Uptime", accessor: "uptime", align: "right" },
  { id: "latency", header: "Response", accessor: "latency", sortable: true, align: "right", cell: (s) => (s.status === "Down" ? "None" : `${s.latency} ms`) },
];

export default function Template() {
  return (
    <DemoShell page="dashboard-operations" title="Operations">
      <PageHeader title="Operations" description="Service health, response times, and open incidents." />
      <Alert tone="danger" title="Email delivery is down" className="mb-4">Messages are queued and send once the provider recovers.</Alert>
      <Stack>
        <Grid min="10.5rem">
          <KpiCard label="Uptime, 30 days" value="99.82%" delta={-0.1} deltaLabel="vs last month" trend={[99.97, 99.95, 99.96, 99.9, 99.88, 99.82]} />
          <KpiCard label="Slowest responses" value="610 ms" delta={22} invertDelta deltaLabel="vs yesterday" trend={[280, 240, 340, 420, 610]} />
          <KpiCard label="Error rate" value="0.42%" delta={0.1} invertDelta deltaLabel="vs yesterday" trend={[0.2, 0.25, 0.22, 0.31, 0.42]} />
          <KpiCard label="Open incidents" value="2" />
        </Grid>
        <Grid cols="2fr 1fr">
          <ChartCard title="Response time" description="Today, in milliseconds">
            <AreaChart
              summary="Typical and slowest response times today"
              data={latency}
              x="time"
              valueFormat={(v) => `${v} ms`}
              height={260}
              series={[
                { key: "p50", label: "Typical" },
                { key: "p95", label: "Slowest 5%" },
              ]}
            />
          </ChartCard>
          <Card>
            <CardHeader title="Capacity" description="Right now" />
            <CardContent className="grid grid-cols-2 gap-4">
              <Gauge label="CPU" value={72} tone="warning" />
              <Gauge label="Memory" value={58} tone="success" />
              <Gauge label="Disk" value={91} tone="danger" />
              <Gauge label="Queue" value={340} max={1000} valueLabel="340" tone="success" />
            </CardContent>
          </Card>
        </Grid>
        <Card>
          <CardHeader title="Requests by hour" description="Thousands, last week" />
          <CardContent>
            <Heatmap caption="Thousands of requests by day and hour, last week" rows={days} columns={hours} values={traffic} showValues={false} />
          </CardContent>
        </Card>
        <Grid cols="2fr 1fr">
          <Stack gap="none">
            <Heading className="mb-2">Services</Heading>
            <DataTable columns={columns} data={services} getRowId={(s) => s.id} exportFilename="services" />
          </Stack>
          <Stack>
            <Card>
              <CardHeader title="Incidents" />
              <CardContent>
                <Timeline
                  events={[
                    { id: "1", title: "Email provider outage", description: "Investigating with the provider.", time: "Started 14:02", tone: "danger" },
                    { id: "2", title: "Slow responses on the public API", description: "Traffic above normal.", time: "Started 15:40", tone: "warning" },
                    { id: "3", title: "Search index rebuilt", time: "Resolved 09:15", tone: "success" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Most errors" description="Last 24 hours" />
              <CardContent>
                <RankedList
                  items={[
                    { label: "POST /v1/messages", value: 1240 },
                    { label: "GET /v1/search", value: 312 },
                    { label: "POST /v1/orders", value: 96 },
                  ]}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </DemoShell>
  );
}
