---
"kora-ui": minor
"kora-ui-mcp": minor
---

Add Kanban. KpiCard takes a `hint` and passes other props to its card, such as `onClick`. A DataTable column reads the key named by its `id` when it has no `accessor`.

CardContent, page content, TabsContent and the bodies of Dialog and Sheet now separate their children, so pages do not need to. Stack keeps its column inside its container. Kanban columns accept `count`.

Kanban cards can move between columns with `onCardMove`: by dragging, or with a menu on each card for keyboard and touch.
