"use client";
import { useState } from "react";
import { Checkbox } from "kora-ui";

export default function Demo() {
  const [email, setEmail] = useState(true);
  return (
    <div className="grid justify-start gap-3">
      <Checkbox label="Email me a weekly summary" checked={email} onCheckedChange={(v) => setEmail(v === true)} />
      <Checkbox label="Some rows selected" checked="indeterminate" />
      <Checkbox label="Disabled" disabled />
    </div>
  );
}

