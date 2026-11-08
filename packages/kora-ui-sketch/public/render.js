// Renders a wireframe node tree to DOM. One renderer per component type.
// ctx = { names, current, parent, section, apps: [{name, home}], templates: {name: root}, edit, go(name) }
// Every node gets data-path ("" = root, "0.2" = root.children[0].children[2]) so the editor can find it.

let branch = null; // sucursal picked in the top menu

export const CONTAINERS = new Set(['row', 'col', 'grid', 'card', 'ref']);

// h('div.card', {onclick}, ...children). Text always via textContent: AI/user output is untrusted.
export function h(tag, attrs = {}, ...kids) {
  const [name, ...cls] = tag.split('.');
  const el = document.createElement(name);
  if (cls.length) el.className = cls.join(' ');
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style') Object.assign(el.style, v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}

// "<name> · <current app>" first (menu item "Inicio" opens "Inicio · Tienda"), else the exact screen name.
const find = (ctx, name) => {
  const key = String(name ?? '').trim().toLowerCase();
  const local = ctx.section && `${key} · ${ctx.section.toLowerCase()}`;
  return ctx.names.find((n) => n.toLowerCase() === local) || ctx.names.find((n) => n.toLowerCase() === key);
};

// Make el navigate to screen `to` on click (prototype mode only).
function link(ctx, el, to) {
  const target = find(ctx, to);
  if (!target) return el;
  el.classList.add('link');
  if (ctx.edit) return el;
  el.tabIndex = 0;
  el.addEventListener('click', (e) => { e.stopPropagation(); ctx.go(target); });
  el.addEventListener('keydown', (e) => e.key === 'Enter' && ctx.go(target));
  return el;
}

const lines = (count = 3) => Array.from({ length: count }, (_, i) => h('span.line', { style: { width: `${90 - ((i * 17) % 40)}%` } }));
const toneMark = { ok: '●', warn: '◐', danger: '▲', neutral: '○' };
const field = (label, control) => h('label.field', {}, h('span.label', {}, label || ''), control);

// Items that navigate when they match a screen name. Highlight the current screen; on
// sub-screens (detail/form) highlight the screen's `parent`; otherwise fall back to `active`.
// Menu groups the user opened/closed, kept while navigating between screens.
const groupState = new Map();
const isGroup = (it) => String(it).startsWith('# ');

function navItems(ctx, cls, items = [], active) {
  const has = (name) => name && items.some((it) => find(ctx, it) === name);
  const target = has(ctx.current) ? ctx.current : has(find(ctx, ctx.parent)) ? find(ctx, ctx.parent) : null;
  const item = (it, i) => {
    const on = target ? find(ctx, it) === target : i === (active ?? 0);
    const el = h(`div.${cls}${on ? '.active' : ''}`, {}, it);
    if (!find(ctx, it) && !ctx.edit) el.addEventListener('click', () => { el.closest('div:not(.group-items)').querySelectorAll(`.${cls}`).forEach((x) => x.classList.remove('active')); el.classList.add('active'); });
    return link(ctx, el, it);
  };
  if (!items.some(isGroup)) return items.map(item);
  // "# Title" starts a collapsible group. The group holding the current screen opens by default.
  const out = [];
  let body = null;
  items.forEach((it, i) => {
    if (!isGroup(it)) { const el = item(it, i); if (body) body.append(el); else out.push(el); return; }
    const title = it.slice(2);
    const group = h('div.menu-group');
    const head = h(`button.${cls}-group`, { type: 'button' }, h('span', {}, title), h('span.chev', { 'aria-hidden': 'true' }, '▾'));
    body = h('div.group-items');
    group.append(head, body);
    head.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = group.classList.toggle('collapsed') === false;
      head.setAttribute('aria-expanded', open);
      groupState.set(`${ctx.section}/${title}`, open);
    });
    out.push(group);
  });
  for (const group of out.filter((g) => g.classList?.contains('menu-group'))) {
    const title = group.firstChild.firstChild.textContent;
    const key = `${ctx.section}/${title}`;
    const open = groupState.get(key) ?? true; // ponytail: groups start open for now; was: only the group holding the current screen
    // Remember groups opened by visiting them, so opening another one doesn't collapse this one.
    if (open && !ctx.edit) groupState.set(key, true);
    group.classList.toggle('collapsed', !open);
    group.firstChild.setAttribute('aria-expanded', open);
  }
  return out;
}

// Select listing the project's apps (sections); picking one opens its first screen.
function appSwitch(ctx, label) {
  const apps = ctx.apps || [];
  const select = h('select', { 'aria-label': label || 'Cambiar de app', disabled: ctx.edit ? '' : null, onchange: (e) => ctx.go(e.target.value) },
    apps.map((a) => { const o = h('option', { value: a.home }, a.name); o.selected = a.name === ctx.section; return o; }));
  return h('label.appswitch', {}, label && h('span.label', {}, label), select);
}

// Always-available create actions (Nueva cotización, Nuevo cliente…): a select that opens the form.
function createMenu(ctx, names) {
  const select = h('select.create-menu', { 'aria-label': 'Crear', disabled: ctx.edit ? '' : null, onchange: (e) => ctx.go(e.target.value) },
    h('option', { value: '', selected: '' }, '＋ Crear'), names.map((n) => h('option', { value: n }, n)));
  return select;
}

function chartSvg(kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 50');
  svg.setAttribute('preserveAspectRatio', 'none');
  const vals = [30, 45, 25, 60, 40, 70, 55];
  svg.innerHTML = kind === 'pie'
    ? '<circle cx="50" cy="25" r="20" fill="#e5e5e5" stroke="#999" stroke-width=".5"/><path d="M50 25 L50 5 A20 20 0 0 1 69 31 Z" fill="#bdbdbd"/>'
    : kind === 'line'
      ? `<polyline fill="none" stroke="#888" stroke-width="1" points="${vals.map((v, i) => `${i * 16 + 2},${50 - v * 0.65}`).join(' ')}"/>`
      : vals.map((v, i) => `<rect x="${i * 14 + 3}" y="${50 - v * 0.65}" width="9" height="${v * 0.65}" fill="#cfcfcf"/>`).join('');
  return svg;
}

// Each renderer: (node, ctx, kids) => Element. `kids()` renders node.children with correct paths.
const R = {
  row: (n, _, kids) => h('div.row', { style: { gap: `${n.gap ?? 16}px`, alignItems: n.align === 'between' ? 'center' : n.align || 'stretch', justifyContent: n.align === 'between' ? 'space-between' : null } }, kids()),
  col: (n, _, kids) => h('div.col', { style: { flex: n.flex ?? 1, gap: `${n.gap ?? 16}px` } }, kids()),
  grid: (n, _, kids) => h('div.grid', { style: { gridTemplateColumns: `repeat(${n.cols || 3}, 1fr)` } }, kids()),
  card: (n, c, kids) => link(c, h('div.card', {}, n.title && h('div.card-title', {}, n.title), kids()), n.to),
  sidebar: (n, c) => h('div.sidebar', {}, n.switcher && appSwitch(c), n.title && h('div.sidebar-title', {}, n.title), navItems(c, 'side-item', n.items, n.active)),
  appswitch: (n, c) => appSwitch(c, n.label),
  // branches: the first option is the default. The choice survives moving between screens.
  nav: (n, c) => h('div.nav', {},
    h('button.menu-toggle', { type: 'button', 'aria-label': 'Menú', onclick: (e) => e.currentTarget.closest('.screen').classList.toggle('menu-open') }, '☰'),
    link(c, h('strong', {}, n.title || ''), c.names[0]),
    n.branches?.length ? h('select.branch-menu', { 'aria-label': 'Sucursal', onchange: (e) => { branch = e.target.value; } },
      n.branches.map((o) => h('option', { selected: o === (branch ?? n.branches[0]) ? '' : null }, o))) : null,
    h('div.nav-items', {}, navItems(c, 'nav-item', n.items, n.active)),
    n.create?.length ? createMenu(c, n.create) : null,
    n.search ? h('input.search.nav-search', { type: 'search', placeholder: n.search }) : null,
    n.alerts ? link(c, h('span.bell', { title: 'Alertas' }, '🔔', h('span.bell-count', {}, n.alerts)), n.alertsTo || 'Alertas') : null,
    n.user && h('div.nav-user', {}, h('span.avatar.sm'), n.user)),
  tabs: (n, c) => h('div.tabs', {}, navItems(c, 'tab', n.items, n.active)),
  divider: () => h('hr'),
  spacer: (n) => h('div.spacer', { style: { height: `${n.size ?? 16}px` } }),
  heading: (n) => h(`h${Math.min(Math.max(+n.level || 2, 1), 3)}.heading`, {}, n.text || ''),
  text: (n) => (n.text ? h('p.text', {}, n.text) : h('div.lines', {}, lines(n.lines))),
  image: (n) => h('div.image', { style: { height: `${n.height || 160}px` } }, n.label && h('span', {}, n.label)),
  avatar: (n) => h('div.avatar-wrap', {}, h('span.avatar'), n.label),
  icon: (n) => { const chars = [...(n.label || '?')]; return h('span.icon', { title: n.label }, chars.length <= 3 ? chars.join('') : chars[0]); },
  badge: (n) => h(`span.badge.${n.tone || 'neutral'}`, {}, `${toneMark[n.tone] || '○'} ${n.text || ''}`),
  alert: (n, c) => link(c, h(`div.alert.${n.tone || 'neutral'}`, {}, `${toneMark[n.tone] || '○'}  ${n.text || ''}`), n.to),
  stat: (n, c) => link(c, h('div.stat', {}, h('span.label', {}, n.label), h('strong', {}, n.value ?? '—'), n.hint && h('small', {}, n.hint)), n.to),
  chart: (n) => h('div.chart', { style: { height: `${n.height || 180}px` } }, n.label && h('span.label', {}, n.label), chartSvg(n.kind)),
  table: (n, c) => {
    const cols = n.columns?.length ? n.columns : ['Columna'];
    const data = n.data?.length ? n.data : Array.from({ length: n.rows || 5 }, () => cols.map(() => null));
    return h('table', {},
      h('thead', {}, h('tr', {}, cols.map((col) => h('th', {}, col)))),
      h('tbody', {}, data.map((r) => link(c, h('tr', {}, cols.map((_, i) => h('td', {}, r?.[i] ?? h('span.line', { style: { width: '70%' } })))), n.rowTo))));
  },
  list: (n, c) => h('ul.list', {}, (n.items || []).map((it) => link(c, h('li', {}, it), n.to || it))),
  steps: (n) => h('ol.steps', {}, (n.items || []).map((it, i) => h(`li${i < (n.active ?? 0) ? '.done' : i === (n.active ?? 0) ? '.current' : ''}`, {}, h('span.dot', {}, i + 1), it))),
  calendar: (n) => {
    const week = n.view === 'week';
    return h('div.calendar', {}, n.label && h('div.card-title', {}, n.label),
      h('div.cal-grid', {}, ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => h('div.cal-head', {}, d)),
        Array.from({ length: week ? 7 : 35 }, (_, i) => h('div.cal-day', { style: { minHeight: week ? '160px' : null } }, h('small', {}, (i % 31) + 1), i % 4 === 1 && h('span.cal-event')))));
  },
  // cards[i] = card texts for column i ("Title · detail · detail"); no cards = placeholder cards.
  kanban: (n, c) => h('div.kanban', {}, (n.columns || []).map((col, i) => h('div.kan-col', {},
    h('div.card-title', {}, col, n.cards?.[i] ? h('span.kan-count', {}, n.cards[i].length) : null),
    n.cards ? (n.cards[i] || []).map((txt) => { const [title, ...rest] = String(txt).split(' · '); return link(c, h('div.kan-card', {}, h('strong', {}, title), rest.length ? h('small', {}, rest.join(' · ')) : null), n.to); })
      : Array.from({ length: 3 - (i % 2) }, () => link(c, h('div.kan-card', {}, lines(2)), n.to))))),
  timeline: (n) => h('ul.timeline', {}, (n.items || []).map((it) => h('li', {}, h('span.dot'), it))),
  input: (n) => field(n.label, h('input', { placeholder: n.placeholder || '' })),
  select: (n) => field(n.label, h('select', {}, h('option', {}, n.placeholder || 'Seleccionar…'), (n.options || []).map((o) => h('option', {}, o)))),
  textarea: (n) => field(n.label, h('textarea', { rows: n.rows || 3 })),
  date: (n) => field(n.label, h('input', { type: 'date' })),
  checkbox: (n) => h('label.check', {}, h('input', { type: 'checkbox' }), n.label),
  toggle: (n) => h('label.check.toggle', {}, h('input', { type: 'checkbox', role: 'switch' }), n.label),
  upload: (n) => h('label.upload', {}, h('input', { type: 'file', multiple: '' }), `⇪ ${n.label || 'Subir archivos'}`),
  search: (n) => h('input.search', { type: 'search', placeholder: n.placeholder || 'Buscar…' }),
  // Reuse: `ref` renders a template screen; its children fill the template's `slot`.
  // Template internals are not editable from an instance (edit the template screen instead).
  ref: (n, c, kids) => {
    const tpl = c.templates?.[n.name];
    if (!tpl || (c.depth || 0) > 8) return h('div.unknown', {}, `[plantilla "${n.name}" no existe]`, kids());
    return h('div.ref', {}, render(tpl, { ...c, edit: false, slot: kids, depth: (c.depth || 0) + 1 }));
  },
  slot: (n, c) => (c.slot ? h('div.slot', {}, c.slot()) : h('div.slot.empty', {}, 'slot — aquí va el contenido de cada pantalla')),
  button: (n, c) => link(c, h(`button.${n.variant || 'secondary'}`, { type: 'button' }, n.label || 'Botón'), n.to),
};

export function render(node, ctx, path = '') {
  if (!node || typeof node !== 'object') return null;
  const kids = () => (node.children || []).map((child, i) => render(child, ctx, path ? `${path}.${i}` : `${i}`));
  const fn = R[node.type];
  const el = fn ? fn(node, ctx, kids) : h('div.unknown', {}, `[${node.type}]`, kids());
  if (ctx.edit) {
    el.classList.add('node');
    el.dataset.path = path;
    el.dataset.type = node.type;
    if (CONTAINERS.has(node.type)) el.dataset.container = '';
    if (path) el.draggable = true;
  }
  return el;
}
