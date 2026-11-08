# kora-ui-sketch

The sketch (boceto) system: low-fidelity grayscale wireframes from a prompt. Paste a requirements document, get a clickable,
multi-screen prototype, then customize it with drag & drop. Originally «Wireframly».

**This folder is the only source.** The Istmo Code portal (`../portal`) serves these same files inside its proposals:
`portal/scripts/build.mjs` embeds `public/`, `rules.md` and `ai.js` from here. Change the engine here, then run
`node scripts/build.mjs` in the portal.

- **AI generation**: Claude turns your prompt into screens grouped by role/domain
  (management, sales, workshop, field staff on mobile…).
- **Clickable prototype**: sidebar items, buttons, cards and table rows link between screens.
- **Drag & drop editor**: 33 components, inspector for every property, move/duplicate/wrap,
  undo (⌘Z), add/rename/duplicate screens. Renaming a screen updates every link to it.
- **Linked templates**: turn any component into a template, reuse it as `ref`; edit it once and
  every screen updates. A `slot` marks where each screen's content goes, so a role's app shell
  (nav + menu) lives in one place.
- **Block library**: 24 ready-made blocks (login, sign-up, KPI cards, charts, data table, settings,
  pricing, wizard…) with layouts inspired by [shadcn/ui](https://ui.shadcn.com) blocks.
- **Export**: JSON import/export, print/PDF of every screen.
- **Zero dependencies**: Node ≥ 22 and a browser, nothing to install or compile.

## Run

```bash
npm run dev:sketch        # from the kora-ui root: http://localhost:3461
```

Put `ANTHROPIC_API_KEY` in `packages/kora-ui-sketch/.env`. Without it the editor still works; only "Generar con IA" needs it.

| Variable | Default | |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | none | required for AI generation |
| `MODEL` | `claude-sonnet-5-5` | any Claude model id |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | proxy / mock |
| `PORT` | `3000` | |

`server.js` serves `./public` of the folder it runs from first, then this package's `public/`. That is how the
portal's `npm start` adds its own pages (and the private example `vigil.js`) on top of the engine.

## Format

A project is plain JSON, the same thing the AI returns and the editor saves:

```json
{
  "screens": [
    {
      "name": "Dashboard",
      "section": "Management",
      "device": "desktop",
      "root": { "type": "col", "children": [
        { "type": "heading", "text": "Dashboard" },
        { "type": "button", "label": "New order", "variant": "primary", "to": "New order" }
      ]}
    }
  ]
}
```

Components: `row col grid card divider spacer nav sidebar tabs button heading text image stat
chart table list badge alert steps timeline calendar kanban avatar icon input select textarea
date checkbox toggle upload search slot ref`.

Templates are screens with `"template": true`, used as `{ "type": "ref", "name": "<template>", "children": [...] }`.
Detail screens can set `"parent": "<menu screen>"` so the sidebar highlights it.

The prop list lives in `ai.js` (`COMPONENTS`), the house rules in `rules.md`, and the editor defaults in `public/app.js` (`DEFAULTS`).

## Code map

| File | What |
| --- | --- |
| `server.js` | static server + `/api/generate` (streams Claude, returns JSON) |
| `ai.js` | system prompt, component list and the Claude call |
| `rules.md` | house rules added to every generation |
| `public/index.html` | the editor page |
| `public/render.js` | JSON node to DOM, one function per component |
| `public/app.js` | state, sections/screens navigation, drag & drop editor, inspector, and the proposal panel the portal shows |
| `public/style.css` | the lo-fi grayscale look |
| `public/blocks.js` | block library |
| `public/kits.js` | generic kits (access screens…) added to every project |
| `public/arch.js` | architecture diagram (`npm test` checks its layout) |

Adding a component: a renderer in `render.js`, defaults in `DEFAULTS`, a line in `COMPONENTS`.

## License

MIT. Block layouts are inspired by shadcn/ui (MIT); no shadcn code is included.
