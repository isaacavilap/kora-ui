export type PropDoc = { name: string; type: string; description: string };
export type ComponentDoc = { slug: string; name: string; description: string; from: string; props?: PropDoc[] };
export type ComponentGroup = { name: string; items: ComponentDoc[] };

const base = "kora-ui";

export const componentGroups: ComponentGroup[] = [
  {
    name: "Layout",
    items: [
      {
        slug: "app-shell", name: "AppShell", from: base,
        description: "The page frame, with Sidebar, SidebarSection, SidebarItem, and Topbar. From 1024px the sidebar is a fixed column. Below that it is a drawer behind a menu button.",
        props: [
          { name: "sidebar", type: "ReactNode", description: "Usually a Sidebar. It renders in both the column and the drawer." },
          { name: "topbar", type: "ReactNode", description: "Usually a Topbar, which adds the menu button on small screens." },
        ],
      },
      { slug: "page-header", name: "PageHeader", from: base, description: "Page title, description, and actions. Actions move under the title on phones." },
      {
        slug: "grid", name: "Grid", from: base,
        description: "Responsive grid that needs no breakpoints.",
        props: [
          { name: "min", type: "string", description: "Smallest column width. Fits as many columns as there is room for. Default 15rem." },
          { name: "cols", type: "string", description: "Tracks from 1024px, such as \"2fr 1fr\". Stacks below that." },
        ],
      },
    ],
  },
  {
    name: "Data",
    items: [
      {
        slug: "data-table", name: "DataTable", from: `${base}/table`,
        description: "Sorting, search, pagination, selection, and bulk actions, on the client or the server. On phones each row becomes a card, with a sort menu in place of the headers.",
        props: [
          { name: "columns", type: "DataTableColumn<T>[]", description: "id, header, accessor, cell, sortable, align, hideOnMobile." },
          { name: "data", type: "T[]", description: "All rows in client mode, or the current page in server mode." },
          { name: "search", type: "string", description: "Client mode text filter across columns." },
          { name: "manual", type: "boolean", description: "Server mode. Use it with rowCount, state, and onStateChange." },
          { name: "selectable", type: "boolean", description: "Adds checkboxes. bulkActions receives the selected rows and a clear function." },
          { name: "loading, error, onRetry, empty", type: "various", description: "Replace the rows with the matching state." },
          { name: "mobile", type: "\"cards\" | \"scroll\"", description: "Phone layout. Default cards." },
        ],
      },
      { slug: "filter-bar", name: "FilterBar", from: `${base}/table`, description: "Search field, filters, clear button, and actions. Stacks on phones. Filtering stays in your code, so it works in both table modes." },
      {
        slug: "kpi-card", name: "KpiCard", from: base,
        description: "One headline number with its change and trend.",
        props: [
          { name: "delta", type: "number", description: "Percent change. Direction is shown with an arrow and a sign, not color alone." },
          { name: "invertDelta", type: "boolean", description: "For metrics where down is good, such as refunds." },
          { name: "trend", type: "number[]", description: "Draws a sparkline. Needs at least two values." },
          { name: "loading", type: "boolean", description: "Shows a skeleton." },
        ],
      },
      { slug: "stat-group", name: "StatGroup", from: base, description: "Several numbers in one card. Two columns on phones, one row from 768px." },
      { slug: "progress", name: "Progress", from: base, description: "Progress toward a goal, with a label and a percentage." },
    ],
  },
  {
    name: "Charts",
    items: [
      {
        slug: "line-chart", name: "LineChart", from: `${base}/charts`,
        description: "Trends over time. Colors, tooltip, legend, loading, empty, and error states are included.",
        props: [
          { name: "summary", type: "string", description: "Required. Describes the chart for screen readers, along with a generated data table." },
          { name: "data, x, series", type: "Row[], string, ChartSeries[]", description: "Rows, the key for the horizontal axis, and the lines to draw." },
          { name: "valueFormat, xFormat", type: "function", description: "Format axis and tooltip values." },
          { name: "height", type: "number", description: "Height in pixels. Width follows the container. Default 260." },
          { name: "loading, error, onRetry, empty", type: "various", description: "Replace the plot with the matching state." },
        ],
      },
      { slug: "area-chart", name: "AreaChart", from: `${base}/charts`, description: "Trends with filled volume. Set stacked to show parts of a whole. Same props as LineChart." },
      { slug: "bar-chart", name: "BarChart", from: `${base}/charts`, description: "Compare categories or periods. Set stacked to add them up. Same props as LineChart." },
      { slug: "donut-chart", name: "DonutChart", from: `${base}/charts`, description: "Share of a total, for about five slices. The legend shows values and percentages." },
      { slug: "sparkline", name: "Sparkline", from: `${base}/charts`, description: "Small trend line without axes. Always place it next to the number it describes." },
    ],
  },
  {
    name: "Forms",
    items: [
      { slug: "field", name: "Field", from: base, description: "Adds a label, hint, and error to any control, and links them for screen readers." },
      { slug: "input", name: "Input and Textarea", from: base, description: "Text controls. They use 16px text on phones, so iOS does not zoom the page on focus." },
      { slug: "select", name: "Select", from: base, description: "Choose one of a short list of options." },
      { slug: "combobox", name: "Combobox", from: base, description: "Choose one of a long list, with search and keyboard support." },
      { slug: "checkbox", name: "Checkbox", from: base, description: "On, off, or indeterminate, with a larger touch area on phones." },
      { slug: "switch", name: "Switch", from: base, description: "A setting that takes effect right away." },
      { slug: "otp-input", name: "OtpInput", from: base, description: "Numeric code entry that keeps digits only and supports paste and SMS autofill." },
      { slug: "date-range-picker", name: "DateRangePicker", from: base, description: "Pick a date range, with optional presets. Two months on desktop, one on phones." },
    ],
  },
  {
    name: "Overlays",
    items: [
      { slug: "dialog", name: "Dialog", from: base, description: "Blocks the page for a decision. Centered on desktop, and rises from the bottom edge on phones." },
      { slug: "sheet", name: "Sheet", from: base, description: "Side panel for details and edits, without leaving the page." },
      { slug: "dropdown-menu", name: "DropdownMenu", from: base, description: "A list of actions behind a button." },
      { slug: "tooltip", name: "Tooltip", from: base, description: "A short hint on hover or focus. Keep essential information out of it, because touch screens have no hover." },
      { slug: "toast", name: "Toast", from: base, description: "Short confirmation of an action. Add Toaster once, then call toast()." },
    ],
  },
  {
    name: "Basics",
    items: [
      { slug: "button", name: "Button", from: base, description: "Primary, secondary, ghost, and danger, with a loading state. Set asChild to style a link." },
      { slug: "badge", name: "Badge", from: base, description: "A short status label." },
      { slug: "card", name: "Card", from: base, description: "A bordered surface with an optional header, content, and footer." },
      { slug: "alert", name: "Alert", from: base, description: "A message inside the page, with an icon for each tone." },
      { slug: "avatar", name: "Avatar", from: base, description: "A photo, or initials when there is none." },
      { slug: "separator", name: "Separator", from: base, description: "A horizontal or vertical divider." },
      { slug: "tabs", name: "Tabs", from: base, description: "Switch between views of the same subject. Scrolls sideways when space runs short." },
      { slug: "pagination", name: "Pagination", from: base, description: "Page numbers on desktop, and a compact \"2 of 12\" on phones." },
      { slug: "stepper", name: "Stepper", from: base, description: "Progress through ordered steps. Becomes a progress bar on phones." },
      { slug: "skeleton", name: "Skeleton", from: base, description: "A placeholder while content loads." },
      { slug: "empty-state", name: "EmptyState", from: base, description: "Explains what belongs here and what to do next." },
    ],
  },
];

export const allComponents = componentGroups.flatMap((g) => g.items);

export type TemplateDoc = { slug: string; name: string; description: string; group: string; from: string };

export const templateDocs: TemplateDoc[] = [
  { slug: "dashboard", name: "Analytics dashboard", group: "Dashboards", from: "kora-ui", description: "KPIs, charts, goals, and latest orders in the full app shell." },
  { slug: "orders", name: "Orders admin", group: "Dashboards", from: "kora-ui/table", description: "List with search, filter, sort, row details, create, and bulk delete." },
  { slug: "login", name: "Sign in", group: "Access", from: "kora-ui/auth", description: "Email and password, providers, and sign-in link. Use the password \"wrong\" to see the failure state." },
  { slug: "login-split", name: "Sign in with brand panel", group: "Access", from: "kora-ui/auth", description: "Same screen with a brand panel from 1024px." },
  { slug: "register", name: "Create account", group: "Access", from: "kora-ui/auth", description: "Name, email, password, and terms." },
  { slug: "forgot-password", name: "Forgot password", group: "Access", from: "kora-ui/auth", description: "Requests a reset link, without revealing whether the account exists." },
  { slug: "reset-password", name: "Reset password", group: "Access", from: "kora-ui/auth", description: "Sets a new password, with length and match checks." },
  { slug: "verify-email", name: "Verify email", group: "Access", from: "kora-ui/auth", description: "Asks the person to open their email, with a timed resend." },
  { slug: "otp", name: "Verification code", group: "Access", from: "kora-ui/auth", description: "Code for two-step sign-in. Submits on the last digit." },
  { slug: "accept-invite", name: "Accept invitation", group: "Access", from: "kora-ui/auth", description: "Joins a workspace, and creates the account when needed." },
  { slug: "account", name: "Account settings", group: "Settings", from: "kora-ui/screens", description: "Profile, password, two-step verification, and active sessions." },
  { slug: "members", name: "Members and roles", group: "Settings", from: "kora-ui/screens", description: "Search people, invite them, change roles, and remove access." },
  { slug: "onboarding", name: "Onboarding", group: "Settings", from: "kora-ui/screens", description: "First-run steps with validation and optional steps." },
  { slug: "error-404", name: "Page not found", group: "Errors", from: "kora-ui/screens", description: "For addresses that do not exist." },
  { slug: "error-403", name: "No access", group: "Errors", from: "kora-ui/screens", description: "For pages the person cannot open." },
  { slug: "error-500", name: "Server error", group: "Errors", from: "kora-ui/screens", description: "For failures on your side, with a retry." },
  { slug: "maintenance", name: "Maintenance", group: "Errors", from: "kora-ui/screens", description: "For planned downtime." },
];

export const templateGroups = ["Dashboards", "Access", "Settings", "Errors"];

