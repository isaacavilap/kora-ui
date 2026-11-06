"use client";
import { Heatmap } from "kora-ui";

export default function Demo() {
  return (
    <Heatmap
      caption="Share of customers still active, by signup month"
      rows={["August", "September", "October"]}
      columns={["Month 1", "Month 2", "Month 3"]}
      values={[
        [100, 88, 81],
        [100, 84, 78],
        [100, 90, null],
      ]}
      format={(v) => `${v}%`}
    />
  );
}
