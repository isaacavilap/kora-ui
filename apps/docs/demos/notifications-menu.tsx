"use client";
import { useState } from "react";
import { NotificationsMenu, type Notification } from "kora-ui";

const initial: Notification[] = [
  { id: "1", title: "Payment failed for order KC-1042", description: "The card was declined.", time: "12 min ago", unread: true },
  { id: "2", title: "Marta invited Luis to the workspace", time: "2 h ago", unread: true },
  { id: "3", title: "Your October report is ready", time: "Yesterday" },
];

export default function Demo() {
  const [items, setItems] = useState(initial);
  return (
    <NotificationsMenu
      items={items}
      onSelect={(item) => setItems(items.map((n) => (n.id === item.id ? { ...n, unread: false } : n)))}
      onMarkAllRead={() => setItems(items.map((n) => ({ ...n, unread: false })))}
    />
  );
}
