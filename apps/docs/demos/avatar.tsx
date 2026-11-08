"use client";
import { Avatar, Inline } from "kora-ui";

export default function Demo() {
  return (
    <Inline wrap={false} className="gap-3">
      <Avatar name="Marta Ríos" size={24} />
      <Avatar name="Tomás Vega" />
      <Avatar name="Lucía Herrera" size={48} />
    </Inline>
  );
}

