import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = { title: "Get started" };

export default function GetStarted() {
  return (
    <main className="prose-docs mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <h1 className="text-2xl font-semibold">Get started</h1>
      <p className="mt-2 text-[var(--kora-muted)]">Install the package, import one stylesheet, and use it in any React 18 or 19 app. Tailwind is not required.</p>

      <h2>Start from the base project</h2>
      <p>The fastest way. It comes with Next.js, the menu, sign-in screens, and sample pages ready to run, and it is set up for AI assistants.</p>
      <CodeBlock lang="bash" code={`npx degit isaacavilap/kora-starter my-app
cd my-app && npm install && npm run dev`} />

      <h2>Or add it to your project</h2>

      <h2>1. Install</h2>
      <CodeBlock lang="bash" code="npm install kora-ui@next" />

      <h2>2. Import the styles</h2>
      <p>Import them once, at the top of your global CSS or root layout.</p>
      <CodeBlock lang="ts" code={`import "kora-ui/styles.css";`} />
      <p className="mt-3">If your project uses Tailwind, declare the layer order so that your utility classes can override kora-ui.</p>
      <CodeBlock
        lang="css"
        code={`@layer theme, base, kora, components, utilities;

@import "tailwindcss";
@import "kora-ui/styles.css" layer(kora);`}
      />

      <h2>3. Set up the provider</h2>
      <p>This step is optional. It sets the language, the brand used by screens, and your router's link.</p>
      <CodeBlock
        code={`"use client";
import Link from "next/link";
import { KoraProvider } from "kora-ui";

export function Providers({ children }) {
  return (
    <KoraProvider locale="es" linkComponent={Link} brand={{ name: "Acme", logo: <Logo /> }}>
      {children}
    </KoraProvider>
  );
}`}
      />

      <h2>4. Build a screen</h2>
      <p>Each entry point loads only what it needs, so a page without charts does not load the chart library.</p>
      <CodeBlock
        code={`import { Button, KpiCard } from "kora-ui";
import { DataTable } from "kora-ui/table";
import { LineChart } from "kora-ui/charts";
import { LoginScreen } from "kora-ui/auth";
import { AccountScreen, MembersScreen } from "kora-ui/screens";`}
      />

      <h2>Connect the sign-in screens</h2>
      <p>Screens draw the interface and check the format. Your function does the work. If it throws, the screen shows a message that does not reveal whether the account exists. Sessions, tokens, and permissions stay in your backend.</p>
      <CodeBlock
        code={`<LoginScreen
  onSubmit={async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.push("/dashboard");
  }}
  links={{ forgotPassword: "/forgot-password", register: "/register" }}
/>`}
      />

      <h2>Make it yours</h2>
      <p>Every project shares one look. Change the brand with CSS variables, and use the dark class for dark mode.</p>
      <CodeBlock
        lang="css"
        code={`:root {
  --kora-accent: #5b3fd6;
  --kora-accent-hover: #4b31b8;
  --kora-accent-soft: #ece8fb;
  --kora-radius: 8px;
  --kora-font: "Inter", sans-serif;
}

/* Light and dark are separate token sets. Set both. */
.dark {
  --kora-accent: #a493f2;
  --kora-accent-fg: #17102f;
}`}
      />
      <p className="mt-3">Add <code>class="dark"</code> to any ancestor for dark mode, and <code>data-density="compact"</code> for denser tables and controls.</p>

      <h2>Phones and desktops</h2>
      <p>Everything adapts without extra props. The sidebar becomes a drawer, table rows become cards, dialogs rise from the bottom, and controls grow to touch size. Try it in the <Link href="/templates" className="text-[var(--kora-accent)] underline underline-offset-2">templates</Link> with the phone width.</p>
    </main>
  );
}

