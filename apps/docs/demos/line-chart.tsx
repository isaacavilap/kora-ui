"use client";
import { LineChart } from "kora-ui/charts";
import { money, revenue } from "@/lib/demo-data";

export default function Demo() {
  return (
    <LineChart
      summary="Revenue and costs by month"
      data={revenue}
      x="month"
      valueFormat={money}
      series={[
        { key: "revenue", label: "Revenue" },
        { key: "costs", label: "Costs" },
      ]}
    />
  );
}

