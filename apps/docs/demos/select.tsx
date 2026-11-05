"use client";
import { useState } from "react";
import { Field, Select } from "kora-ui";

const options = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "viewer", label: "Viewer" },
];

export default function Demo() {
  const [role, setRole] = useState<string>();
  return (
    <Field label="Role" className="max-w-sm">
      <Select value={role} onValueChange={setRole} options={options} placeholder="Choose a role" />
    </Field>
  );
}

