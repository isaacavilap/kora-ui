"use client";
import { useState } from "react";
import { Button, ConfirmDialog, toast, Toaster } from "kora-ui";
import { wait } from "@/lib/demo-data";

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Toaster />
      <Button variant="danger" onClick={() => setOpen(true)}>Remove location</Button>
      <ConfirmDialog
        danger
        open={open}
        onOpenChange={setOpen}
        title="Remove this location?"
        description="Its records stay, but no one can choose this location again."
        confirmLabel="Remove location"
        onConfirm={async () => { await wait(); toast.success("Location removed."); }}
      />
    </>
  );
}
