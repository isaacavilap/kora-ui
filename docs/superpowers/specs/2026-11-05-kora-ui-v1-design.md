# kora-ui v1: librería para construir dashboards

Fecha: 2026-11-05. Estado: aprobado e implementado en la rama `v1`.

## Objetivo

kora-ui se reescribe desde cero como librería React para dashboards de admin y analítica. Un proyecto nuevo debe poder montar acceso, layout, métricas, tablas, gráficos, cuenta y equipo sin diseñar ni reimplementar esas piezas. Todos los proyectos comparten la misma apariencia y solo cambian marca y acento.

Criterio de éxito: `apps/docs` incluye un dashboard demo completo, con login incluido, construido solo con la API pública y sin CSS específico de pantalla.

## Decisiones

| Tema | Decisión |
|---|---|
| Tipo de dashboard | Admin y analítica |
| Distribución | Paquete npm, sin registry de copy-paste |
| Apariencia | Un look neutro y denso, con claro y oscuro |
| Base técnica | Radix, TanStack Table y Recharts, con diseño propio |
| Código actual | No se reutiliza. Queda en el historial de git y en npm `0.4.0` |

## Fuera de v1

Kanban, editor de layout arrastrable, tiempo real, form builder, mapas, firma, texto enriquecido, virtualización de tablas, adaptadores por proveedor de auth y themes adicionales.

La virtualización se agrega cuando una tabla real no funcione bien con paginación. Los adaptadores se agregan cuando los ejemplos de las docs se repitan demasiado entre proyectos.

## Arquitectura

```
packages/kora-ui/src/
  components/   entrada "kora-ui"           layout, base, formularios, métricas
  table/        entrada "kora-ui/table"     DataTable, FilterBar
  charts/       entrada "kora-ui/charts"    gráficos, Sparkline
  auth/         entrada "kora-ui/auth"      pantallas de acceso
  screens/      entrada "kora-ui/screens"   errores, cuenta, equipo, onboarding
  styles/       tokens y "kora-ui/styles.css"
apps/docs/      documentación Next.js, secciones Components y Templates
```

Dirección de dependencias: `components` no importa a nadie. `table` y `charts` importan `components`. `auth` importa `components`. `screens` importa `components` y `table`.

### Empaquetado

- Build con tsup, solo ESM, con `"use client"` por entrada y `sideEffects` limitado a CSS.
- Peers: `react` y `react-dom` 18 y 19.
- Dependencias: `radix-ui`, `@tanstack/react-table`, `recharts`, `react-day-picker`, `sonner` y `lucide-react`.
- Se eliminan la entrada `client`, `prepend-use-client.mjs`, `themes.json` y todas las dependencias actuales que no estén en esta lista.
- `repository` y `bugs` pasan a apuntar a `isaacavilap/kora-ui`.

### Estilos

- Tailwind v4 es solo una herramienta interna. El consumidor importa `kora-ui/styles.css` y no necesita Tailwind.
- Las clases usan prefijo `kr:` y se compilan dentro de `@layer kora`, de modo que el CSS del consumidor sin capa siempre gana.
- `className` se pasa a la raíz de cada componente.
- Tokens públicos: `--kora-accent`, `--kora-radius`, `--kora-chart-1` a `--kora-chart-6` y los colores semánticos de superficie, texto, borde y estado.
- Modo oscuro con la clase `.dark` en un ancestro. Densidad con `data-density="compact"`.

### Configuración global

`KoraProvider` es opcional y recibe:

- `locale`: `"es"` o `"en"`. El valor por defecto es `"en"`.
- `linkComponent`: componente de enlace del router, por ejemplo `next/link`. El valor por defecto es `<a>`.
- `brand`: `{ name, logo }`, usado por `AuthLayout`, `Sidebar` y `ErrorScreen`.

## Catálogo

**Layout:** `AppShell`, `Sidebar`, `SidebarGroup`, `SidebarUser`, `Topbar`, `PageHeader`, `Grid`, `Breadcrumbs`, `CommandPalette`, `NotificationsMenu`, `ThemeToggle`.

**Base:** `Button`, `Badge`, `Card`, `Alert`, `Avatar`, `Separator`, `DescriptionList`, `Timeline`, `Tabs`, `Dialog`, `Sheet`, `DropdownMenu`, `Tooltip`, `Toast`, `Skeleton`, `EmptyState`, `Pagination`, `Stepper`.

**Formularios:** `Field`, `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Switch`, `OtpInput`, `DateRangePicker`.

**Métricas:** `KpiCard` con delta y sparkline, `StatGroup`, `Progress`, `ChartCard`, `SegmentedControl`, `RankedList`, `SegmentBar`, `Funnel`, `Gauge`, `Heatmap`. `KpiCard` dibuja su sparkline con SVG propio para no cargar Recharts en la entrada principal.

**Tabla:** `DataTable`, `FilterBar`.

**Gráficos:** `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `Sparkline`.

**Acceso:** `AuthLayout`, `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `ResetPasswordScreen`, `VerifyEmailScreen`, `OtpScreen`, `AcceptInviteScreen`.

**Pantallas:**

- Errores: `ErrorScreen` con `variant` `404`, `403`, `500` o `maintenance`.
- Cuenta: `AccountScreen`, compuesta por `ProfileSettings`, `PasswordSettings`, `SecuritySettings` y `SessionsSettings`.
- Equipo: `MembersScreen` e `InviteMemberDialog`.
- Onboarding: `OnboardingWizard`.

**Agregado tras revisar pantallas reales de administración:**

- Layout: `BottomNav`, `ScopeSwitcher`, `SectionNav`, `SaveBar`, `SidebarGroup`, `CommandPalette`, `NotificationsMenu`, `ThemeScript`.
- Widgets: `ChartCard`, `SegmentedControl`, `RankedList`, `SegmentBar`, `Funnel`, `Gauge`, `Heatmap`, `StageCounters`, `QuickActions`, `DocumentList`, `AlertList`, `DescriptionList`, `Timeline`.
- Otros: `EventCalendar`, `ConfirmDialog`, `FileDropzone`.
- `DataTable`: vista de tarjetas, filas expandibles, totales, CSV y filtros controlados.
- Plantillas: dashboards (ventas, suscripciones, operaciones), varias empresas (vista de grupo, ajustes por empresa, permisos) y pantallas de administración (hoy, listas por etapa, detalle, formulario, agenda, catálogo, reporte, actividad, ajustes).

**Herramientas alrededor de la librería:**

- `kora-ui-mcp`: servidor MCP por stdio, y remoto en `/mcp` del sitio de docs. El catálogo sale del registro de las docs al compilar.
- `/llms.txt`: el mismo contenido para asistentes sin MCP.
- `kora-starter`: repositorio aparte, base en Next.js. Consume `kora-ui` desde npm, como cualquier proyecto.
- Versionado con Changesets. Ver `VERSIONING.md`.

## Contrato de las pantallas

Las pantallas no conocen backend, router ni proveedor de auth. Todas siguen las mismas reglas:

1. Los datos entran por props y las acciones salen por callbacks async.
2. Mientras la promesa está pendiente, el envío se bloquea y el botón muestra carga.
3. Si la promesa falla, la pantalla muestra un mensaje genérico y conserva lo escrito, excepto contraseñas y códigos. La prop `error` reemplaza ese mensaje.
4. Los textos vienen del `locale` y se pueden cambiar con la prop `labels`.
5. La validación es solo de formato: email, campos requeridos, longitud mínima y coincidencia de contraseñas.

```tsx
<LoginScreen
  providers={["google"]}
  onSubmit={({ email, password }) => signIn(email, password)}
  onProvider={(provider) => signInWith(provider)}
  onMagicLink={({ email }) => sendMagicLink(email)}
  links={{ forgotPassword: "/forgot", register: "/register" }}
/>
```

Cada opción aparece solo si se pasa su callback o enlace. `OnboardingWizard` recibe `steps`, `initialStep`, `onStepChange` y `onComplete`, y el consumidor decide cómo persistir el avance. `MembersScreen` recibe `members`, `roles` y `canManage`, y delega cada cambio a callbacks.

### Seguridad

- kora-ui no guarda tokens, no gestiona sesiones, no redirige y no registra credenciales.
- Los textos por defecto de login y recuperación no revelan si un correo existe.
- Los campos usan el `autocomplete` correcto, incluidos `current-password`, `new-password` y `one-time-code`.
- `canManage` y la validación de formato solo afectan a la interfaz. La autorización y la validación real son responsabilidad del backend, y las docs lo indican.
- Los códigos de recuperación de `SecuritySettings` se reciben por props y no se conservan al desmontar.

## Datos

`DataTable` funciona en dos modos:

- **Cliente:** recibe todas las filas y resuelve orden, filtro y paginación.
- **Servidor:** con `manual`, `rowCount`, `state` y `onStateChange`, el consumidor consulta y entrega cada página.

Incluye selección de filas, acciones masivas y estados `loading`, `empty` y `error`. Los componentes de datos y los gráficos aceptan esos mismos tres estados con las mismas props.

```tsx
<LineChart data={rows} x="date" series={[{ key: "revenue", label: "Ingresos" }]} summary="Ingresos por día" />
```

Los gráficos toman el color de `--kora-chart-*`, se adaptan al contenedor y funcionan en claro y oscuro. `summary` es obligatorio y actúa como descripción accesible.

## Responsive

Todo funciona en móvil y escritorio sin props adicionales: sidebar como drawer bajo 1024px, filas de `DataTable` como tarjetas bajo 768px, diálogos anclados abajo en teléfonos, controles de tamaño táctil y texto de 16px en inputs móviles. Se verifica a 320, 390, 768 y 1440px.

## Calidad y pruebas

- **Lógica:** Vitest y Testing Library para los modos de `DataTable`, `OtpInput`, el contrato de envío de pantallas, validación y `OnboardingWizard`. Sin snapshots ni una prueba por cada componente visual.
- **Accesibilidad:** navegación por teclado, foco visible, contraste AA y `prefers-reduced-motion`. Revisión con axe sobre el demo.
- **Integración:** Playwright sobre `apps/docs` para login, tabla, cambio de tema y un recorrido del demo.
- **Paquete:** `typecheck`, build y una prueba de consumo en una app limpia sin Tailwind.
- **UI:** `impeccable` antes de dar por terminado cada hito visible.

## Entrega

Todo el trabajo ocurre en la rama `v1`. `main` y el sitio actual no cambian hasta el merge final. Cada hito tiene su propio plan.

| Hito | Contenido | Resultado |
|---|---|---|
| 0. Base | Limpieza, build, tokens, `KoraProvider`, estructura de docs | Paquete vacío que compila y se consume |
| 1. Componentes | Base, formularios y layout | Shell navegable en docs |
| 2. Acceso y errores | `kora-ui/auth` y `ErrorScreen` | Primer `1.0.0-alpha`, usable en un proyecto real |
| 3. Datos | Métricas, `DataTable`, `FilterBar` y gráficos | Dashboard demo con datos |
| 4. Pantallas | Cuenta, equipo y onboarding | Demo completo |
| 5. Lanzamiento | Docs finales, merge a `main`, `1.0.0` en `latest` | v1 pública |

Las alphas se publican con el tag `next`, así `latest` sigue en `0.4.0` hasta el hito 5. Cada publicación en npm y el merge a `main` requieren confirmación explícita.

## Riesgos

- TanStack Table 9, Recharts 3 y `react-day-picker` 10 son majors recientes. Su API se verifica en Context7 al planificar cada hito.
- Las pantallas fijan decisiones visuales y de flujo. Si un proyecto necesita otro flujo, compone las piezas de `kora-ui` directamente en lugar de agregar props sin límite.
- El alcance es amplio. Si hay que recortar, el orden de los hitos protege primero lo que más se repite entre proyectos: acceso, layout y datos.
