"use client";
import { Inline, Text } from "kora-ui";
import { Sparkline } from "kora-ui/charts";

export default function Demo() {
  return (
    <Inline wrap={false} className="gap-3 text-sm">
      <Text inline>Sessions</Text>
      <Sparkline data={[12, 18, 15, 22, 28, 26, 34]} />
    </Inline>
  );
}

