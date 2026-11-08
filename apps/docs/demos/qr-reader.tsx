"use client";
import { useState } from "react";
import { Button, QRReader, Stack, Text } from "kora-ui";

export default function Demo() {
  const [on, setOn] = useState(false);
  const [read, setRead] = useState<string>();
  return (
    <Stack className="max-w-sm">
      {on ? <QRReader onDecode={(text) => { setRead(text); setOn(false); }} /> : <Button onClick={() => setOn(true)}>Escanear un código</Button>}
      <Text tone="muted" aria-live="polite">{read ? `Leído: ${read}` : "La cámara se apaga al leer un código."}</Text>
    </Stack>
  );
}
