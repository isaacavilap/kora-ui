import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = { title: "Build with AI", alternates: { canonical: "/ai" } };

export default function BuildWithAI() {
  return (
    <main className="prose-docs mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <h1 className="text-2xl font-semibold">Build with AI</h1>
      <p className="mt-2 text-[var(--kora-muted)]">Connect your assistant to kora-ui. It then reads the real props, examples, and page templates, and does not guess at the API.</p>

      <h2>Claude Code</h2>
      <CodeBlock lang="bash" code="claude mcp add kora-ui -- npx -y kora-ui-mcp@next" />

      <h2>Gemini CLI</h2>
      <p>Add this to <code>~/.gemini/settings.json</code>. Cursor and Claude Desktop take the same format in their own settings file.</p>
      <CodeBlock lang="json" code={`{
  "mcpServers": {
    "kora-ui": { "command": "npx", "args": ["-y", "kora-ui-mcp@next"] }
  }
}`} />

      <h2>Codex CLI</h2>
      <p>Add this to <code>~/.codex/config.toml</code>.</p>
      <CodeBlock lang="toml" code={`[mcp_servers.kora-ui]
command = "npx"
args = ["-y", "kora-ui-mcp@next"]`} />

      <h2>ChatGPT and other web apps</h2>
      <p>Web apps cannot start a local server, so add this address as a connector.</p>
      <CodeBlock lang="text" code="https://kora-ui.istmocode.com/mcp" />

      <h2>Assistants with no connectors</h2>
      <p>Paste or link <a href="/llms.txt">llms.txt</a>. It has the setup, the rules, and a link to each component and template.</p>

      <h2>What to ask</h2>
      <CodeBlock lang="text" code={`Use kora-ui to build a page for my invoices: numbers on top,
a table with filters by status and date, and CSV export.`} />
    </main>
  );
}
