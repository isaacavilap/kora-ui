"use client";
import { Box, PhoneFrame, Stack, Text } from "kora-ui";

export default function Demo() {
  return (
    <PhoneFrame width={300} safeArea label="Vista previa de la app">
      <Stack gap="sm" className="p-4">
        <Text strong>Hoy</Text>
        {["Orden 1042 lista", "Cita 10:30 · Toyota Hilux", "Factura 88 pagada"].map((t) => (
          <Box key={t} className="rounded-xl bg-[var(--kora-surface-2)] p-3 text-sm">{t}</Box>
        ))}
      </Stack>
    </PhoneFrame>
  );
}
