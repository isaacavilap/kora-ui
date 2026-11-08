"use client";
import { useState } from "react";
import { Field, Inline, Input, QRCode, Select, Stack } from "kora-ui";

const levels = ["L", "M", "Q", "H"].map((l) => ({ value: l, label: l }));

export default function Demo() {
  const [value, setValue] = useState("https://speedcarservices.com/citas");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  return (
    <Inline gap="md" align="start">
      <QRCode value={value} level={level} size={200} download="cita-qr.svg" />
      <Stack gap="md" className="flex-1 basis-64">
        <Field label="Texto o enlace"><Input value={value} onChange={(e) => setValue(e.target.value)} /></Field>
        <Field label="Corrección de errores"><Select options={levels} value={level} onValueChange={(v) => setLevel(v as typeof level)} /></Field>
        <QRCode value={value} size={96} color="#1f62b8" background="transparent" label="Código QR en azul" />
      </Stack>
    </Inline>
  );
}
