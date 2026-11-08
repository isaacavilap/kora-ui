"use client";
import { useState } from "react";
import { Combobox, Field, Stack } from "kora-ui";

const countries = ["Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica", "Ecuador", "Mexico", "Panama", "Peru", "Uruguay"].map((c) => ({ value: c.toLowerCase(), label: c }));

export default function Demo() {
  const [country, setCountry] = useState<string>();
  const [several, setSeveral] = useState<string[]>([]);
  return (
    <Stack className="max-w-sm">
      <Field label="Country"><Combobox options={countries} value={country} onChange={setCountry} placeholder="Choose a country" /></Field>
      <Field label="Countries"><Combobox multiple options={countries} value={several} onChange={setSeveral} placeholder="Choose several" /></Field>
    </Stack>
  );
}

