"use client";
import { useState } from "react";
import { Field, Input, SaveBar, toast, Toaster } from "kora-ui";

export default function Demo() {
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  return (
    <form key={version} className="grid max-w-md gap-3" onChange={() => setDirty(true)} onSubmit={(e) => { e.preventDefault(); setDirty(false); toast.success("Changes saved."); }}>
      <Toaster />
      <Field label="Company name"><Input defaultValue="Kora Coffee" /></Field>
      <SaveBar className="static m-0 rounded-md border" dirty={dirty} onDiscard={() => { setVersion(version + 1); setDirty(false); }} />
    </form>
  );
}
