"use client";
import { useState } from "react";
import { AccountScreen } from "kora-ui/screens";
import { wait } from "@/lib/demo-data";
import { DemoShell } from "./shell";

export default function Template() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState([
    { id: "1", device: "MacBook Pro, Safari", detail: "Panama City. Active now", current: true },
    { id: "2", device: "iPhone 17, Mobile Safari", detail: "Panama City. Yesterday" },
    { id: "3", device: "Windows, Edge", detail: "Bogotá. October 28" },
  ]);
  return (
    <DemoShell page="account" title="Account">
      <AccountScreen
        user={{ name: "Marta Ríos", email: "marta@example.com" }}
        onSaveProfile={() => wait()}
        onChangePassword={() => wait()}
        security={{
          twoFactorEnabled: twoFactor,
          onToggleTwoFactor: async (enabled) => {
            await wait(400);
            setTwoFactor(enabled);
          },
          recoveryCodes: twoFactor ? ["7F3K-92QD", "M4XT-81PL", "Z9WB-46RC", "H2NV-73JY", "Q8LS-15TG", "C6DF-09KE"] : undefined,
        }}
        sessions={{
          sessions,
          onRevoke: async (id) => {
            await wait(400);
            setSessions((all) => all.filter((s) => s.id !== id));
          },
          onRevokeOthers: async () => {
            await wait(400);
            setSessions((all) => all.filter((s) => s.current));
          },
        }}
      />
    </DemoShell>
  );
}

