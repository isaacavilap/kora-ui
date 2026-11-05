"use client";
import { DonutChart } from "kora-ui/charts";
import { channels } from "@/lib/demo-data";

export default function Demo() {
  return <DonutChart summary="Visits by channel" data={channels} centerLabel="visits" />;
}

