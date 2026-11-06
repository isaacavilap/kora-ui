"use client";
import { CommandPalette, toast, Toaster, type CommandItem } from "kora-ui";
import { Download, Home, ShoppingCart, Users } from "lucide-react";

const items: CommandItem[] = [
  { id: "overview", label: "Overview", group: "Pages", href: "#", icon: <Home aria-hidden /> },
  { id: "orders", label: "Orders", group: "Pages", href: "#", icon: <ShoppingCart aria-hidden />, keywords: "sales purchases" },
  { id: "members", label: "Members", group: "Pages", href: "#", icon: <Users aria-hidden />, keywords: "team roles" },
  { id: "export", label: "Export this month", group: "Actions", icon: <Download aria-hidden />, onSelect: () => toast.success("Export started.") },
];

/* Press Cmd+K or Ctrl+K. */
export default function Demo() {
  return (
    <>
      <Toaster />
      <CommandPalette items={items} />
    </>
  );
}
