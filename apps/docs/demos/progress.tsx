"use client";
import { Progress } from "kora-ui";

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Progress label="Monthly goal" value={72} showValue />
      <Progress label="Storage" value={91} showValue tone="warning" />
      <Progress label="Onboarding" value={4} max={4} showValue tone="success" />
    </div>
  );
}

