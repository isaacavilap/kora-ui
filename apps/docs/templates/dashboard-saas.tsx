"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, ChartCard, Funnel, Gauge, Grid, Heatmap, KpiCard, PageHeader, SegmentBar, SegmentedControl, Timeline } from "kora-ui";
import { BarChart, LineChart } from "kora-ui/charts";
import { money } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const mrr = [
  { month: "Jul", mrr: 41200, target: 40000 },
  { month: "Aug", mrr: 43800, target: 43000 },
  { month: "Sep", mrr: 45100, target: 46000 },
  { month: "Oct", mrr: 48600, target: 49000 },
  { month: "Nov", mrr: 52300, target: 52000 },
  { month: "Dec", mrr: 56900, target: 55000 },
];

const movement = [
  { month: "Oct", added: 4700, lost: 1200 },
  { month: "Nov", added: 5100, lost: 1400 },
  { month: "Dec", added: 5900, lost: 1300 },
];

const cohortRows = ["July", "August", "September", "October", "November"];
const cohortColumns = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5"];
const cohorts = [
  [100, 86, 79, 74, 71],
  [100, 88, 81, 76, null],
  [100, 84, 78, null, null],
  [100, 90, null, null, null],
  [100, null, null, null, null],
];

const views = [
  { value: "mrr", label: "Revenue" },
  { value: "movement", label: "Added and lost" },
];

export default function Template() {
  const [view, setView] = useState("mrr");
  return (
    <DemoShell page="dashboard-saas" title="Subscriptions">
      <PageHeader title="Subscriptions" description="Recurring revenue, signups, and how long customers stay." />
      <div className="grid gap-[var(--kora-gap)]">
        <Grid min="10.5rem">
          <KpiCard label="Monthly revenue" value="$56,900" delta={8.8} deltaLabel="vs last month" trend={mrr.map((m) => m.mrr)} />
          <KpiCard label="Active customers" value="1,284" delta={3.2} deltaLabel="vs last month" trend={[1090, 1120, 1150, 1190, 1244, 1284]} />
          <KpiCard label="Churn" value="2.1%" delta={-0.3} invertDelta deltaLabel="vs last month" trend={[2.9, 2.7, 2.6, 2.5, 2.4, 2.1]} />
          <KpiCard label="Revenue per customer" value="$44.31" delta={5.4} deltaLabel="vs last month" trend={[37.8, 39.1, 39.2, 40.8, 42, 44.3]} />
        </Grid>
        <Grid cols="2fr 1fr">
          <ChartCard
            title={view === "mrr" ? "Monthly revenue" : "Revenue added and lost"}
            description={view === "mrr" ? "Against the target" : "Last three months"}
            actions={<SegmentedControl aria-label="Chart view" options={views} value={view} onChange={setView} />}
          >
            {view === "mrr" ? (
              <LineChart
                summary="Monthly revenue against the target"
                data={mrr}
                x="month"
                valueFormat={money}
                height={260}
                series={[
                  { key: "mrr", label: "Revenue" },
                  { key: "target", label: "Target" },
                ]}
              />
            ) : (
              <BarChart
                summary="Revenue added and lost for the last three months"
                data={movement}
                x="month"
                valueFormat={money}
                height={260}
                series={[
                  { key: "added", label: "Added" },
                  { key: "lost", label: "Lost" },
                ]}
              />
            )}
          </ChartCard>
          <Card>
            <CardHeader title="Goal this quarter" description="Monthly revenue of $70,000" />
            <CardContent className="grid gap-5">
              <Gauge label="Reached so far" value={56900} max={70000} tone="success" />
              <SegmentBar
                items={[
                  { label: "Pro", value: 31400 },
                  { label: "Team", value: 18200 },
                  { label: "Starter", value: 7300 },
                ]}
                format={money}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid cols="1fr 2fr">
          <Card>
            <CardHeader title="Signup funnel" description="Last 30 days" />
            <CardContent>
              <Funnel
                steps={[
                  { label: "Visited pricing", value: 18400 },
                  { label: "Started a trial", value: 2210 },
                  { label: "Invited a teammate", value: 940 },
                  { label: "Became paying", value: 412 },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Customers who stay" description="Share still active, by signup month" />
            <CardContent>
              <Heatmap caption="Share of customers still active, by signup month" rows={cohortRows} columns={cohortColumns} values={cohorts} format={(v) => `${v}%`} />
            </CardContent>
          </Card>
        </Grid>
        <Card>
          <CardHeader title="Latest changes" />
          <CardContent>
            <Timeline
              events={[
                { id: "1", title: "Northwind moved to Team", description: "Adds $180 a month.", time: "Today, 10:42", tone: "success" },
                { id: "2", title: "Aster Labs canceled", description: "Loses $96 a month. Reason given: too expensive.", time: "Yesterday, 17:05", tone: "danger" },
                { id: "3", title: "Payment retry succeeded for Delta Co", time: "Yesterday, 09:20", tone: "neutral" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DemoShell>
  );
}
