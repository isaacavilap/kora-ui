"use client";
import { useState } from "react";
import { CodeBlock, CodeEditor, Field, Stack } from "kora-ui";

export default function Demo() {
  const [css, setCss] = useState(".banner {\n  background: #f7f1e1;\n  padding: 16px;\n}");
  return (
    <Stack>
      <Field label="Custom CSS" hint="Tab indents. Press Escape, then Tab, to leave the editor.">
        <CodeEditor name="css" language="css" value={css} onChange={setCss} rows={6} />
      </Field>
      <Field label="Payload">
        <CodeEditor name="payload" language="json" defaultValue={'{\n  "event": "order.paid",\n  "amount": 42.5\n}'} rows={5} />
      </Field>
      <CodeBlock code={css} language="css" title="Saved value" />
    </Stack>
  );
}
