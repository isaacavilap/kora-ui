"use client";
import { Progress, Stack, type ProgressRange } from "kora-ui";

const ranges: ProgressRange[] = [
  { upTo: 50, tone: "danger" },
  { upTo: 80, tone: "warning" },
  { upTo: 100, tone: "success" },
];

export default function Demo() {
  return (
    <Stack gap="md">
      <Progress label="One color" value={64} showValue />
      <Progress label="Color by range: 35" value={35} ranges={ranges} showValue />
      <Progress label="Color by range: 92" value={92} ranges={ranges} showValue />
      <Progress label="Gradient" value={72} ranges={ranges} fill="gradient" showValue />
      <Progress label="Pieces" value={72} ranges={ranges} fill="segments" segments={20} showValue />
    </Stack>
  );
}
