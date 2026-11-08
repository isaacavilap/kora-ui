"use client";
import { Badge, Inline } from "kora-ui";

export default function Demo() {
  return (
    <Inline align="stretch">
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success">Paid</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="info">Beta</Badge>
    </Inline>
  );
}

