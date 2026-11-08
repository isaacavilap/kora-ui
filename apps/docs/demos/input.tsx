"use client";
import { Field, Input, Stack, Textarea } from "kora-ui";

export default function Demo() {
  return (
    <Stack gap="md" className="max-w-sm">
      <Field label="Title"><Input placeholder="Q4 sales review" /></Field>
      <Field label="Notes"><Textarea placeholder="What should the team know?" /></Field>
      <Field label="Disabled"><Input disabled defaultValue="Read only" /></Field>
    </Stack>
  );
}

