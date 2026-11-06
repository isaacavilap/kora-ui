"use client";
import { SegmentBar } from "kora-ui";
import { money } from "@/lib/demo-data";

export default function Demo() {
  return (
    <SegmentBar
      className="max-w-md"
      format={money}
      items={[
        { label: "Online", value: 48200 },
        { label: "Wholesale", value: 23600 },
        { label: "Café", value: 12500 },
      ]}
    />
  );
}
