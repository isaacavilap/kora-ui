"use client";
import { useState } from "react";
import { ScopeSwitcher, Stack } from "kora-ui";

const options = [
  { value: "all", label: "All companies", description: "Totals for the group" },
  { value: "coffee", label: "Kora Coffee", description: "Coffee shops", group: "Companies" },
  { value: "roasters", label: "Norte Roasters", description: "Roasting plant", group: "Companies" },
];

export default function Demo() {
  const [value, setValue] = useState("coffee");
  return <Stack gap="none" className="max-w-56"><ScopeSwitcher label="company" options={options} value={value} onChange={setValue} /></Stack>;
}
