"use client";
import { Button, Inline, Toaster, toast } from "kora-ui";

export default function Demo() {
  return (
    <Inline align="stretch">
      <Toaster />
      <Button variant="secondary" onClick={() => toast.success("Changes saved.")}>Success</Button>
      <Button variant="secondary" onClick={() => toast.error("Payment failed.")}>Error</Button>
      <Button variant="secondary" onClick={() => toast("Export started.", { description: "We will email you the file." })}>With description</Button>
    </Inline>
  );
}

