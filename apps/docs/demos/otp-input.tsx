"use client";
import { useState } from "react";
import { Field, OtpInput } from "kora-ui";

export default function Demo() {
  const [code, setCode] = useState("");
  return (
    <Field label="Verification code" hint="Paste it or type it. Only digits are kept.">
      <OtpInput value={code} onChange={setCode} />
    </Field>
  );
}

