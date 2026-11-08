"use client";
import { useState } from "react";
import { Checkbox, Stack } from "kora-ui";

export default function Demo() {
  const [email, setEmail] = useState(true);
  return (
    <Stack className="justify-start gap-3">
      <Checkbox label="Email me a weekly summary" checked={email} onCheckedChange={(v) => setEmail(v === true)} />
      <Checkbox label="Some rows selected" checked="indeterminate" />
      <Checkbox label="Disabled" disabled />
    </Stack>
  );
}

