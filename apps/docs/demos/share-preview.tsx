"use client";
import { SharePreview, SharePreviews } from "kora-ui";

const site = {
  url: "https://speedcarservices.com/servicios/frenos",
  title: "Frenos y suspensión en Panamá | Speed Car Services",
  description: "Revisión de frenos, cambio de pastillas y discos, alineación y suspensión. Diagnóstico gratis y garantía de 6 meses en todos los trabajos del taller.",
  image: "https://picsum.photos/id/1071/1200/630",
  siteName: "Speed Car Services",
};

export default function Demo() {
  return (
    <div className="space-y-6">
      <SharePreviews {...site} text="Agenda tu revisión de frenos esta semana." />
      <div className="space-y-2">
        <p className="text-sm text-[var(--kora-muted)]">Sin imagen, y X con la tarjeta pequeña (summary)</p>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", alignItems: "start" }}>
          <SharePreview network="whatsapp" {...site} image={undefined} />
          <SharePreview network="x" {...site} card="summary" />
        </div>
      </div>
    </div>
  );
}
