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

## License

MIT
