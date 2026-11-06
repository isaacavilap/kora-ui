"use client";
import { Badge, DescriptionList } from "kora-ui";

export default function Demo() {
  return (
    <DescriptionList
      className="max-w-sm"
      items={[
        { label: "Status", value: <Badge tone="success">Healthy</Badge> },
        { label: "Region", value: "US East" },
        { label: "Uptime", value: "99.99%" },
      ]}
    />
  );
}
