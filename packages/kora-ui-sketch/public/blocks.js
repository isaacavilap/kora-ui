// Built-in block library. Layout patterns inspired by shadcn/ui blocks (MIT), redrawn as lo-fi nodes.
// Dropping a block inserts an editable copy. To reuse it linked, select it and "Crear plantilla".

const t = (type, props = {}, children) => (children ? { type, ...props, children } : { type, ...props });
const row = (children, props = {}) => t('row', { gap: 16, ...props }, children);
const col = (children, props = {}) => t('col', { gap: 16, ...props }, children);
const card = (title, children) => t('card', { title }, children);
const pageHeader = (title, desc, actions) => row([col([t('heading', { text: title, level: 1 }), t('text', { text: desc })]), row(actions, { gap: 8, align: 'center' })], { align: 'between' });

export default [
  // --- Autenticación ---
  { group: 'Autenticación', name: 'Login simple', node: row([col([], { flex: 1 }), col([card('Iniciar sesión', [
    t('text', { text: 'Ingresa tu correo para acceder a tu cuenta' }),
    t('input', { label: 'Correo', placeholder: 'm@ejemplo.com' }), t('input', { label: 'Contraseña', placeholder: '••••••••' }),
    t('button', { label: 'Entrar', variant: 'primary' }), t('button', { label: 'Entrar con Google' }),
    t('button', { label: '¿No tienes cuenta? Regístrate', variant: 'ghost' }),
  ])], { flex: 1 }), col([], { flex: 1 })]) },
  { group: 'Autenticación', name: 'Login con imagen', node: row([
    col([t('spacer', { size: 80 }), t('heading', { text: 'Bienvenido de nuevo', level: 1 }), t('text', { text: 'Accede a tu cuenta' }),
      t('input', { label: 'Correo' }), t('input', { label: 'Contraseña' }), t('checkbox', { label: 'Recordarme' }),
      t('button', { label: 'Entrar', variant: 'primary' }), t('button', { label: '¿Olvidaste tu contraseña?', variant: 'ghost' })], { flex: 1 }),
    col([t('image', { label: 'Imagen / marca', height: 560 })], { flex: 1 }),
  ]) },
  { group: 'Autenticación', name: 'Registro', node: row([col([], { flex: 1 }), col([card('Crear cuenta', [
    t('grid', { cols: 2 }, [t('input', { label: 'Nombre' }), t('input', { label: 'Apellido' })]),
    t('input', { label: 'Correo' }), t('input', { label: 'Contraseña' }), t('input', { label: 'Confirmar contraseña' }),
    t('checkbox', { label: 'Acepto términos y condiciones' }), t('button', { label: 'Crear cuenta', variant: 'primary' }),
  ])], { flex: 1 }), col([], { flex: 1 })]) },
  { group: 'Autenticación', name: 'Código de verificación', node: card('Verifica tu correo', [
    t('text', { text: 'Enviamos un código de 6 dígitos a m@ejemplo.com' }),
    t('grid', { cols: 6 }, Array.from({ length: 6 }, () => t('input', { label: '' }))),
    t('button', { label: 'Verificar', variant: 'primary' }), t('button', { label: 'Reenviar código', variant: 'ghost' }),
  ]) },

  // --- App shell ---
  { group: 'App shell', name: 'Sidebar + header', node: col([
    t('nav', { title: 'Acme Inc.', items: [], user: 'usuario@acme.com' }),
    row([t('sidebar', { title: 'Plataforma', items: ['Panel', 'Proyectos', 'Equipo', 'Reportes', 'Configuración'], active: 0 }),
      col([t('slot')], { flex: 5 })], { gap: 0 }),
  ], { gap: 0 }) },
  { group: 'App shell', name: 'Header con pestañas', node: col([
    t('nav', { title: 'Acme Inc.', items: ['Resumen', 'Clientes', 'Productos', 'Configuración'], user: 'Usuario' }),
    col([t('slot')]),
  ], { gap: 0 }) },
  { group: 'App shell', name: 'App móvil', node: col([
    t('nav', { title: 'App', items: [] }), col([t('slot')]),
    t('tabs', { items: ['Inicio', 'Buscar', 'Alertas', 'Perfil'], active: 0 }),
  ], { gap: 0 }) },

  // --- Dashboard ---
  { group: 'Dashboard', name: 'Encabezado de página', node: pageHeader('Panel', 'Resumen de la actividad de tu negocio', [t('date', { label: '' }), t('button', { label: 'Descargar' }), t('button', { label: '+ Nuevo', variant: 'primary' })]) },
  { group: 'Dashboard', name: 'Tarjetas KPI', node: t('grid', { cols: 4 }, [
    t('stat', { label: 'Ingresos totales', value: 'B/. 45,231', hint: '+20.1% vs mes anterior' }),
    t('stat', { label: 'Clientes nuevos', value: '1,234', hint: '–20% este periodo' }),
    t('stat', { label: 'Cuentas activas', value: '45,678', hint: '+12.5% retención' }),
    t('stat', { label: 'Tasa de crecimiento', value: '4.5%', hint: 'según proyección' }),
  ]) },
  { group: 'Dashboard', name: 'Gráfico de área', node: card('Visitantes totales', [
    row([t('text', { text: 'Total de los últimos 3 meses' }), t('tabs', { items: ['3 meses', '30 días', '7 días'], active: 0 })], { align: 'between' }),
    t('chart', { kind: 'line', height: 240 }),
  ]) },
  { group: 'Dashboard', name: 'Ventas recientes', node: card('Ventas recientes', [
    t('text', { text: 'Hiciste 265 ventas este mes' }),
    ...['Olivia Martín', 'Jackson Lee', 'Isabel Núñez', 'William Kim'].map((n, i) => row([t('avatar', { label: n }), t('text', { text: `+B/. ${[1999, 39, 299, 99][i]}.00` })], { align: 'between' })),
  ]) },
  { group: 'Dashboard', name: 'Dashboard completo', node: col([
    pageHeader('Panel', 'Resumen', [t('button', { label: 'Descargar' })]),
    t('grid', { cols: 4 }, ['Ingresos', 'Suscripciones', 'Ventas', 'Activos ahora'].map((l) => t('stat', { label: l, value: '0', hint: '+0% vs mes anterior' }))),
    row([col([t('chart', { kind: 'bar', label: 'Resumen', height: 280 })], { flex: 2 }), col([card('Ventas recientes', [t('list', { items: ['Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4'] })])])]),
  ]) },

  // --- Datos ---
  { group: 'Datos', name: 'Tabla con filtros', node: col([
    row([row([t('search', { placeholder: 'Filtrar…' }), t('select', { label: '', placeholder: 'Estado', options: ['Todos', 'Activo', 'Inactivo'] })], { gap: 8 }),
      row([t('button', { label: 'Columnas ▾' }), t('button', { label: '+ Agregar', variant: 'primary' })], { gap: 8 })], { align: 'between' }),
    t('table', { columns: ['☐', 'Estado', 'Correo', 'Monto', '⋯'], data: [['☐', 'Exitoso', 'ken99@ejemplo.com', 'B/. 316.00', '⋯'], ['☐', 'Procesando', 'abe45@ejemplo.com', 'B/. 242.00', '⋯'], ['☐', 'Fallido', 'carmella@ejemplo.com', 'B/. 721.00', '⋯']] }),
    row([t('text', { text: '0 de 3 filas seleccionadas' }), row([t('button', { label: 'Anterior' }), t('button', { label: 'Siguiente' })], { gap: 8 })], { align: 'between' }),
  ]) },
  { group: 'Datos', name: 'Estado vacío', node: card('', [
    t('spacer', { size: 24 }), t('icon', { label: '+' }), t('heading', { text: 'Aún no hay registros', level: 3 }),
    t('text', { text: 'Crea el primero para empezar.' }), t('button', { label: '+ Crear', variant: 'primary' }), t('spacer', { size: 24 }),
  ]) },
  { group: 'Datos', name: 'Lista de actividad', node: card('Actividad', [t('timeline', { items: ['Hace 2 min · Ana creó la orden #1048', 'Hace 1 h · Carlos editó al cliente J. Pérez', 'Ayer · Pago recibido B/. 1,200'] })]) },
  { group: 'Datos', name: 'Tablero kanban', node: t('kanban', { columns: ['Pendiente', 'En progreso', 'En revisión', 'Hecho'] }) },
  { group: 'Datos', name: 'Página de calendario', node: col([pageHeader('Calendario', 'Agenda del equipo', [t('tabs', { items: ['Mes', 'Semana', 'Día'], active: 0 }), t('button', { label: '+ Evento', variant: 'primary' })]), t('calendar', { label: 'Noviembre 2026', view: 'month' })]) },

  // --- Formularios ---
  { group: 'Formularios', name: 'Configuración', node: col([
    pageHeader('Configuración', 'Administra tu cuenta y preferencias', []),
    t('tabs', { items: ['Perfil', 'Cuenta', 'Apariencia', 'Notificaciones'], active: 0 }),
    card('Perfil', [t('input', { label: 'Usuario' }), t('input', { label: 'Correo' }), t('textarea', { label: 'Biografía', rows: 3 }), t('button', { label: 'Guardar cambios', variant: 'primary' })]),
    card('Notificaciones', [t('toggle', { label: 'Correos de marketing' }), t('toggle', { label: 'Correos de seguridad' })]),
  ]) },
  { group: 'Formularios', name: 'Formulario 2 columnas', node: card('Nuevo registro', [
    t('grid', { cols: 2 }, [t('input', { label: 'Nombre' }), t('input', { label: 'Teléfono' }), t('select', { label: 'Tipo', options: ['A', 'B'] }), t('date', { label: 'Fecha' })]),
    t('textarea', { label: 'Notas' }), t('upload', { label: 'Adjuntos' }),
    row([t('button', { label: 'Cancelar' }), t('button', { label: 'Guardar', variant: 'primary' })], { gap: 8, align: 'end' }),
  ]) },
  { group: 'Formularios', name: 'Asistente por pasos', node: col([
    t('steps', { items: ['Datos', 'Detalles', 'Revisión', 'Listo'], active: 1 }),
    card('Paso 2 · Detalles', [t('input', { label: 'Campo' }), t('select', { label: 'Opción', options: ['1', '2'] })]),
    row([t('button', { label: '← Atrás' }), t('button', { label: 'Siguiente →', variant: 'primary' })], { align: 'between' }),
  ]) },
  { group: 'Formularios', name: 'Confirmación', node: card('¿Estás seguro?', [
    t('text', { text: 'Esta acción no se puede deshacer. Se eliminará el registro permanentemente.' }),
    row([t('button', { label: 'Cancelar' }), t('button', { label: 'Eliminar', variant: 'primary' })], { gap: 8, align: 'end' }),
  ]) },

  // --- Marketing ---
  { group: 'Marketing', name: 'Precios', node: t('grid', { cols: 3 }, ['Básico', 'Pro', 'Empresa'].map((p, i) => card(p, [
    t('heading', { text: ['B/. 0', 'B/. 29', 'B/. 99'][i], level: 1 }), t('text', { text: 'por mes' }),
    t('list', { items: ['Característica 1', 'Característica 2', 'Característica 3'] }),
    t('button', { label: 'Elegir plan', variant: i === 1 ? 'primary' : 'secondary' }),
  ]))) },
  { group: 'Marketing', name: 'Hero', node: row([
    col([t('badge', { text: 'Nuevo' }), t('heading', { text: 'Titular principal del producto', level: 1 }), t('text', { lines: 3 }),
      row([t('button', { label: 'Empezar', variant: 'primary' }), t('button', { label: 'Ver demo' })], { gap: 8 })]),
    col([t('image', { label: 'Captura del producto', height: 320 })]),
  ], { align: 'center' }) },
  { group: 'Marketing', name: 'Tarjeta de perfil', node: card('', [row([t('avatar', { label: '' }), col([t('heading', { text: 'Nombre Apellido', level: 3 }), t('text', { text: 'Cargo · Departamento' })])], { align: 'center' }), t('divider'), t('list', { items: ['correo@ejemplo.com', '+507 6000-0000'] })]) },
];
