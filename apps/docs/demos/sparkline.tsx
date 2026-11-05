"use client";
import { Sparkline } from "kora-ui/charts";

export default function Demo() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>Sessions</span>
      <Sparkline data={[12, 18, 15, 22, 28, 26, 34]} />
    </div>
  );
}

