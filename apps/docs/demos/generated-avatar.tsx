"use client";
import { useState } from "react";
import { Avatar, Button, GeneratedAvatar, Inline, randomAvatar, Stack, Text, type AvatarArt } from "kora-ui";

const people = ["Marta Ríos", "Tomás Vega", "Lucía Herrera", "Diego Paredes", "Sofía Delgado", "Pablo Mora"];

export default function Demo() {
  const [art, setArt] = useState<AvatarArt>({ shape: 0, color: 0, face: 1 });
  return (
    <Stack gap="md">
      <Inline gap="md">
        {people.map((name) => <Avatar key={name} name={name} seed={name} size={48} />)}
      </Inline>
      <Inline gap="md">
        <GeneratedAvatar art={art} size={72} label="Your avatar" />
        <Button variant="secondary" onClick={() => setArt(randomAvatar())}>Choose another</Button>
      </Inline>
      <Text size="sm" tone="muted">The same seed always gives the same avatar.</Text>
    </Stack>
  );
}
