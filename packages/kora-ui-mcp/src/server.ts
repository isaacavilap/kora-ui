import { McpServer, WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import catalog from "./catalog.json";

type Prop = { name: string; type: string; description: string };
type Component = { slug: string; name: string; description: string; notes?: string; from: string; group: string; props?: Prop[]; example?: string };
type Template = { slug: string; name: string; group: string; from: string; description: string; source: string };

const components = catalog.components as Component[];
const templates = catalog.templates as Template[];

export const RULES = `kora-ui ${catalog.version}: React components for admin and analytics dashboards.

Setup
- Install: npm install kora-ui@next lucide-react
- Global CSS with Tailwind v4:
  @layer theme, base, kora, components, utilities;
  @import "tailwindcss";
  @import "kora-ui/styles.css" layer(kora);
- Without Tailwind: import "kora-ui/styles.css" once in the root layout.
- Wrap the app in KoraProvider. Next.js: <KoraProvider linkComponent={Link} locale="es" brand={{ name, logo }}>. It must be in a "use client" file.
- Add <ThemeScript /> in <head>, and suppressHydrationWarning on <html>, so the saved theme applies before the first paint.

Native tags
- Never write native tags such as div, form, p, span, h1, ul, a, or section in a page. The npm script check:tags fails if you do.
- Use Box, Stack, Inline, Grid, List, ListItem, Form, FormActions, Fieldset, Text, Heading, and KoraLink.
- A real exception is the svg of a logo.

Entry points
- kora-ui: layout, forms, overlays, widgets, KPIs
- kora-ui/table: DataTable, FilterBar
- kora-ui/charts: LineChart, AreaChart, BarChart, and others
- kora-ui/auth: login, register, password, and verification screens
- kora-ui/screens: AccountScreen, MembersScreen, ErrorScreen, OnboardingWizard

Rules
- Look up a component before writing your own: search_kora, then get_component. Do not guess props.
- Start a page from the closest template: list_templates, then get_template.
- Frame every page with AppShell, Sidebar, Topbar, and BottomNav. Start each page with PageHeader.
- Use DataTable for lists, not a table you build. Use its column filters, not your own.
- Use ConfirmDialog in place of window.confirm, and toast in place of window.alert.
- Colors come from CSS variables, such as var(--kora-accent) and var(--kora-muted). Do not hardcode colors. The theme handles light and dark.
- Every page must work from 320px to desktop. DataTable becomes cards on phones, so keep it that way.
- Use lucide-react for interface icons, with aria-hidden. Icon-only buttons need aria-label.
- Screens only draw the interface. Sessions, permissions, and real validation stay in your backend.
- Template data and the DemoShell come from the docs site. Replace them with your data and your own AppShell layout.`;

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const miss = (kind: string, slug: string, tool: string) => ({
  ...text(`No ${kind} named "${slug}". Call ${tool} to see the valid slugs.`),
  isError: true,
});
const line = (item: { slug: string; name: string; description: string }) => `${item.slug} (${item.name}): ${item.description}`;

/** Every word must appear in the item. Matches in the name rank first. */
export function search(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const all = [
    ...components.map((c) => ({ kind: "component", item: c as { slug: string; name: string; description: string }, haystack: `${c.name} ${c.slug} ${c.group} ${c.description} ${c.props?.map((p) => p.name).join(" ") ?? ""}` })),
    ...templates.map((t) => ({ kind: "template", item: t as { slug: string; name: string; description: string }, haystack: `${t.name} ${t.slug} ${t.group} ${t.description}` })),
  ];
  const inName = (name: string) => Number(words.some((word) => name.toLowerCase().includes(word)));
  return all
    .filter((entry) => words.every((word) => entry.haystack.toLowerCase().includes(word)))
    .sort((a, b) => inName(b.item.name) - inName(a.item.name));
}

export function createServer() {
  const server = new McpServer({ name: "kora-ui", version: catalog.version }, { instructions: RULES });

  server.registerTool("get_setup", { description: "How to install kora-ui, the rules for using it, and the source of a complete app shell. Call this first." }, async () =>
    text(`${RULES}\n\nApp shell example, with a sidebar, company switcher, topbar, and bottom menu:\n\n${catalog.shell}`),
  );

  server.registerTool(
    "list_components",
    { description: "Lists every kora-ui component, with its group and purpose.", inputSchema: z.object({ group: z.string().optional().describe("Only this group, such as Layout or Data.") }) },
    async ({ group }) => {
      const found = components.filter((c) => !group || c.group.toLowerCase() === group.toLowerCase());
      return text(found.map((c) => `[${c.group}] ${line(c)}`).join("\n") || `No group named "${group}". Groups: ${[...new Set(components.map((c) => c.group))].join(", ")}`);
    },
  );

  server.registerTool(
    "get_component",
    { description: "Returns one component: its import, props, and a working example.", inputSchema: z.object({ slug: z.string().describe("Slug from list_components, such as data-table.") }) },
    async ({ slug }) => {
      const component = components.find((c) => c.slug === slug);
      if (!component) return miss("component", slug, "list_components");
      const props = component.props?.map((p) => `- ${p.name}: ${p.type}. ${p.description}`).join("\n");
      return text([
        `# ${component.name}`,
        component.notes ? `${component.description} ${component.notes}` : component.description,
        `Import from "${component.from}".`,
        props && `Props:\n${props}`,
        component.example && `Example:\n\`\`\`tsx\n${component.example}\n\`\`\``,
      ].filter(Boolean).join("\n\n"));
    },
  );

  server.registerTool(
    "list_templates",
    { description: "Lists complete pages to start from: dashboards, admin screens, multiple companies, access, settings, and errors." },
    async () => text(templates.map((t) => `[${t.group}] ${line(t)}`).join("\n")),
  );

  server.registerTool(
    "get_template",
    { description: "Returns the full source of a page. Replace its DemoShell with your AppShell layout, and its demo data with your data.", inputSchema: z.object({ slug: z.string().describe("Slug from list_templates, such as report.") }) },
    async ({ slug }) => {
      const template = templates.find((t) => t.slug === slug);
      if (!template) return miss("template", slug, "list_templates");
      return text(`# ${template.name}\n\n${template.description}\n\n\`\`\`tsx\n${template.source}\n\`\`\``);
    },
  );

  server.registerTool(
    "search_kora",
    { description: "Finds components and templates by words, such as \"filter table\" or \"calendar\".", inputSchema: z.object({ query: z.string().min(1) }) },
    async ({ query }) => {
      const found = search(query);
      return text(found.map((f) => `[${f.kind}] ${line(f.item)}`).join("\n") || `Nothing matches "${query}". Try one word, or call list_components.`);
    },
  );

  return server;
}

/** Remote MCP for a web route. It keeps no session, so each request gets its own server. */
export async function handleMcpRequest(request: Request) {
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await createServer().connect(transport);
  return transport.handleRequest(request);
}

/** The same knowledge as a single text file, for assistants with no MCP support. */
export function llmsTxt(baseUrl: string) {
  return [
    "# kora-ui",
    "",
    RULES,
    "",
    "## Components",
    ...components.map((c) => `- [${c.name}](${baseUrl}/components/${c.slug}), from "${c.from}": ${c.description}`),
    "",
    "## Templates",
    ...templates.map((t) => `- [${t.name}](${baseUrl}/templates/${t.slug}): ${t.description}`),
    "",
    `MCP server: ${baseUrl}/mcp (remote), or npx -y kora-ui-mcp@next (local).`,
    "",
  ].join("\n");
}
