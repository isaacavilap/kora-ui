"use client";
import { Funnel } from "kora-ui";

export default function Demo() {
  return (
    <Funnel
      className="max-w-md"
      steps={[
        { label: "Visited pricing", value: 18400 },
        { label: "Started a trial", value: 2210 },
        { label: "Became paying", value: 412 },
      ]}
    />
  );
}
