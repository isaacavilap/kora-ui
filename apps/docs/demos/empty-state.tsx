"use client";
import { Button, Card, EmptyState } from "kora-ui";
import { Inbox } from "lucide-react";

export default function Demo() {
  return (
    <Card>
      <EmptyState
        icon={<Inbox aria-hidden />}
        title="No orders yet"
        description="Orders appear here after your first sale."
        action={<Button variant="secondary">Create test order</Button>}
      />
    </Card>
  );
}

