"use client";
import { Button, Tooltip } from "kora-ui";
import { Info } from "lucide-react";

export default function Demo() {
  return (
    <Tooltip content="Net of refunds and fees">
      <Button variant="secondary" size="icon" aria-label="About net revenue"><Info aria-hidden /></Button>
    </Tooltip>
  );
}

