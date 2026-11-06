"use client";
import { StageCounters } from "kora-ui";

export default function Demo() {
  return (
    <StageCounters
      stages={[
        { id: "new", label: "New", count: 6, href: "#", alert: true },
        { id: "approved", label: "Approved", count: 8, href: "#" },
        { id: "working", label: "In progress", count: 5, href: "#" },
        { id: "done", label: "Done", count: 42, href: "#" },
      ]}
    />
  );
}
