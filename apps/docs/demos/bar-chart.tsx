"use client";
import { BarChart } from "kora-ui/charts";
import { revenue } from "@/lib/demo-data";

export default function Demo() {
  return (
    <BarChart
      summary="Revenue and costs for the last six months"
      data={revenue.slice(-6)}
      x="month"
      series={[
        { key: "revenue", label: "Revenue" },
        { key: "costs", label: "Costs" },
      ]}
    />
  );
}

