"use client";
import { AreaChart } from "kora-ui/charts";
import { money, revenue } from "@/lib/demo-data";

export default function Demo() {
  return <AreaChart summary="Revenue by month" data={revenue} x="month" valueFormat={money} series={[{ key: "revenue", label: "Revenue" }]} />;
}

