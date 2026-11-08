// Wireframe generation with Claude: system prompt, tool schema and the streamed Messages call.
const COMPONENTS = `
Layout:
- row {gap?, align?: "start"|"center"|"end"|"between", children} — horizontal flex, wraps
- col {flex?: number (relative width inside a row, default 1), gap?, children} — vertical stack
- card {title?, children} — bordered box
- grid {cols: number, children} — equal columns
- sidebar {switcher?: boolean, title?, items: string[], active?: number} — left vertical nav (inside a row with a col). Items starting with "# " are group titles. switcher: true shows a select to change between apps (sections).
- appswitch {label?} — standalone select to change between apps (sections)
- nav {title, items: string[], create?: string[], search?: string, alerts?: number, user?: string} — top bar. create lists screen names of always-available create forms, shown as a "+ Crear" menu
- tabs {items: string[], active?: number}
- divider {}
- spacer {size?: number}
Content:
- heading {text, level?: 1|2|3}
- text {text?, lines?: number} — no text = gray placeholder lines
- image {label?, height?: number} — crossed placeholder box (photos, drawings, maps)
- avatar {label?}
- icon {label} — small square
- badge {text, tone?: "ok"|"warn"|"danger"|"neutral"}
- alert {text, tone?: "ok"|"warn"|"danger"|"neutral"}
- stat {label, value, hint?} — KPI tile
- chart {kind: "bar"|"line"|"pie", label?, height?}
- table {columns: string[], rows?: number (placeholder rows, default 5), data?: string[][]}
- list {items: string[]}
- steps {items: string[], active?: number} — progress / pipeline stages
- calendar {label?, view?: "month"|"week"}
- kanban {columns: string[], cards?: string[][] (cards[i] = card texts of column i, "Title · detail"), to?} — board
- timeline {items: string[]} — history / audit log
Forms:
- input {label, placeholder?}
- select {label, placeholder?, options?: string[]}
- textarea {label, rows?: number}
- checkbox {label}
- toggle {label}
- date {label}
- upload {label} — dashed drop zone for photos/files
- search {placeholder?}
- button {label, variant?: "primary"|"secondary"|"ghost"}
Reuse:
- slot {} — only inside a template: where each screen's own content goes
- ref {name: "<template name>", children} — linked instance of a template; children fill its slot
`;

const SYSTEM = `You are a UX designer producing LOW-FIDELITY wireframes as a JSON component tree.
Use ONLY these components (field "type" = component name, other fields = props, "children" = array of nodes):
${COMPONENTS}
Rules:
- Desktop screens (~1280px wide). "device": "mobile" (next to name/root) = phone view (390px). Typical app shell: nav on top, then row[ sidebar, col{flex:5}[ ...content ] ].
- If the prompt describes a whole system, SPLIT IT INTO A FEW APPS (3–5) by where people work, one section per app (field "section"), e.g. "Gerencia", "Tienda", "Taller", "Campo" for field staff. Screens are responsive (the viewer previews desktop and mobile), so field apps are normal apps; only use "device": "mobile" for phone-only screens. Inside each app group the menu with "# " group titles. Use sidebar switcher: true so users can change app. Management gets overview dashboards; day-to-day workers get focused task screens with only what they need. Never cram everything into one screen.
- Model ENTITIES, not the wording of the brief. Each entity (client, quote, order…) gets its own list, detail and form; never merge two entities in one form (a new-client form has no quote fields).
- Sidebar menus list PLACES only (lists, boards, dashboards, calendars). Create/edit forms and details are NOT menu items: set their "parent" to the list they belong to and reach them by buttons (list header, detail page) and by the nav "create" menu, so frequent actions are available from anywhere.
- Each section has its own app shell, defined ONCE as a template screen: {"name": "Shell · Ventas", "template": true, "root": col[nav, row[sidebar, col{flex:5}[slot]]]}. The sidebar lists ONLY that section's main screens. Every screen of the section is then {"type": "ref", "name": "Shell · Ventas", "children": [...its content]}. Never repeat the shell inline.
- Detail/form screens set "parent" to the menu screen they belong to (highlighted in the sidebar). Include list, detail and form screens for each module (typically 25–45 screens for a full system). Field workers (installers, technicians) get "device": "mobile" screens.
- Do NOT generate login, registration, password recovery or error (403/404) screens: the app adds its own generic "Acceso" kit.
- Set "app" to the system's name.
- Use realistic labels, column names and sample values in the SAME LANGUAGE as the prompt.
- Keep structure meaningful: group related fields in cards, use grid for KPI tiles and form fields.
- INTERACTIVE PROTOTYPE: screens link to each other. Use exact screen names:
  * sidebar/nav/tabs items whose text equals a screen name navigate to it automatically — so name sidebar items exactly like screens.
  * button, card, stat, list accept "to": "<screen name>" to navigate on click (e.g. "Nueva orden" button to the form screen, "Guardar" back to the list).
  * table accepts "rowTo": "<screen name>" — clicking a row opens that detail screen.
  * Every screen must be reachable and every list should link to its detail/form screen.
- Status colors do not exist (grayscale only): express status with badge/alert "tone".
Return the result by calling the "render_wireframe" tool.`;

const TOOL = {
  name: 'render_wireframe',
  description: 'Render the wireframe screens.',
  input_schema: {
    type: 'object',
    required: ['screens'],
    properties: {
      app: { type: 'string', description: 'Name of the system' },
      screens: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'root'],
          properties: {
            name: { type: 'string' },
            section: { type: 'string', description: 'Role or domain this screen belongs to' },
            template: { type: 'boolean', description: 'Reusable template used via ref, not a page' },
            parent: { type: 'string', description: 'Menu screen to highlight for detail/form screens' },
            device: { type: 'string', enum: ['desktop', 'mobile'] },
            root: { type: 'object', description: 'Root component node: {type, ...props, children?}' },
          },
        },
      },
    },
  },
};

// Anthropic Messages API: api.anthropic.com locally, or the Neon AI Gateway's /anthropic route in production.
export async function generate(prompt, { baseUrl, apiKey, model, rules = '' }) {
  if (!apiKey) throw new Error('Falta la clave de IA (ANTHROPIC_API_KEY o NEON_AI_GATEWAY_TOKEN)');
  // Streamed: a full system can be ~40k output tokens, too long for a single non-streaming request.
  const res = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      authorization: `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 64000,
      stream: true,
      system: `${SYSTEM}\n\n${rules}`,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || `Anthropic ${res.status}`);
  }
  // Collect the tool input JSON from server-sent events.
  let json = '', buffer = '', stop = '';
  const decoder = new TextDecoder();
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const ev = JSON.parse(line.slice(6));
      if (ev.type === 'content_block_delta' && ev.delta.type === 'input_json_delta') json += ev.delta.partial_json;
      else if (ev.type === 'message_delta') stop = ev.delta.stop_reason;
      else if (ev.type === 'error') throw new Error(ev.error.message);
    }
  }
  if (stop === 'max_tokens') throw new Error('Respuesta demasiado larga: divide los requerimientos por módulos.');
  if (!json) throw new Error('El modelo no devolvió wireframe');
  return JSON.parse(json);
}
