"use client";
import { AlertList } from "kora-ui";

export default function Demo() {
  return (
    <AlertList
      className="max-w-lg"
      alerts={[
        { id: "1", tone: "danger", title: "3 requests are past due", description: "The oldest one has waited for 6 days.", action: { label: "Review them", href: "#" } },
        { id: "2", tone: "warning", title: "Health permit expires in 12 days", action: { label: "Open request", href: "#" } },
      ]}
    />
  );
}
