"use client";
import { Badge } from "kora-ui";

export default function Demo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success">Paid</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="info">Beta</Badge>
    </div>
  );
}

