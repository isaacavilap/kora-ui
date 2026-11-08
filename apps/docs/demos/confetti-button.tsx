"use client";
import { ConfettiButton, Inline, toast } from "kora-ui";

export default function Demo() {
  return (
    <Inline>
      <ConfettiButton onClick={() => toast.success("Pedido enviado")}>Enviar pedido</ConfettiButton>
      <ConfettiButton variant="secondary" particles={40} colors={["#25D366", "#128C7E", "#FFD166"]}>Pocas y en verde</ConfettiButton>
    </Inline>
  );
}
