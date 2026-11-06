# kora-ui

React components for building admin and analytics dashboards: layout, data tables, charts, and ready-made sign-in, settings, and error screens. Everything works on phones and desktops, in light and dark.

Live docs: **[kora-ui.istmocode.com](https://kora-ui.istmocode.com)**

## Install

```bash
npm install kora-ui@next
```

```ts
import "kora-ui/styles.css";
```

React 18 or 19 is required. Tailwind is not. If your project uses Tailwind, see the layer setup in the docs.

## Usage

```tsx
import { Grid, KpiCard } from "kora-ui";
import { DataTable } from "kora-ui/table";
import { LineChart } from "kora-ui/charts";
import { LoginScreen } from "kora-ui/auth";
import { AccountScreen, ErrorScreen, MembersScreen, OnboardingWizard } from "kora-ui/screens";
```

Screens draw the interface and validate format. Your functions handle the backend:

```tsx
<LoginScreen
  onSubmit={({ email, password }) => signIn(email, password)}
  links={{ forgotPassword: "/forgot-password", register: "/register" }}
/>
```

Sessions, tokens, permissions, and real validation stay in your backend.

## Start faster

- [kora-starter](https://github.com/isaacavilap/kora-starter): base project with Next.js and kora-ui ready to run.
- [kora-ui-mcp](packages/kora-ui-mcp): connects Claude, ChatGPT, Gemini, and other assistants to the components and templates.

## Versions

See [VERSIONING.md](VERSIONING.md).

## Repository

| Path | Contents |
|---|---|
| `packages/kora-ui` | The npm package |
| `packages/kora-ui-mcp` | MCP server for AI assistants |
| `apps/docs` | Docs site, with the Components and Templates sections |

```bash
npm install
npm run build:lib
npm run dev:docs        # Docs at localhost:3000
npm test -w kora-ui
```

After changing the library, run `npm run build:lib` so that the docs pick it up, or keep `npm run dev:lib` running.

The design spec is in `docs/superpowers/specs/2026-11-05-kora-ui-v1-design.md`.

## License

MIT
