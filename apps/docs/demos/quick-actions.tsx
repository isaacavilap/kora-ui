"use client";
import { QuickActions } from "kora-ui";
import { CalendarPlus, FilePlus, FileText } from "lucide-react";

export default function Demo() {
  return (
    <QuickActions
      actions={[
        { id: "request", label: "New request", description: "Ask for work or supplies", icon: <FilePlus aria-hidden />, href: "#" },
        { id: "visit", label: "Schedule a visit", description: "Add it to the agenda", icon: <CalendarPlus aria-hidden />, href: "#" },
        { id: "report", label: "Monthly report", description: "Costs and totals", icon: <FileText aria-hidden />, href: "#" },
      ]}
    />
  );
}
