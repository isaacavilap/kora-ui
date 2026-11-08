"use client";
import { useState } from "react";
import { Field, Rating, Stack, Text } from "kora-ui";

export default function Demo() {
  const [score, setScore] = useState(3.5);
  return (
    <Stack className="max-w-sm">
      <Field label="¿Cómo fue el servicio?">
        <div className="flex items-center gap-3">
          <Rating step={0.5} value={score} onChange={setScore} name="score" aria-label="Servicio" />
          <Text tone="muted">{score} / 5</Text>
        </div>
      </Field>
      <div className="flex items-center gap-2">
        <Rating readOnly value={4.5} step={0.5} size={18} />
        <Text tone="muted">4.5 · 128 reseñas</Text>
      </div>
    </Stack>
  );
}
