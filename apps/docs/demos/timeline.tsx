"use client";
import { Timeline } from "kora-ui";

export default function Demo() {
  return (
    <Timeline
      events={[
        { id: "outage", title: "Email provider outage", description: "Investigating with the provider.", time: "Started 14:02", tone: "danger" },
        { id: "slow", title: "Slow responses on the public API", time: "Started 15:40", tone: "warning" },
        { id: "search", title: "Search index rebuilt", time: "Resolved 09:15", tone: "success" },
      ]}
    />
  );
}
