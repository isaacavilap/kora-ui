"use client";
import { AcceptInviteScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  return (
    <AcceptInviteScreen
      brand={brand}
      organization="Kora Coffee"
      inviter="Marta Ríos"
      role="Admin"
      email="tomas@example.com"
      newAccount
      onAccept={async () => {
        await wait();
        window.location.href = "/preview/onboarding";
      }}
      onDecline={() => wait()}
    />
  );
}

