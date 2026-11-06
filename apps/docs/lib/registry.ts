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
        description: "The page frame, with Sidebar, SidebarSection, SidebarItem, SidebarGroup, SidebarUser, and Topbar. From 1024px the sidebar is a column that collapses to icons or hides, with its button in the Topbar. Below that it is a drawer behind a menu button. SidebarGroup makes submenus, and groups nest for more levels.",
        props: [
          { name: "sidebar", type: "ReactNode", description: "Usually a Sidebar. It renders in both the column and the drawer." },
          { name: "topbar", type: "ReactNode", description: "Usually a Topbar, which adds the menu and collapse buttons." },
          { name: "collapseMode", type: "\"rail\" | \"hidden\"", description: "rail keeps a column of icons. hidden removes the sidebar. Default rail." },
          { name: "collapsed, onCollapsedChange", type: "boolean, function", description: "Controlled state. Without them, the choice is saved in localStorage." },
          { name: "defaultCollapsed", type: "boolean", description: "Start state when nothing is saved." },
        ],
      },
      { slug: "command-palette", name: "CommandPalette", from: base, description: "Search for pages and actions, with its button and with Cmd+K or Ctrl+K.", props: [
        { name: "items", type: "CommandItem[]", description: "id, label, group, icon, keywords, and href or onSelect." },
      ] },
      { slug: "notifications-menu", name: "NotificationsMenu", from: base, description: "Bell with the unread count and a list of notifications. Reading state stays in your code." },
      { slug: "breadcrumbs", name: "Breadcrumbs", from: base, description: "Page trail. On phones it keeps only the current page." },
      { slug: "theme-toggle", name: "ThemeToggle", from: base, description: "Switches light and dark, and saves the choice. Add ThemeScript to the head to apply it before the first paint." },
      { slug: "scope-switcher", name: "ScopeSwitcher", from: base, description: "Sets what the whole app shows, such as a company or branch. Goes in the Sidebar scope slot. Options can have a logo, description, and group." },
      { slug: "bottom-nav", name: "BottomNav", from: base, description: "Main pages on phones and tablets. Goes in the AppShell bottomNav slot and hides from 1024px. A More button opens the sidebar for the rest. Use up to four items.", props: [
        { name: "items", type: "BottomNavItem[]", description: "href, label, icon, active, and badge." },
      ] },
      { slug: "section-nav", name: "SectionNav", from: base, description: "Jumps between the sections of a long page and marks the one on screen. A sticky list on desktop and a select on phones." },
      { slug: "save-bar", name: "SaveBar", from: base, description: "Stays on screen while a long form has unsaved changes, with Discard and Save." },
      { slug: "confirm-dialog", name: "ConfirmDialog", from: base, description: "Asks before an action. It shows progress and keeps the dialog open with the error if the action fails." },
      { slug: "file-dropzone", name: "FileDropzone", from: base, description: "Drop files or choose them. Works with the keyboard and on phones." },
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
        description: "Sorting, search, filters, column visibility, row menus, pagination, selection, and bulk actions, on the client or the server. On phones each row becomes a card, with a sort menu in place of the headers.",
        props: [
          { name: "columns", type: "DataTableColumn<T>[]", description: "id, header, accessor, cell, sortable, filter, align, hideOnMobile. filter is { type: \"select\", options? } or { type: \"date\" }." },
          { name: "data", type: "T[]", description: "All rows in client mode, or the current page in server mode." },
          { name: "searchable", type: "boolean", description: "Adds a search field above the table." },
          { name: "search", type: "string", description: "Text filter from your own field, if you do not use searchable." },
          { name: "columnToggle", type: "boolean", description: "Adds a menu to show or hide columns." },
          { name: "rowActions", type: "(row) => ReactNode", description: "Adds a menu to each row. Return DropdownMenuItem elements." },
          { name: "toolbarActions", type: "ReactNode", description: "Shown at the end of the filter row." },
          { name: "exportFilename", type: "string", description: "Adds a CSV button for the visible columns of the filtered rows. In server mode it has only the current page." },
          { name: "manual", type: "boolean", description: "Server mode. Use it with rowCount, state, and onStateChange. The state includes filters and search, and filter options must be passed in the column. Debounce your fetch, because search changes on each keystroke." },
          { name: "selectable", type: "boolean", description: "Adds checkboxes. bulkActions receives the selected rows and a clear function." },
          { name: "loading, error, onRetry, empty", type: "various", description: "Replace the rows with the matching state." },
          { name: "mobile", type: "\"cards\" | \"scroll\"", description: "Phone layout. Default cards." },
          { name: "viewToggle", type: "boolean", description: "Adds a switch between table and cards at every width." },
          { name: "renderExpanded", type: "(row) => ReactNode", description: "Adds a button to each row that shows more below it." },
          { name: "columns[].footer", type: "(rows) => ReactNode", description: "A totals row. It receives every filtered row, not only the current page." },
          { name: "filters, onFiltersChange, onSearchChange", type: "various", description: "Controlled filters and search. Read them from the URL and write them back, so a list can be shared and survives a reload." },
        ],
      },
      { slug: "filter-bar", name: "FilterBar", from: `${base}/table`, description: "The row above a DataTable, for when you keep filters in your own code, such as in the URL. Search field, filters, clear button, and actions. Stacks on phones. FilterSelect is its multiple choice control." },
      { slug: "stage-counters", name: "StageCounters", from: base, description: "How many records sit at each stage of a process, with a link to each list." },
      { slug: "quick-actions", name: "QuickActions", from: base, description: "Shortcuts to the most common tasks." },
      { slug: "alert-list", name: "AlertList", from: base, description: "What needs attention today, each with its action." },
      { slug: "document-list", name: "DocumentList", from: base, description: "Files attached to a record. onRemove adds a button, so leave it off for people who cannot remove files." },
      { slug: "event-calendar", name: "EventCalendar", from: base, description: "A month grid with events. On phones it becomes a list of days." },
      { slug: "chart-card", name: "ChartCard", from: base, description: "A card with a title, headline number, change, and actions, around any chart or widget." },
      { slug: "segmented-control", name: "SegmentedControl", from: base, description: "Pick one option, such as a time range or a chart view." },
      { slug: "ranked-list", name: "RankedList", from: base, description: "Top items with bars, longest first. Accepts loading, error, and empty." },
      { slug: "segment-bar", name: "SegmentBar", from: base, description: "Parts of a whole on one line, with a legend that names each part." },
      { slug: "funnel", name: "Funnel", from: base, description: "Steps where people drop off, with the share kept at each one." },
      { slug: "gauge", name: "Gauge", from: base, description: "One value against a limit, as a half ring. You set the tone, because only you know the thresholds." },
      { slug: "heatmap", name: "Heatmap", from: base, description: "Values by row and column, such as retention cohorts or busy hours. It is a real table, so screen readers get every value." },
      { slug: "timeline", name: "Timeline", from: base, description: "Events in order, such as recent activity or incidents." },
      { slug: "description-list", name: "DescriptionList", from: base, description: "Label and value pairs, such as a record summary." },
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
  { slug: "dashboard-sales", name: "Sales dashboard", group: "Dashboards", from: "kora-ui/charts", description: "Time range, sales by channel, best sellers, and orders that need action, with CSV export." },
  { slug: "dashboard-saas", name: "Subscriptions dashboard", group: "Dashboards", from: "kora-ui/charts", description: "Recurring revenue against a target, goal gauge, signup funnel, retention heatmap, and latest changes." },
  { slug: "dashboard-operations", name: "Operations dashboard", group: "Dashboards", from: "kora-ui/charts", description: "Service health, response times, capacity gauges, traffic heatmap, and incidents." },
  { slug: "orders", name: "Orders admin", group: "Dashboards", from: "kora-ui/table", description: "List with views, search, status and date filters, column menu, row menu, details, create, and bulk delete." },
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
  { slug: "group-overview", name: "All companies", group: "Multiple companies", from: "kora-ui", description: "The group view: totals, one card per company with a way in, revenue compared, merged alerts and agenda, and a list with a Company column." },
  { slug: "company-settings", name: "Company settings", group: "Multiple companies", from: "kora-ui", description: "Identity, documents, and modules for each company, with section navigation and a save bar." },
  { slug: "permissions", name: "Permissions", group: "Multiple companies", from: "kora-ui", description: "A role matrix, and which companies each person can enter." },
  { slug: "home", name: "Today", group: "Admin screens", from: "kora-ui", description: "The first page of the day: counts by stage, numbers, alerts, schedule, shortcuts, and latest records." },
  { slug: "workflow", name: "Stage lists", group: "Admin screens", from: "kora-ui/table", description: "One list per stage, with filters, CSV, and a confirmed move to the next stage, one by one or in bulk." },
  { slug: "record-detail", name: "Record detail", group: "Admin screens", from: "kora-ui", description: "One record: status, progress, line items with totals, notes, documents, history, and its next step." },
  { slug: "record-form", name: "Record form", group: "Admin screens", from: "kora-ui", description: "A long create form with line items, documents, and a clear list of what is missing." },
  { slug: "agenda", name: "Agenda", group: "Admin screens", from: "kora-ui", description: "A month calendar that becomes a list on phones, with event details and scheduling." },
  { slug: "catalog", name: "Catalog", group: "Admin screens", from: "kora-ui/table", description: "Items you own or sell, with table and card views, filters, totals, and bulk actions." },
  { slug: "report", name: "Report", group: "Admin screens", from: "kora-ui", description: "Numbers for a period, a warning, an expandable table with totals, CSV, a chart, and a ranking." },
  { slug: "audit-log", name: "Activity log", group: "Admin screens", from: "kora-ui/table", description: "Who did what and when, with filters by person, action, and date, expandable details, and CSV." },
  { slug: "workspace-settings", name: "Workspace settings", group: "Settings", from: "kora-ui", description: "General settings, a list of locations, and notification switches." },
  { slug: "onboarding", name: "Onboarding", group: "Settings", from: "kora-ui/screens", description: "First-run steps with validation and optional steps." },
  { slug: "error-404", name: "Page not found", group: "Errors", from: "kora-ui/screens", description: "For addresses that do not exist." },
  { slug: "error-403", name: "No access", group: "Errors", from: "kora-ui/screens", description: "For pages the person cannot open." },
  { slug: "error-500", name: "Server error", group: "Errors", from: "kora-ui/screens", description: "For failures on your side, with a retry." },
  { slug: "maintenance", name: "Maintenance", group: "Errors", from: "kora-ui/screens", description: "For planned downtime." },
];

export const templateGroups = ["Dashboards", "Multiple companies", "Admin screens", "Access", "Settings", "Errors"];

