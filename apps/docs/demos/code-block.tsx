"use client";
import { CodeBlock, Stack } from "kora-ui";

const component = `import { Button } from "kora-ui";

export function Save({ pending }: { pending: boolean }) {
  // Blocks repeat clicks while saving
  return <Button loading={pending} type="submit">Save changes</Button>;
}`;

export default function Demo() {
  return (
    <Stack>
      <CodeBlock code={component} language="tsx" title="save.tsx" lineNumbers highlightLines={[4, 5]} />
      <CodeBlock code="npm install kora-ui && npm run dev -- --port 3050 --turbopack --experimental-https" language="bash" />
      <CodeBlock code={`.card {\n  border-radius: 8px;\n  color: #1f62b8; /* A long comment that wraps instead of scrolling when wrap is set on the block */\n}`} language="css" title="card.css" wrap showLanguage={false} />
    </Stack>
  );
}
