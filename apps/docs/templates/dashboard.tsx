"use client";
import { useState } from "react";
import { Badge, Button, Card, CardContent, CardHeader, DateRangePicker, Grid, Heading, KpiCard, PageHeader, Progress, Stack, type DateRange } from "kora-ui";
import { AreaChart, BarChart, DonutChart } from "kora-ui/charts";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { Download } from "lucide-react";
import { channels, money, orders, revenue, statusTone, type Order } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const columns: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", accessor: "id" },
  { id: "customer", header: "Customer", accessor: "customer" },
  { id: "status", header: "Status", accessor: "status", cell: (o) => <Badge tone={statusTone[o.status]} className="capitalize">{o.status}</Badge> },
  { id: "total", header: "Total", accessor: "total", align: "right", cell: (o) => money(o.total) },
];

export default function Template() {
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 0, 1), to: new Date(2026, 11, 31) });
  return (
    <DemoShell page="dashboard" title="Overview">
      <PageHeader
        title="Overview"
        description="Sales, costs, and traffic for your store."
        actions={
          <>
            <DateRangePicker aria-label="Date range" value={range} onChange={setRange} className="max-md:w-full" />
            <Button variant="secondary" className="max-md:w-full"><Download aria-hidden />Export</Button>
          </>
        }
      />
      <Stack>
        <Grid min="10.5rem">
          <KpiCard label="Revenue" value="$84,300" delta={7.3} deltaLabel="vs November" trend={revenue.slice(-7).map((r) => r.revenue)} />
          <KpiCard label="Orders" value="1,482" delta={4.1} deltaLabel="vs November" trend={[1180, 1210, 1260, 1300, 1380, 1424, 1482]} />
          <KpiCard label="Average order" value="$56.88" delta={3.1} deltaLabel="vs November" trend={[50, 51, 53, 52, 54, 55, 57]} />
          <KpiCard label="Refund rate" value="1.8%" delta={-0.4} invertDelta deltaLabel="vs November" trend={[2.6, 2.5, 2.4, 2.2, 2.3, 2.2, 1.8]} />
        </Grid>
        <Grid cols="2fr 1fr">
          <Card>
            <CardHeader title="Revenue and costs" description="By month, this year" />
            <CardContent>
              <AreaChart
                summary="Revenue and costs by month"
                data={revenue}
                x="month"
                valueFormat={money}
                height={280}
                series={[
                  { key: "revenue", label: "Revenue" },
                  { key: "costs", label: "Costs" },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Visits by channel" description="Last 30 days" />
            <CardContent>
              <DonutChart summary="Visits by channel" data={channels} centerLabel="visits" height={180} className="[&>div>div]:flex-col [&>div>div>*]:w-full" />
            </CardContent>
          </Card>
        </Grid>
        <Grid cols="1fr 2fr">
          <Card>
            <CardHeader title="Goals" description="This quarter" />
            <CardContent className="grid gap-4">
              <Progress label="Revenue" value={84} showValue />
              <Progress label="New customers" value={62} showValue />
              <Progress label="Repeat orders" value={38} showValue tone="warning" />
            </CardContent>
            <CardContent className="pt-0">
              <BarChart summary="Costs for the last four months" data={revenue.slice(-4)} x="month" height={140} series={[{ key: "costs", label: "Costs" }]} />
            </CardContent>
          </Card>
          <Stack gap="none">
            <Heading className="mb-2">Latest orders</Heading>
            <DataTable columns={columns} data={orders} getRowId={(o) => o.id} pageSize={6} />
          </Stack>
        </Grid>
      </Stack>
    </DemoShell>
  );
}

