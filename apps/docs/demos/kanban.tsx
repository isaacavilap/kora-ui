"use client";
import { useState } from "react";
import { Kanban, toast, type KanbanCard, type KanbanColumn } from "kora-ui";

const columns = [
  { id: "new", title: "New", cards: [{ id: "1", title: "Quote 311", description: "Rosa Castillo" }, { id: "2", title: "Quote 312", description: "Hotel Sol" }] },
  { id: "sent", title: "Sent", cards: [{ id: "3", title: "Quote 305", description: "Faro Homes" }] },
  { id: "won", title: "Won", cards: [{ id: "4", title: "Quote 298", description: "Mario Ruiz" }] },
];

export default function Demo() {
  const [board, setBoard] = useState<KanbanColumn[]>(columns);
  const move = (card: KanbanCard, from: KanbanColumn, to: KanbanColumn) =>
    setBoard((current) => current.map((column) => {
      if (column.id === from.id) return { ...column, cards: column.cards?.filter((other) => other.id !== card.id) };
      if (column.id === to.id) return { ...column, cards: [...(column.cards ?? []), card] };
      return column;
    }));
  return <Kanban aria-label="Quotes" columns={board} onCardMove={move} onCardClick={(card) => toast(`Open ${card.title}`)} />;
}
