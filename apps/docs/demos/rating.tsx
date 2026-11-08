"use client";
import { useState } from "react";
import { Field, Inline, Rating, Stack, Text } from "kora-ui";

export default function Demo() {
  const [score, setScore] = useState(3.5);
  return (
    <Stack className="max-w-sm">
      <Field label="¿Cómo fue el servicio?">
        <Inline gap="md">
          <Rating step={0.5} value={score} onChange={setScore} name="score" aria-label="Servicio" />
          <Text tone="muted">{score} / 5</Text>
        </Inline>
      </Field>
      <Inline>
        <Rating readOnly value={4.5} step={0.5} size={18} />
        <Text tone="muted">4.5 · 128 reseñas</Text>
      </Inline>
    </Stack>
  );
}
