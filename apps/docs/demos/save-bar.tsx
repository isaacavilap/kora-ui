"use client";
import { useState } from "react";
import { Field, Form, Input, SaveBar, toast, Toaster } from "kora-ui";

export default function Demo() {
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  return (
    <Form key={version} className="max-w-md gap-3" onChange={() => setDirty(true)} onSubmit={(e) => { e.preventDefault(); setDirty(false); toast.success("Changes saved."); }}>
      <Toaster />
      <Field label="Company name"><Input defaultValue="Kora Coffee" /></Field>
      <SaveBar className="static m-0 rounded-md border" dirty={dirty} onDiscard={() => { setVersion(version + 1); setDirty(false); }} />
    </Form>
  );
}
