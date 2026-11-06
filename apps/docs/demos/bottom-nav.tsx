"use client";
import { BottomNav } from "kora-ui";
import { BarChart3, CalendarDays, ClipboardList, Home } from "lucide-react";

const items = [
  { href: "#today", label: "Today", icon: <Home aria-hidden />, active: true },
  { href: "#requests", label: "Requests", icon: <ClipboardList aria-hidden />, badge: 12 },
  { href: "#agenda", label: "Agenda", icon: <CalendarDays aria-hidden /> },
  { href: "#report", label: "Report", icon: <BarChart3 aria-hidden /> },
];

export default function Demo() {
  // Shown in place here. In an app, pass it to the AppShell bottomNav slot.
  return <BottomNav className="static max-w-sm rounded-md border lg:block" items={items} />;
}
