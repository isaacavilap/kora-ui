"use client";
import { StatGroup } from "kora-ui";

export default function Demo() {
  return (
    <StatGroup
      stats={[
        { label: "Open", value: 128 },
        { label: "Shipped", value: 842, delta: 4.2 },
        { label: "Returned", value: 16, delta: -12, invertDelta: true },
        { label: "Average value", value: "$64" },
      ]}
    />
  );
}

