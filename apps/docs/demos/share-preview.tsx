"use client";
import { Grid, SharePreview, SharePreviews, Stack, Text } from "kora-ui";

const site = {
  url: "https://speedcarservices.com/servicios/frenos",
  title: "Frenos y suspensión en Panamá | Speed Car Services",
  description: "Revisión de frenos, cambio de pastillas y discos, alineación y suspensión. Diagnóstico gratis y garantía de 6 meses en todos los trabajos del taller.",
  image: "https://picsum.photos/id/1071/1200/630",
  siteName: "Speed Car Services",
};

export default function Demo() {
  return (
    <Stack gap="md">
      <SharePreviews {...site} text="Agenda tu revisión de frenos esta semana." />
      <Stack gap="sm">
        <Text tone="muted">Sin imagen, y X con la tarjeta pequeña (summary)</Text>
        <Grid min="320px" className="items-start">
          <SharePreview network="whatsapp" {...site} image={undefined} />
          <SharePreview network="x" {...site} card="summary" />
        </Grid>
      </Stack>
    </Stack>
  );
}
