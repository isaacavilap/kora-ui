"use client";
import { SocialFloat } from "kora-ui";

// The transform makes this box the frame of the fixed buttons, so they stay inside the demo.
export default function Demo() {
  return (
    <div className="relative h-72 overflow-hidden rounded-lg border border-[var(--kora-line)] bg-[var(--kora-surface-2)]" style={{ transform: "translateZ(0)" }}>
      <SocialFloat
        label="¿Dudas? Escríbenos"
        message="Hola, quiero agendar una cita."
        contacts={[
          { name: "Ventas", to: "+507 6000-0001", detail: "WhatsApp, lun a vie, 8:00 a 17:00" },
          { name: "Instagram", network: "instagram", to: "@mitienda", detail: "Mensaje directo" },
          { name: "Correo", network: "email", to: "hola@mitienda.com" },
          { name: "Llamar al taller", network: "phone", to: "+507 6000-0002", detail: "Vía España" },
        ]}
      />
      <SocialFloat position="top-left" contacts={[{ name: "Soporte", to: "+507 6000-0003" }]} />
      <SocialFloat position="top-right" contacts={[{ name: "Soporte", network: "telegram", to: "mitienda_soporte" }]} />
    </div>
  );
}
