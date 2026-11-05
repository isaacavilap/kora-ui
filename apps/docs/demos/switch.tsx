"use client";
import { useState } from "react";
import { Switch } from "kora-ui";

export default function Demo() {
  const [on, setOn] = useState(true);
  return <Switch label="Send payment alerts" checked={on} onCheckedChange={setOn} />;
}

