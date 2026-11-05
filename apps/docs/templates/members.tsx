"use client";
import { useState } from "react";
import { Toaster } from "kora-ui";
import { MembersScreen, type TeamMember } from "kora-ui/screens";
import { wait } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "viewer", label: "Viewer" },
];

export default function Template() {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "Marta Ríos", email: "marta@example.com", role: "owner" },
    { id: "2", name: "Tomás Vega", email: "tomas@example.com", role: "admin" },
    { id: "3", name: "Lucía Herrera", email: "lucia@example.com", role: "viewer" },
    { id: "4", name: "Diego Paredes", email: "diego@example.com", role: "viewer", status: "invited" },
  ]);
  return (
    <DemoShell page="members" title="Members">
      <Toaster />
      <MembersScreen
        members={members}
        roles={roles}
        canManage
        onInvite={async ({ email, role }) => {
          await wait();
          setMembers((all) => [...all, { id: email, name: email.split("@")[0]!, email, role, status: "invited" }]);
        }}
        onRoleChange={async (member, role) => {
          await wait(300);
          setMembers((all) => all.map((m) => (m.id === member.id ? { ...m, role } : m)));
        }}
        onRemove={async (member) => {
          await wait(400);
          setMembers((all) => all.filter((m) => m.id !== member.id));
        }}
      />
    </DemoShell>
  );
}

