"use client";
import { Button, PageHeader } from "kora-ui";

export default function Demo() {
  return (
    <PageHeader
      className="mb-0"
      title="Orders"
      description="Every order from your store, newest first."
      actions={
        <>
          <Button variant="secondary">Export</Button>
          <Button>New order</Button>
        </>
      }
    />
  );
}

