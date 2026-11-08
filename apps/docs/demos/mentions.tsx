"use client";
import { useState } from "react";
import { Field, Mentions, parseMentions, Stack, Text, type MentionOption } from "kora-ui";

const team: MentionOption[] = [
  { value: "ana", label: "Ana García", description: "Design" },
  { value: "luis.perez", label: "Luis Pérez", description: "Sales" },
  { value: "marta", label: "Marta Ruiz", description: "Support" },
  { value: "jose", label: "José Núñez", description: "Engineering" },
];

/** Stands in for a request to your server. */
const searchPeople = (query: string) => new Promise<MentionOption[]>((resolve) => setTimeout(() => resolve(team.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))), 400));

export default function Demo() {
  const [text, setText] = useState("Thanks @ana, can you check this?");
  return (
    <Stack className="max-w-lg">
      <Field label="Comment" hint="Type @ to mention someone.">
        <Mentions value={text} onChange={setText} options={team} name="comment" />
      </Field>
      <Text tone="muted">Mentioned: {parseMentions(text).join(", ") || "nobody"}</Text>
      <Field label="Assign to" hint="Searches a server as you type.">
        <Mentions singleLine onSearch={searchPeople} placeholder="@name" />
      </Field>
    </Stack>
  );
}
