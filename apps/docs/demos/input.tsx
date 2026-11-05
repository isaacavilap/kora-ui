"use client";
import { Field, Input, Textarea } from "kora-ui";

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field label="Title"><Input placeholder="Q4 sales review" /></Field>
      <Field label="Notes"><Textarea placeholder="What should the team know?" /></Field>
      <Field label="Disabled"><Input disabled defaultValue="Read only" /></Field>
    </div>
  );
}

