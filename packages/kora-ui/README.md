# kora-ui

[![npm version](https://img.shields.io/npm/v/kora-ui.svg)](https://www.npmjs.com/package/kora-ui)
[![npm downloads](https://img.shields.io/npm/dm/kora-ui.svg)](https://www.npmjs.com/package/kora-ui)
[![bundle size](https://img.shields.io/bundlephobia/minzip/kora-ui)](https://bundlephobia.com/package/kora-ui)
[![types](https://img.shields.io/npm/types/kora-ui.svg)](https://www.npmjs.com/package/kora-ui)
[![React 18 | 19](https://img.shields.io/badge/react-18%20%7C%2019-61dafb.svg)](https://react.dev)
[![license: MIT](https://img.shields.io/npm/l/kora-ui.svg)](./LICENSE)

React components for building admin and analytics dashboards: layout, data tables, charts, and ready-made sign-in, settings, and error screens. Everything works on phones and desktops, in light and dark.

**Docs and live examples: [kora-ui.istmocode.com](https://kora-ui.istmocode.com)**

- **Phones and desktops.** The sidebar becomes a drawer, table rows become cards, dialogs rise from the bottom, and controls grow to touch size, all without extra props.
- **Light, dark, and your brand.** You change the look with CSS variables. Light and dark are separate token sets.
- **No Tailwind required.** You import one stylesheet. If your project uses Tailwind, kora-ui sits in its own CSS layer.
- **Loads only what you use.** Tables, charts, auth, and screens are separate entry points, so a page without charts does not load the chart library.
- **Spanish and English.** Every built-in label comes in `es` and `en`, and you can override any of them.
- **Accessible.** It is built on Radix primitives, with keyboard navigation, focus rings, and screen-reader labels.

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [Entry points](#entry-points)
- [Components](#components)
- [Examples](#examples)
- [Theming](#theming)
- [Tailwind projects](#tailwind-projects)
- [Next.js notes](#nextjs-notes)
- [AI assistants](#ai-assistants)
- [Versions](#versions)
- [License](#license)

## Install

```bash
npm install kora-ui
```

| Requirement | Version |
|---|---|
| React and React DOM | 18 or 19 |
| Node (for your build) | 20 or newer |
| Tailwind | Not required |

The fastest way to start is the base project. It comes with Next.js, the menu, sign-in screens, and sample pages ready to run:

```bash
npx degit isaacavilap/kora-starter my-app
cd my-app && npm install && npm run dev
```

## Quick start

**1. Import the styles** once, at the top of your global CSS or root layout:

```ts
import "kora-ui/styles.css";
```

**2. Add the provider.** This step is optional. It sets the language, the brand that screens show, and your router's link component:

```tsx
"use client";
import Link from "next/link";
import { KoraProvider } from "kora-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KoraProvider locale="es" linkComponent={Link} brand={{ name: "Acme", logo: <Logo /> }}>
      {children}
    </KoraProvider>
  );
}
```

**3. Build a screen:**

```tsx
import { Grid, KpiCard } from "kora-ui";

export default function Overview() {
  return (
    <Grid>
      <KpiCard label="Revenue" value="$84,300" delta={7.3} deltaLabel="vs last month" trend={[61, 59, 65, 70, 74, 79, 84]} />
      <KpiCard label="Refund rate" value="1.8%" delta={-0.4} invertDelta deltaLabel="vs last month" />
      <KpiCard label="Orders" value="" loading />
    </Grid>
  );
}
```

## Entry points

| Import | What it has | Extra weight |
|---|---|---|
| `kora-ui` | Layout, forms, overlays, data display, dashboard widgets, theme tools | — |
| `kora-ui/table` | `DataTable`, `FilterBar`, `FilterSelect`, `toCsv`, `toXlsx` | Table engine |
| `kora-ui/charts` | `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `Sparkline` | Chart library |
| `kora-ui/auth` | Sign-in, sign-up, password, verification, and invitation screens | — |
| `kora-ui/screens` | Account, settings, members, onboarding, and error screens | — |
| `kora-ui/styles.css` | All the styles, which you import once | — |
| `kora-ui/styles-layer.css` | Cascade layer order, for Tailwind projects | — |

## Components

The [docs](https://kora-ui.istmocode.com/components) have a live example of each component.

| Group | Components |
|---|---|
| Layout | `AppShell`, `Sidebar`, `SidebarSection`, `SidebarItem`, `SidebarGroup`, `SidebarUser`, `Topbar`, `BottomNav`, `PageHeader`, `SaveBar`, `Grid`, `Box`, `Stack`, `Inline`, `Separator` |
| Navigation | `Breadcrumbs`, `Tabs`, `SectionNav`, `Pagination`, `Stepper`, `CommandPalette`, `ScopeSwitcher`, `UserMenu`, `NotificationsMenu`, `SegmentedControl` |
| Forms | `Form`, `FormActions`, `Field`, `Fieldset`, `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Switch`, `OtpInput`, `DateRangePicker`, `FileDropzone`, `FileDrop`, `ImageInput`, `Mentions`, `EmojiPicker`, `Rating` |
| Overlays | `Dialog`, `ConfirmDialog`, `Sheet`, `DropdownMenu`, `Tooltip`, `Toaster` with `toast()` |
| Data display | `Card`, `Badge`, `Avatar`, `GeneratedAvatar`, `DescriptionList`, `List`, `Timeline`, `EmptyState`, `Skeleton`, `Spinner`, `Alert`, `Heading`, `Text`, `FileName` |
| Dashboard widgets | `KpiCard`, `StatGroup`, `Delta`, `Progress`, `ChartCard`, `Funnel`, `Gauge`, `Heatmap`, `SegmentBar`, `RankedList`, `StageCounters`, `AlertList`, `DocumentList`, `QuickActions`, `Kanban`, `EventCalendar` |
| Tables (`kora-ui/table`) | `DataTable` with search, sorting, filters, column toggle, row selection, and CSV or Excel export, plus `FilterBar` and `FilterSelect` |
| Charts (`kora-ui/charts`) | `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `Sparkline` |
| Media and sharing | `VideoPlayer`, `PdfViewer`, `QRCode`, `QRReader`, `PhoneFrame`, `SharePreview`, `SocialFloat`, `ConfettiButton` |
| Code | `CodeBlock`, `CodeEditor`, `JsonViewer` |
| Theme | `ThemeScript`, `ThemeToggle`, `ThemeColors` |

### Ready-made screens

| Entry point | Screens |
|---|---|
| `kora-ui/auth` | `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `ResetPasswordScreen`, `VerifyEmailScreen`, `OtpScreen`, `AcceptInviteScreen`, `AuthLayout` |
| `kora-ui/screens` | `AccountScreen`, `ProfileSettings`, `PasswordSettings`, `SecuritySettings`, `SessionsSettings`, `MembersScreen`, `InviteMemberDialog`, `OnboardingWizard`, `ErrorScreen` |

Screens draw the interface and check the format of what people type. Your functions do the real work. Sessions, tokens, permissions, and real validation stay in your backend.

## Examples

### App frame with a sidebar

```tsx
import { AppShell, Avatar, Button, Sidebar, SidebarGroup, SidebarItem, SidebarSection, Text, Topbar } from "kora-ui";
import { Home, Settings, ShoppingCart } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={
        <Sidebar brand={{ name: "Kora Coffee" }}>
          <SidebarSection>
            <SidebarItem href="/" icon={<Home aria-hidden />}>Overview</SidebarItem>
            <SidebarGroup label="Sales" icon={<ShoppingCart aria-hidden />}>
              <SidebarItem href="/orders" active badge={12}>Orders</SidebarItem>
              <SidebarItem href="/refunds">Refunds</SidebarItem>
            </SidebarGroup>
            <SidebarItem href="/settings" icon={<Settings aria-hidden />}>Settings</SidebarItem>
          </SidebarSection>
        </Sidebar>
      }
      topbar={
        <Topbar>
          <Text inline strong className="mr-auto">Orders</Text>
          <Button size="sm" variant="secondary">Export</Button>
          <Avatar name="Marta Ríos" size={28} />
        </Topbar>
      }
    >
      {children}
    </AppShell>
  );
}
```

The sidebar remembers whether it is collapsed. It saves the choice in `localStorage` and in the `kora-sidebar-collapsed` cookie. To render the right state on the first paint (no open-then-close flash), read the cookie on the server and pass it in:

```tsx
// app/layout.tsx (Next.js server component)
import { cookies } from "next/headers";

const collapsed = (await cookies()).get("kora-sidebar-collapsed")?.value === "1";
// …
<AppShell defaultCollapsed={collapsed} sidebar={…}>{children}</AppShell>
```

`collapseMode="hidden"` removes the sidebar instead of shrinking it to icons. `collapsed` with `onCollapsedChange` makes the state controlled.

### Data table

```tsx
import { Badge } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";

type Order = { id: string; customer: string; status: "paid" | "pending"; date: string; total: number };

const columns: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", accessor: "id", sortable: true },
  { id: "customer", header: "Customer", accessor: "customer", sortable: true },
  { id: "status", header: "Status", accessor: "status", filter: { type: "select" }, cell: (o) => <Badge>{o.status}</Badge> },
  { id: "date", header: "Date", accessor: "date", sortable: true, filter: { type: "date" }, hideOnMobile: true },
  { id: "total", header: "Total", accessor: "total", sortable: true, align: "right" },
];

<DataTable columns={columns} data={orders} getRowId={(o) => o.id} searchable searchPlaceholder="Search orders" columnToggle />;
```

On phones the rows become cards, and columns with `hideOnMobile` are left out of the cards.

### Chart

```tsx
import { LineChart } from "kora-ui/charts";

<LineChart
  summary="Revenue and costs by month"
  data={[{ month: "Jan", revenue: 61, costs: 40 }, { month: "Feb", revenue: 65, costs: 42 }]}
  x="month"
  series={[
    { key: "revenue", label: "Revenue" },
    { key: "costs", label: "Costs" },
  ]}
/>;
```

`summary` is the text that screen readers announce for the chart.

### Sign-in screen

```tsx
import { LoginScreen } from "kora-ui/auth";

<LoginScreen
  onSubmit={async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.push("/dashboard");
  }}
  links={{ forgotPassword: "/forgot-password", register: "/register" }}
/>;
```

When your function throws, the screen shows a message that does not reveal whether the account exists.

### Toasts and confirmations

```tsx
import { Button, ConfirmDialog, Toaster, toast } from "kora-ui";

// Once, near the root:
<Toaster />;

<Button onClick={() => toast.success("Saved")}>Save</Button>;

<ConfirmDialog open={open} onOpenChange={setOpen} title="Delete order?" danger confirmLabel="Delete" onConfirm={remove} />;
```

## Theming

Every project shares one look. You change the brand with CSS variables:

```css
:root {
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
}
```

| Option | How |
|---|---|
| Dark mode | Add `class="dark"` to any ancestor, or use `ThemeToggle` |
| No theme flash on load | Render `<ThemeScript />` in `<head>` |
| Denser tables and controls | `data-density="compact"` on any ancestor |
| Language | `<KoraProvider locale="es">` or `"en"` |
| Your router's links | `<KoraProvider linkComponent={Link}>` |

## Tailwind projects

Declare the layer order so that your utility classes can override kora-ui:

```css
@layer theme, base, kora, components, utilities;
@import "tailwindcss";
@import "kora-ui/styles.css" layer(kora);
```

kora-ui's own classes use the `kr:` prefix, so they never clash with yours.

## Next.js notes

- Components are client components. The package ships with `"use client"`, so you can import them directly in server components.
- Do not import constants from `kora-ui` into server code. They arrive as client references, not values. Use the literal instead, as in the sidebar cookie example.
- Put `<ThemeScript />` in the root layout's `<head>` and add `suppressHydrationWarning` to `<html>`.

## AI assistants

[kora-ui-mcp](https://www.npmjs.com/package/kora-ui-mcp) connects Claude, ChatGPT, Gemini, and other assistants to the component catalog and templates, so they write kora-ui code with the real props. The docs also publish [`llms.txt`](https://kora-ui.istmocode.com/llms.txt).

## Versions

kora-ui follows [semantic versioning](https://semver.org). Each release's changes are on [GitHub Releases](https://github.com/isaacavilap/kora-ui/releases).

| Change | Bump |
|---|---|
| Something stops working in code that uses the library | Major |
| New component, prop, template, or label | Minor |
| Bug, accessibility, or responsive fix | Patch |

## License

MIT © [Isaac Avila](https://github.com/isaacavilap)
