export type PropDoc = { name: string; type: string; description: string };
export type ComponentDoc = { slug: string; name: string; /** One short line, for the index. */ description: string; /** Details, on the page of the component. */ notes?: string; from: string; props?: PropDoc[] };
export type ComponentGroup = { name: string; items: ComponentDoc[] };

const base = "kora-ui";

export const componentGroups: ComponentGroup[] = [
  {
    name: "Layout",
    items: [
      {
        slug: "app-shell", name: "AppShell", from: base,
        description: "The page frame, with sidebar and topbar.", notes: "It includes Sidebar, SidebarSection, SidebarItem, SidebarGroup, SidebarUser, and Topbar. From 1024px the sidebar is a column that collapses to icons or hides, with a button on its edge. Below that it is a drawer behind a menu button. SidebarGroup makes submenus, and groups nest for more levels.",
        props: [
          { name: "sidebar", type: "ReactNode", description: "Usually a Sidebar. It renders in both the column and the drawer." },
          { name: "topbar", type: "ReactNode", description: "Usually a Topbar, which adds the menu and collapse buttons." },
          { name: "collapseMode", type: "\"rail\" | \"hidden\"", description: "rail keeps a column of icons. hidden removes the sidebar. Default rail." },
          { name: "collapsed, onCollapsedChange", type: "boolean, function", description: "Controlled state. Without them, the choice is saved in localStorage." },
          { name: "defaultCollapsed", type: "boolean", description: "Start state when nothing is saved." },
        ],
      },
      { slug: "user-menu", name: "UserMenu", from: base, description: "The avatar of the person, with a menu. It also has the theme and the text size of this person.", notes: "Put it in the Topbar, with DropdownMenuItem as children. Theme and text size are saved on the device, and ThemeScript applies them before the first paint. A text size chosen here wins over textScale of ThemeColors. Pass preferences={false} to leave them out." },
      { slug: "command-palette", name: "CommandPalette", from: base, description: "Search for pages and actions.", notes: "It has its own button, and opens with Cmd+K or Ctrl+K.", props: [
        { name: "items", type: "CommandItem[]", description: "id, label, group, icon, keywords, and href or onSelect." },
      ] },
      { slug: "notifications-menu", name: "NotificationsMenu", from: base, description: "Bell with the unread count and a list.", notes: "Reading state stays in your code." },
      { slug: "breadcrumbs", name: "Breadcrumbs", from: base, description: "Page trail. On phones it keeps only the current page." },
      { slug: "theme-toggle", name: "ThemeToggle", from: base, description: "Switches light and dark, and saves the choice.", notes: "Add ThemeScript to the head to apply it before the first paint. Its defaultTheme prop (light, dark, or system) is used until the person picks one." },
      { slug: "scope-switcher", name: "ScopeSwitcher", from: base, description: "Chooses the company or branch the app shows.", notes: "Goes in the Sidebar scope slot. Options can have a logo, description, and group." },
      { slug: "theme-colors", name: "ThemeColors", from: base, description: "Puts the colors and the text size of a client on the whole app, while it runs.", notes: "Goes in the document head, with colors that can come from a database. It keeps text readable in light and dark. menu paints the Sidebar with default, primary, or secondary. Paper keeps the library colors.", props: [
        { name: "primary", type: "string", description: "A color like #7b2d26: buttons, links, and selection." },
        { name: "secondary", type: "string", description: "A color like #f7f1e1: soft backgrounds." },
        { name: "menu", type: '"default" | "primary" | "secondary"', description: "The color of the Sidebar." },
        { name: "textScale", type: "number", description: "Size of all the text and controls, in percent: 112.5 is one step bigger. From 87.5 to 150." },
      ] },
      { slug: "bottom-nav", name: "BottomNav", from: base, description: "The main pages, at the bottom of phones and tablets.", notes: "Goes in the AppShell bottomNav slot and hides from 1024px. A More button opens the sidebar for the rest. Use up to four items.", props: [
        { name: "items", type: "BottomNavItem[]", description: "href, label, icon, active, and badge." },
      ] },
      { slug: "section-nav", name: "SectionNav", from: base, description: "Jumps between the sections of a long page.", notes: "It marks the section on screen. A sticky list on desktop and a select on phones." },
      { slug: "save-bar", name: "SaveBar", from: base, description: "Stays on screen while a form has unsaved changes.", notes: "It has Discard and Save." },
      { slug: "confirm-dialog", name: "ConfirmDialog", from: base, description: "Asks before an action.", notes: "It shows progress and keeps the dialog open with the error if the action fails." },
      {
        slug: "image-input", name: "ImageInput", from: base,
        description: "Choose images and compress them before upload.", notes: "It runs in the browser. compressImage does the same with no interface.",
        props: [
          { name: "onChange", type: "(files: File[]) => void", description: "Receives the compressed files each time the list changes." },
          { name: "name", type: "string", description: "Sends the compressed files with a normal form." },
          { name: "maxSize", type: "number", description: "Longest side in pixels. Default 1920." },
          { name: "quality", type: "number", description: "From 0 to 1. Default 0.8." },
          { name: "format", type: "\"image/webp\" | \"image/jpeg\"", description: "Default WebP. Safari gets JPEG, because it cannot write WebP." },
          { name: "multiple, maxFiles", type: "boolean, number", description: "Keeps several images, up to maxFiles." },
        ],
      },
      { slug: "file-dropzone", name: "FileDropzone", from: base, description: "Drop files or choose them.", notes: "Works with the keyboard and on phones." },
      {
        slug: "file-drop", name: "FileDrop", from: base,
        description: "A large zone for one document: drop, choose, paste, or take a photo.", notes: "For screens built around one upload, such as reading a receipt. On phones it adds Take photo, which opens the rear camera. A file pasted anywhere on the page counts too. It keeps a hidden input with name, so a plain form submits the file. Type and size are checked in the browser; check them again on the server. FileDropzone is the small field for several files.",
        props: [
          { name: "accept", type: "string[]", description: "MIME types allowed. Default any." },
          { name: "maxSize", type: "number", description: "Largest size in bytes." },
          { name: "onFile", type: "(file: File) => void", description: "Called as soon as a valid file arrives, for example to send the form." },
          { name: "camera, paste", type: "boolean", description: "Take photo on touch screens, and paste from the clipboard. Both default true." },
          { name: "name, title, hint", type: "string", description: "Input name (default file), the big line, and the small line." },
        ],
      },
      { slug: "page-header", name: "PageHeader", from: base, description: "Page title, description, and actions.", notes: "Actions move under the title on phones." },
      {
        slug: "box", name: "Box, List, and Fieldset", from: base,
        description: "A container, a list, and a group of fields.", notes: "Pages use these in place of native tags.",
        props: [
          { name: "as", type: "string", description: "Box only. The tag: div, section, header, main, footer, article, aside, or nav. Default div." },
          { name: "ordered, gap", type: "boolean, string", description: "List only. A numbered list, and the space between items." },
          { name: "legend", type: "ReactNode", description: "Fieldset only. The title of the group." },
        ],
      },
      {
        slug: "stack", name: "Stack and Inline", from: base,
        description: "Put children under one another, or in a row.", notes: "Use them in place of a div.",
        props: [
          { name: "gap", type: "\"none\" | \"xs\" | \"sm\" | \"md\" | \"lg\"", description: "Space between children. Stack default lg, which is the gap between page sections. Inline default sm." },
          { name: "align, justify, wrap", type: "various", description: "Inline only. Default center, start, and true." },
        ],
      },
      {
        slug: "text", name: "Heading and Text", from: base,
        description: "Titles and text with theme sizes and colors.", notes: "Use them in place of h1, h2, p, and span.",
        props: [
          { name: "level", type: "1 | 2 | 3 | 4", description: "Heading only. The heading tag. Default 2." },
          { name: "size", type: "string", description: "Heading: sm, md, lg, xl. Text: xs, sm, md, lg." },
          { name: "tone", type: "string", description: "Text only: default, muted, accent, success, warning, danger." },
          { name: "strong, inline", type: "boolean", description: "Text only. Medium weight, and a span in place of a paragraph." },
        ],
      },
      {
        slug: "form", name: "Form and FormActions", from: base,
        description: "A form with standard spacing, and its buttons.", notes: "The buttons fill the width on phones.",
      },
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
        slug: "json-viewer", name: "JsonViewer", from: base,
        description: "A JSON value as a tree that opens and closes.", notes: "A tree for screen readers: arrows move, Right and Left open and close, Enter toggles. Press c to copy the value of a row and p to copy its path, like user.tags[0], or use the buttons on hover. Long strings are cut, with Show more.",
        props: [
          { name: "data", type: "unknown", description: "Any JSON value." },
          { name: "expandDepth", type: "number", description: "Levels open at start. 0 shows only the top keys. Default 1." },
          { name: "maxStringLength", type: "number", description: "Longer strings are cut. Default 80." },
        ],
      },
      {
        slug: "code-block", name: "CodeBlock", from: base,
        description: "Code with colors, a copy button, and an optional title.", notes: "Colors come from the theme tokens, so they follow light, dark, and client colors. Long lines scroll inside the block, or wrap with wrap. highlight(code, language) gives the tokens, for your own rendering.",
        props: [
          { name: "code", type: "string", description: "The code." },
          { name: "language", type: "string", description: "ts, tsx, js, jsx, json, css, html, or bash. Others show as plain text." },
          { name: "title", type: "ReactNode", description: "A file name or title above the code." },
          { name: "lineNumbers", type: "boolean", description: "Numbers in a gutter, left out when copying." },
          { name: "highlightLines", type: "number[]", description: "Lines to mark, starting at 1." },
          { name: "wrap", type: "boolean", description: "Wraps long lines instead of scrolling." },
          { name: "showLanguage, copyable", type: "boolean", description: "Default true." },
        ],
      },
      {
        slug: "data-table", name: "DataTable", from: `${base}/table`,
        description: "Sort, search, filter, and page through rows.", notes: "It also has column visibility, row menus, selection, and bulk actions, on the client or the server. On phones each row becomes a card, with a sort menu in place of the headers.",
        props: [
          { name: "columns", type: "DataTableColumn<T>[]", description: "id, header, accessor, cell, sortable, filter, align, hideOnMobile. filter is { type: \"select\", options? } or { type: \"date\" }." },
          { name: "data", type: "T[]", description: "All rows in client mode, or the current page in server mode." },
          { name: "searchable", type: "boolean", description: "Adds a search field above the table." },
          { name: "search", type: "string", description: "Text filter from your own field, if you do not use searchable." },
          { name: "columnToggle", type: "boolean", description: "Adds a menu to show or hide columns." },
          { name: "rowActions", type: "(row) => ReactNode", description: "Adds a menu to each row. Return DropdownMenuItem elements." },
          { name: "toolbarActions", type: "ReactNode", description: "Shown at the end of the filter row." },
          { name: "exportFilename", type: "string", description: "Adds an Export menu (Excel, CSV, PDF) for the visible columns of the filtered rows. PDF opens the print dialog. In server mode it has only the current page." },
          { name: "manual", type: "boolean", description: "Server mode. Use it with rowCount, state, and onStateChange. The state includes filters and search, and filter options must be passed in the column. Debounce your fetch, because search changes on each keystroke." },
          { name: "selectable", type: "boolean", description: "Adds checkboxes. bulkActions receives the selected rows and a clear function." },
          { name: "loading, error, onRetry, empty", type: "various", description: "Replace the rows with the matching state." },
          { name: "mobile", type: "\"cards\" | \"scroll\"", description: "Phone layout. Default cards." },
          { name: "viewToggle", type: "boolean", description: "A switch between table and cards on wider screens, on by default. Phones always use cards. The choice is saved on the device." },
          { name: "storageKey", type: "string", description: "The name the chosen view is saved under. Defaults to exportFilename, then to the page path." },
          { name: "cardMedia", type: "(row) => ReactNode", description: "A small picture at the side of each card, such as a product photo." },
          { name: "renderExpanded", type: "(row) => ReactNode", description: "Adds a button to each row that shows more below it." },
          { name: "columns[].footer", type: "(rows) => ReactNode", description: "A totals row. It receives every filtered row, not only the current page." },
          { name: "filters, onFiltersChange, onSearchChange", type: "various", description: "Controlled filters and search. Read them from the URL and write them back, so a list can be shared and survives a reload." },
        ],
      },
      { slug: "filter-bar", name: "FilterBar", from: `${base}/table`, description: "Search and filters above a DataTable.", notes: "Use it when you keep filters in your own code, such as in the URL. It has a search field, filters, a clear button, and actions, and stacks on phones. FilterSelect is its multiple choice control." },
      {
        slug: "kanban", name: "Kanban", from: base,
        description: "A board with one column per stage.",
        notes: "It scrolls sideways when the columns do not fit. With onCardMove, a card moves by dragging, or with its menu on a keyboard or a phone. It moves between columns, not within one.",
        props: [
          { name: "columns", type: "KanbanColumn[]", description: "Each has an id, a title, and its cards. `count` is the total when only some cards are loaded." },
          { name: "onCardMove", type: "(card, from, to) => void", description: "Lets people move cards. You update columns." },
          { name: "onCardClick", type: "(card, column) => void", description: "Makes each card a button." },
          { name: "loading", type: "boolean", description: "Shows gray cards in each column." },
        ],
      },
      { slug: "stage-counters", name: "StageCounters", from: base, description: "How many records sit at each stage.", notes: "Each stage links to its list." },
      { slug: "quick-actions", name: "QuickActions", from: base, description: "Shortcuts to the most common tasks." },
      { slug: "alert-list", name: "AlertList", from: base, description: "What needs attention today, each with its action." },
      { slug: "document-list", name: "DocumentList", from: base, description: "Files attached to a record.", notes: "A long name loses its middle, keeps its extension, and shows in full on hover. FileName does this anywhere. onRemove adds a button, so leave it off for people who cannot remove files." },
      {
        slug: "event-calendar", name: "EventCalendar", from: base,
        description: "Day, week, month, year, and list views.", notes: "Every view works on phones.",
        props: [
          { name: "people", type: "CalendarPerson[]", description: "Gives the day view one column for each person, with their avatar on top. Set personId on each event. Events with no known person go in an Unassigned column." },
          { name: "defaultView, views", type: "CalendarView, CalendarView[]", description: "The first view, and the views people can choose." },
          { name: "defaultDate", type: "Date", description: "The first date to show. The default is today." },
          { name: "onEventClick, onAddEvent", type: "function", description: "onAddEvent shows an add button on each open day." },
        ],
      },
      { slug: "chart-card", name: "ChartCard", from: base, description: "A card around a chart, with title and number.", notes: "It also has a change and actions, and holds any chart or widget." },
      { slug: "segmented-control", name: "SegmentedControl", from: base, description: "Pick one option, such as a time range or a chart view." },
      { slug: "ranked-list", name: "RankedList", from: base, description: "Top items with bars, longest first.", notes: "Accepts loading, error, and empty." },
      { slug: "segment-bar", name: "SegmentBar", from: base, description: "Parts of a whole on one line.", notes: "A legend names each part." },
      { slug: "funnel", name: "Funnel", from: base, description: "Steps where people drop off.", notes: "It shows the share kept at each step." },
      { slug: "gauge", name: "Gauge", from: base, description: "One value against a limit, as a half ring.", notes: "You set the tone, because only you know the thresholds." },
      { slug: "heatmap", name: "Heatmap", from: base, description: "Values by row and column, such as busy hours.", notes: "It is a real table, so screen readers get every value." },
      { slug: "timeline", name: "Timeline", from: base, description: "Events in order, such as recent activity or incidents." },
      { slug: "description-list", name: "DescriptionList", from: base, description: "Label and value pairs, such as a record summary." },
      {
        slug: "kpi-card", name: "KpiCard", from: base,
        description: "One headline number with its change and trend.",
        props: [
          { name: "delta", type: "number", description: "Percent change. Direction is shown with an arrow and a sign, not color alone." },
          { name: "invertDelta", type: "boolean", description: "For metrics where down is good, such as refunds." },
          { name: "trend", type: "number[]", description: "Draws a sparkline. Needs at least two values." },
          { name: "hint", type: "ReactNode", description: "A note under the value, when there is no percent change." },
          { name: "loading", type: "boolean", description: "Shows a skeleton." },
        ],
      },
      { slug: "stat-group", name: "StatGroup", from: base, description: "Several numbers in one card.", notes: "Two columns on phones, one row from 768px." },
      { slug: "progress", name: "Progress", from: base, description: "A bar that takes its color from ranges.", notes: "It can be one color, a gradient, or pieces." },
    ],
  },
  {
    name: "Charts",
    items: [
      {
        slug: "line-chart", name: "LineChart", from: `${base}/charts`,
        description: "Trends over time.", notes: "Colors, tooltip, legend, loading, empty, and error states are included.",
        props: [
          { name: "summary", type: "string", description: "Required. Describes the chart for screen readers, along with a generated data table." },
          { name: "data, x, series", type: "Row[], string, ChartSeries[]", description: "Rows, the key for the horizontal axis, and the lines to draw." },
          { name: "valueFormat, xFormat", type: "function", description: "Format axis and tooltip values." },
          { name: "height", type: "number", description: "Height in pixels. Width follows the container. Default 260." },
          { name: "loading, error, onRetry, empty", type: "various", description: "Replace the plot with the matching state." },
        ],
      },
      { slug: "area-chart", name: "AreaChart", from: `${base}/charts`, description: "Trends with filled volume.", notes: "Set stacked to show parts of a whole. Same props as LineChart." },
      { slug: "bar-chart", name: "BarChart", from: `${base}/charts`, description: "Compare categories or periods.", notes: "Set stacked to add them up. Same props as LineChart." },
      { slug: "donut-chart", name: "DonutChart", from: `${base}/charts`, description: "Share of a total, for about five slices.", notes: "The legend shows values and percentages." },
      { slug: "sparkline", name: "Sparkline", from: `${base}/charts`, description: "Small trend line without axes.", notes: "Always place it next to the number it describes." },
    ],
  },
  {
    name: "Forms",
    items: [
      { slug: "field", name: "Field", from: base, description: "Adds a label, hint, and error to any control.", notes: "It links them for screen readers." },
      { slug: "input", name: "Input and Textarea", from: base, description: "Text controls.", notes: "They use 16px text on phones, so iOS does not zoom the page on focus." },
      {
        slug: "select", name: "Select", from: base,
        description: "Choose one of a short list of options.", notes: "Use the list of the library, or of the browser with native.",
        props: [{ name: "native", type: "boolean", description: "Uses the browser select, with the system list on phones. Labels must be plain text." }],
      },
      { slug: "combobox", name: "Combobox", from: base, description: "Choose one or several of a long list, with search.", notes: "It has full keyboard support. With multiple, value is a list and the list stays open. With name, it is sent with the form." },
      { slug: "checkbox", name: "Checkbox", from: base, description: "On, off, or indeterminate.", notes: "It has a larger touch area on phones." },
      { slug: "switch", name: "Switch", from: base, description: "A setting that takes effect right away." },
      { slug: "otp-input", name: "OtpInput", from: base, description: "Numeric code entry.", notes: "It keeps digits only and supports paste and SMS autofill." },
      { slug: "date-range-picker", name: "DateRangePicker", from: base, description: "Pick a date range, with optional presets.", notes: "Two months on desktop, one on phones." },
      {
        slug: "mentions", name: "Mentions", from: base,
        description: "A text field that suggests people after @.", notes: "Arrows choose, Enter or Tab inserts, Escape closes. The value stays plain text with mentions as @handle, so it saves as is: parseMentions(text) lists the handles. Without value it keeps its own text, and with name it is sent with the form.",
        props: [
          { name: "options", type: "MentionOption[]", description: "value (the handle, no spaces), label, description, and avatar. Filtered by label and value, without accents." },
          { name: "onSearch", type: "(query: string) => Promise<MentionOption[]>", description: "Searches a server in place of options. Calls wait 150ms while typing, and late answers are dropped." },
          { name: "value, defaultValue, onChange", type: "string, string, (value: string) => void", description: "Controlled or not." },
          { name: "trigger", type: "string", description: "The character that opens the list. Default @." },
          { name: "singleLine", type: "boolean", description: "An input instead of a textarea." },
        ],
      },
      {
        slug: "code-editor", name: "CodeEditor", from: base,
        description: "A light code field with colors, for CSS, JSON, HTML, or snippets.", notes: "A textarea with the CodeBlock colors drawn under it, so it weighs almost nothing and works with forms, undo, and autofill. Tab inserts spaces and Enter keeps the indentation. Press Escape, then Tab, to move focus out. Lines wrap. For a full IDE, use Monaco.",
        props: [
          { name: "value, defaultValue, onChange", type: "string, string, (value: string) => void", description: "Controlled or not." },
          { name: "language", type: "string", description: "ts, tsx, js, jsx, json, css, html, or bash. Others show as plain text." },
          { name: "name", type: "string", description: "Sends the code with a form." },
          { name: "tabSize", type: "number", description: "Spaces for Tab and for each level. Default 2." },
        ],
      },
      {
        slug: "emoji-picker", name: "EmojiPicker", from: base,
        description: "Search and pick an emoji.", notes: "Searches English and Spanish words, without accents. About 300 common emojis, loaded only when the picker opens. Recent ones are saved on the device. Arrows move through the grid, and Arrow Down from the search jumps in. Put it in a Popover or Sheet to open it from a button.",
        props: [
          { name: "onSelect", type: "(emoji: string) => void", description: "Receives the emoji." },
          { name: "recentKey", type: "string | null", description: "localStorage key for recent ones. null keeps none." },
          { name: "maxRecent", type: "number", description: "Default 16." },
        ],
      },
      {
        slug: "rating", name: "Rating", from: base,
        description: "Stars to rate, or to show a rating.", notes: "A slider for screen readers: arrows, Home, and End change it. With name, it is sent with the form in a hidden input. readOnly shows the value as an image with its text.",
        props: [
          { name: "value, defaultValue, onChange", type: "number, number, (value) => void", description: "From 0 (none) to max. Controlled or not." },
          { name: "max, step", type: "number, 1 | 0.5", description: "Number of stars, and half stars with 0.5. Default 5 and 1." },
          { name: "readOnly", type: "boolean", description: "Shows the value with no interaction." },
          { name: "name", type: "string", description: "Sends the value with a normal form." },
          { name: "size, color", type: "number, string", description: "Star side in pixels and fill color. Default 24 and amber." },
        ],
      },
      {
        slug: "qr-reader", name: "QRReader", from: base,
        description: "Reads QR codes with the camera.", notes: "It uses the BarcodeDetector of the browser, and loads jsQR only where there is none, such as Safari and Firefox. It explains a blocked camera and a device with no camera, with a retry button, and turns the camera off when it leaves the page. It needs https.",
        props: [
          { name: "onDecode", type: "(text: string) => void", description: "Receives each code read. The same code again comes after 2 seconds." },
          { name: "onError", type: "(status, error) => void", description: "status is denied, unavailable, or failed." },
        ],
      },
    ],
  },
  {
    name: "Overlays",
    items: [
      { slug: "dialog", name: "Dialog", from: base, description: "Blocks the page for a decision.", notes: "Centered on desktop, and rises from the bottom edge on phones." },
      { slug: "sheet", name: "Sheet", from: base, description: "Side panel for details and edits.", notes: "People stay on the page." },
      { slug: "dropdown-menu", name: "DropdownMenu", from: base, description: "A list of actions behind a button." },
      { slug: "tooltip", name: "Tooltip", from: base, description: "A short hint on hover or focus.", notes: "Keep essential information out of it, because touch screens have no hover." },
      { slug: "toast", name: "Toast", from: base, description: "Short confirmation of an action.", notes: "Add Toaster once, then call toast()." },
    ],
  },
  {
    name: "Basics",
    items: [
      { slug: "button", name: "Button", from: base, description: "Primary, secondary, ghost, and danger.", notes: "It has a loading state. Set asChild to style a link." },


      { slug: "badge", name: "Badge", from: base, description: "A short status label." },
      { slug: "card", name: "Card", from: base, description: "A surface with optional header and footer." },
      { slug: "alert", name: "Alert", from: base, description: "A message inside the page, with an icon for each tone." },
      { slug: "avatar", name: "Avatar", from: base, description: "A photo, or initials when there is none.", notes: "With seed, it draws a generated avatar in place of the initials." },
      { slug: "separator", name: "Separator", from: base, description: "A horizontal or vertical divider." },
      { slug: "tabs", name: "Tabs", from: base, description: "Switch between views of the same subject.", notes: "Scrolls sideways when space runs short." },
      { slug: "pagination", name: "Pagination", from: base, description: "Moves between pages of results.", notes: "Page numbers on desktop, and a compact \"2 of 12\" on phones." },
      { slug: "stepper", name: "Stepper", from: base, description: "Progress through ordered steps.", notes: "Becomes a progress bar on phones." },
      { slug: "skeleton", name: "Skeleton", from: base, description: "A placeholder while content loads." },
      { slug: "empty-state", name: "EmptyState", from: base, description: "Explains what belongs here and what to do next." },
    ],
  },
  {
    name: "Visuals",
    items: [
      {
        slug: "social-float", name: "SocialFloat", from: base,
        description: "A floating contact button: WhatsApp, Telegram, Instagram, Messenger, X, LinkedIn, email, or phone.", notes: "With several contacts it opens a menu that works with the arrows and Escape. Networks can be mixed: then the button shows a chat icon and each row its network. Only https, mailto, and tel links come out: phones keep only their digits, usernames only letters, digits, dots, and dashes. It stays clear of the iPhone home indicator and of BottomNav.",
        props: [
          { name: "contacts", type: "SocialContact[]", description: "network (default whatsapp), name, to, detail, and message. to is a phone, an email, a username, or an https link. One goes straight to the chat." },
          { name: "message", type: "string", description: "Prefilled text, for WhatsApp and email." },
          { name: "position", type: "\"bottom-right\" | \"bottom-left\" | \"top-right\" | \"top-left\"", description: "Corner of the screen. Default bottom-right." },
          { name: "label", type: "string", description: "Short text next to the button. Hidden on phones, where it stays the name for screen readers." },
          { name: "menuTitle", type: "string", description: "Heading of the menu." },
        ],
      },      {
        slug: "confetti-button", name: "ConfettiButton", from: base,
        description: "A Button that throws confetti from itself.", notes: "Keep it for a moment worth celebrating, such as a first sale. The pieces take the chart colors of the theme. Nothing moves for people who ask for reduced motion. burstConfetti(x, y) throws it from any point, for example after a save.",
        props: [
          { name: "particles", type: "number", description: "How many pieces. Default 80." },
          { name: "colors", type: "string[]", description: "Colors of the pieces. Default the chart colors." },
        ],
      },      {
        slug: "generated-avatar", name: "GeneratedAvatar", from: base,
        description: "A shape and a small face, made from a seed.", notes: "Use it for people with no photo. avatarCode and parseAvatarCode save a chosen avatar as text, and randomAvatar picks a new one.",
        props: [
          { name: "seed", type: "string", description: "Usually the id of the person. The same seed always gives the same avatar." },
          { name: "art", type: "AvatarArt", description: "A chosen avatar, in place of the one from the seed." },
          { name: "size", type: "number", description: "Side in pixels. Default 32." },
          { name: "label", type: "string", description: "The name for screen readers. Without it, they skip the avatar." },
        ],
      },
      {
        slug: "phone-frame", name: "PhoneFrame", from: base,
        description: "A phone like a current iPhone, to preview a screen or a feed.", notes: "It has the side buttons, the Dynamic Island, the status bar and the home indicator. It keeps its proportions and never grows past its container. The content scrolls inside the screen.",
        props: [
          { name: "width", type: "number", description: "Largest width in pixels. Default 390." },
          { name: "maxHeight", type: "string", description: "Largest height as a CSS length, for example calc(100dvh - 120px). The width follows it." },
          { name: "frame", type: "string", description: "Color of the edge and the buttons. Default dark titanium." },
          { name: "screen", type: "string", description: "Background of the screen. Default white." },
          { name: "statusBar", type: "\"dark\" | \"light\" | false", description: "Text color of the status bar, or false to hide it." },
          { name: "safeArea", type: "boolean", description: "Shades the zones the system uses (status bar and home indicator) and outlines the safe area for taps and important content." },
          { name: "label", type: "string", description: "Name for screen readers." },
        ],
      },
      {
        slug: "share-preview", name: "SharePreview", from: base,
        description: "How a link looks when shared: WhatsApp, Facebook, X, LinkedIn, Telegram and a Google result.", notes: "A light mock of each app, with no logos, fed with the Open Graph tags of the page. Each one crops, truncates and drops the image like the real one: X draws the big card only with summary_large_image and an image, Google never shows the image and cuts the title near 60 characters and the snippet near 155. SharePreviews shows all of them in a grid, with the name of each network on top.",
        props: [
          { name: "network", type: "\"whatsapp\" | \"facebook\" | \"x\" | \"linkedin\" | \"telegram\" | \"google\"", description: "Which app to draw. SharePreviews takes networks, a list, in place of it. Default all." },
          { name: "url", type: "string", description: "The shared link. Its host is the domain the apps show." },
          { name: "title", type: "string", description: "og:title." },
          { name: "description", type: "string", description: "og:description." },
          { name: "image", type: "string", description: "og:image. Without it, each app shows its layout with no image." },
          { name: "siteName", type: "string", description: "og:site_name. Telegram and Google show it, and the posts use it as the account name." },
          { name: "favicon", type: "string", description: "Site icon. Google shows it, and the posts use it as the avatar." },
          { name: "card", type: "\"summary\" | \"summary_large_image\"", description: "twitter:card. Big image or small square one on X. Default big." },
          { name: "text", type: "string", description: "Text of the post above the link." },
          { name: "searchTitle", type: "string", description: "SharePreviews only: the page <title>, for Google. Default title." },
          { name: "searchDescription", type: "string", description: "SharePreviews only: the meta description, for Google. Default description." },
        ],
      },
      {
        slug: "qr-code", name: "QRCode", from: base,
        description: "A QR code, drawn as SVG.", notes: "Sharp at any size and in print. Accents and emoji are encoded as UTF-8. Text too long for a QR code shows a message in place of the code. Keep it dark on light: many scanners fail on inverted codes. qrMatrix gives the modules, to draw it your own way.",
        props: [
          { name: "value", type: "string", description: "Text or link to encode." },
          { name: "size", type: "number", description: "Side in pixels. Default 192." },
          { name: "color, background", type: "string", description: "Modules and background. Default black and white. background can be transparent." },
          { name: "level", type: "\"L\" | \"M\" | \"Q\" | \"H\"", description: "Error correction: how much damage it survives, from 7% to 30%. Default M." },
          { name: "margin", type: "number", description: "Empty border in modules. Default 4, what scanners expect." },
          { name: "download", type: "string", description: "A file name. Adds a button that saves the code as SVG." },
        ],
      },
      {
        slug: "video-player", name: "VideoPlayer", from: base,
        description: "A video with controls in the style of the library.", notes: "It is the native video, with no extra library. With the player focused: Space or K plays, the arrows seek 5 seconds and change the volume, M mutes, C turns captions on, and F goes full screen. On iPhone, full screen opens the system player. Other video attributes, such as loop or preload, pass through.",
        props: [
          { name: "src, poster", type: "string", description: "The video file and the image before it plays." },
          { name: "captions", type: "VideoCaption[]", description: "WebVTT tracks: src, srclang, label, and default." },
          { name: "title", type: "string", description: "Name of the video for screen readers." },
        ],
      },      {
        slug: "pdf-viewer", name: "PdfViewer", from: base,
        description: "A PDF inside the page, with open and download buttons.", notes: "It is the browser's own PDF viewer, with no extra library, so zoom, search, and print come from the browser. Where the browser can't show PDFs inline, as on some phones, it offers to open or download the file. Only http, https, blob, and relative links load.",
        props: [
          { name: "file", type: "string | Blob | null", description: "A link, or a File from an input. Null shows an empty state." },
          { name: "title", type: "string", description: "Name in the bar and of the download. Default the file name." },
          { name: "page", type: "number", description: "Page to open on. Default 1." },
        ],
      },

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
  { slug: "agenda", name: "Agenda", group: "Admin screens", from: "kora-ui", description: "A calendar with day, week, month, year, and list views, with event details and scheduling." },
  { slug: "team-agenda", name: "Team agenda", group: "Admin screens", from: "kora-ui", description: "One column for each person in the day view, with their avatar on top." },
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

