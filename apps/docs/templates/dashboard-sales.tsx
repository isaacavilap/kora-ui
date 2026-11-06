"use client";
import { useState } from "react";
import { Badge, Button, Card, CardContent, CardHeader, ChartCard, Grid, KpiCard, PageHeader, RankedList, SegmentBar, SegmentedControl } from "kora-ui";
import { AreaChart, BarChart } from "kora-ui/charts";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { money, orders, revenue, salesByChannel, statusTone, topProducts, type Order } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const needsAction = orders.filter((o) => o.status === "pending" || o.status === "failed");

const columns: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", accessor: "id" },
  { id: "customer", header: "Customer", accessor: "customer" },
  { id: "status", header: "Status", accessor: "status", filter: { type: "select" }, cell: (o) => <Badge tone={statusTone[o.status]} className="capitalize">{o.status}</Badge> },
  { id: "total", header: "Total", accessor: "total", sortable: true, align: "right", cell: (o) => money(o.total) },
];

const ranges = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
];

export default function Template() {
  const [range, setRange] = useState("12");
  return (
    <DemoShell page="dashboard-sales" title="Sales">
      <PageHeader
        title="Sales"
        description="How the store is selling, and what needs action today."
        actions={<SegmentedControl aria-label="Time range" options={ranges} value={range} onChange={setRange} />}
      />
      <div className="grid gap-[var(--kora-gap)]">
        <Grid min="10.5rem">
          <KpiCard label="Net sales" value="$84,300" delta={7.3} deltaLabel="vs last month" trend={revenue.slice(-7).map((r) => r.revenue)} />
          <KpiCard label="Orders" value="1,482" delta={4.1} deltaLabel="vs last month" trend={[1180, 1210, 1260, 1300, 1380, 1424, 1482]} />
          <KpiCard label="Conversion" value="3.4%" delta={0.3} deltaLabel="vs last month" trend={[2.8, 2.9, 3, 3.1, 3, 3.1, 3.4]} />
          <KpiCard label="Returns" value="1.8%" delta={-0.4} invertDelta deltaLabel="vs last month" trend={[2.6, 2.5, 2.4, 2.2, 2.3, 2.2, 1.8]} />
        </Grid>
        <Grid cols="3fr 2fr">
          <ChartCard title="Net sales" description={`Last ${range} months`} value="$84,300" delta={7.3} deltaLabel="vs last month">
            <AreaChart
              summary={`Net sales by month for the last ${range} months`}
              data={revenue.slice(-Number(range))}
              x="month"
              valueFormat={money}
              height={240}
              series={[{ key: "revenue", label: "Net sales" }]}
            />
          </ChartCard>
          <Card>
            <CardHeader title="Sales by channel" description="Last six months" />
            <CardContent>
              <BarChart
                stacked
                summary="Sales by channel for the last six months"
                data={salesByChannel}
                x="month"
                valueFormat={money}
                height={300}
                series={[
                  { key: "online", label: "Online" },
                  { key: "wholesale", label: "Wholesale" },
                  { key: "cafe", label: "Café" },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid cols="1fr 1fr">
          <Card>
            <CardHeader title="Best sellers" description="Units sold this year" />
            <CardContent><RankedList items={topProducts} /></CardContent>
          </Card>
          <Card>
            <CardHeader title="Where sales come from" description="This month" />
            <CardContent>
              <SegmentBar
                format={money}
                items={[
                  { label: "Online", value: 48200 },
                  { label: "Wholesale", value: 23600 },
                  { label: "Café", value: 12500 },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Orders that need action</h2>
            <Button asChild variant="ghost" size="sm"><a href="/preview/orders">All orders</a></Button>
          </div>
          <DataTable columns={columns} data={needsAction} getRowId={(o) => o.id} pageSize={5} exportFilename="orders-need-action" />
        </div>
      </div>
    </DemoShell>
  );
}
