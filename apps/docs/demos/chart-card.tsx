"use client";
import { ChartCard } from "kora-ui";
import { AreaChart } from "kora-ui/charts";
import { money, revenue } from "@/lib/demo-data";

export default function Demo() {
  return (
    <ChartCard title="Net sales" description="This year" value="$84,300" delta={7.3} deltaLabel="vs last month">
      <AreaChart summary="Net sales by month" data={revenue} x="month" valueFormat={money} height={220} series={[{ key: "revenue", label: "Net sales" }]} />
    </ChartCard>
  );
}
