# kora-ui

## 1.0.0-next.1

### Minor Changes

- f6bfa3d: EventCalendar has day, week, month, year, and list views. Replace `defaultMonth` with `defaultDate`, and `onDayClick` with `onAddEvent`. BottomNav now shows the current page and keeps every item the same width. With `people`, the day view has one column for each person. Add GeneratedAvatar, and a `seed` option for Avatar. Add UserMenu and FileName. The search button has no border on phones.
- f6bfa3d: Add Kanban. KpiCard takes a `hint` and passes other props to its card, such as `onClick`. A DataTable column reads the key named by its `id` when it has no `accessor`.
  
  CardContent, page content, TabsContent and the bodies of Dialog and Sheet now separate their children, so pages do not need to. Stack keeps its column inside its container. Kanban columns accept `count`.
  
  Kanban cards can move between columns with `onCardMove`: by dragging, or with a menu on each card for keyboard and touch.
- f6bfa3d: Add Stack, Inline, Heading, Text, Form, and FormActions, so pages need no native tags. Progress can take its color from `ranges`, and `fill` can be solid, gradient, or segments. StatGroup has visible dividers and the same height for each number. Select has a `native` option. Add ImageInput and compressImage, which compress images in the browser. The default theme is now neutral: black, white, and gray, with color only for status and charts.

### Patch Changes

- 5ccfd7a: Rebuild kora-ui as a dashboard library, with layout, data tables, charts, widgets, access and settings screens, and support for multiple companies. Add kora-ui-mcp, which gives AI assistants the components and templates.
