"use client";
import { useState } from "react";
import { DateRangePicker, type DateRange } from "kora-ui";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

export default function Demo() {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      presets={[
        { label: "Last 7 days", range: () => ({ from: daysAgo(7), to: new Date() }) },
        { label: "Last 30 days", range: () => ({ from: daysAgo(30), to: new Date() }) },
      ]}
    />
  );
}

