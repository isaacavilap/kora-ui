"use client";
import { Avatar } from "kora-ui";

export default function Demo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="Marta Ríos" size={24} />
      <Avatar name="Tomás Vega" />
      <Avatar name="Lucía Herrera" size={48} />
    </div>
  );
}

