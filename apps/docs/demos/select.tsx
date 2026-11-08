"use client";
import { useState } from "react";
import { Field, Select, Stack } from "kora-ui";

const options = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "viewer", label: "Viewer" },
];

export default function Demo() {
  const [role, setRole] = useState<string>();
  return (
    <Stack gap="md" className="max-w-sm">
      <Field label="Library">
        <Select value={role} onValueChange={setRole} options={options} placeholder="Choose a role" />
      </Field>
      <Field label="Native">
        <Select native value={role} onValueChange={setRole} options={options} placeholder="Choose a role" />
      </Field>
    </Stack>
  );
}

