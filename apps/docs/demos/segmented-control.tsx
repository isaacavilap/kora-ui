"use client";
import { useState } from "react";
import { SegmentedControl } from "kora-ui";

const ranges = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

export default function Demo() {
  const [range, setRange] = useState("30");
  return <SegmentedControl aria-label="Time range" options={ranges} value={range} onChange={setRange} />;
}
