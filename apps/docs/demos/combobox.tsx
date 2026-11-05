"use client";
import { useState } from "react";
import { Combobox, Field } from "kora-ui";

const countries = ["Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica", "Ecuador", "Mexico", "Panama", "Peru", "Uruguay"].map((c) => ({ value: c.toLowerCase(), label: c }));

export default function Demo() {
  const [country, setCountry] = useState<string>();
  return (
    <Field label="Country" className="max-w-sm">
      <Combobox options={countries} value={country} onChange={setCountry} placeholder="Choose a country" />
    </Field>
  );
}

