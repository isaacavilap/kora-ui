// App state, sections/screens navigation, AI generation and the drag & drop editor.
import { h, render, CONTAINERS } from './render.js';
import { archDiagram } from './arch.js';
import BLOCKS from './blocks.js';
import BUILTIN_KITS from './kits.js';

const $ = (id) => document.getElementById(id);
const STORE = 'wireframe';
// Cloud mode (portal.istmocode.com/p/<slug>): the proposal comes from the API and the server decides who is admin.
const slug = location.pathname.match(/^\/p\/([a-z0-9-]+)/)?.[1];
// A cloud proposal autosaves, so tools that replace the whole document only exist in the local builder.
document.body.classList.toggle('cloud', !!slug);
let doc = slug ? null : JSON.parse(localStorage.getItem(STORE) || 'null');
let files = []; // documents attached to the cloud proposal
let refs = []; // design references left on the cloud proposal
let refsError = '';
let refsDraft = { url: '', note: '' };
let clientName = ''; // shown on the quote
// View state survives reloads (live reload while the code changes).
const view = JSON.parse(sessionStorage.getItem('view') || '{}');
let editing = !!view.editing;
let mobilePreview = view.mobile ?? matchMedia('(max-width: 860px)').matches;
let panelHidden = !!view.panelHidden; // the left proposal panel can be hidden to see the prototype full width
let hostingChoice = null; // server option picked in the proposal; null = recommended
const addonsChosen = new Set(); // add-ons the client ticked in the proposal
// Clients see the proposal and the prototype only; tools that change the project need ?admin in the URL.
let admin = !slug && new URLSearchParams(location.search).has('admin');
function setAdmin(on) {
  admin = !!on;
  document.body.classList.toggle('admin', admin);
  if (!admin) editing = false;
}
setAdmin(admin);
let selected = view.selected ?? null; // node path inside current screen root ('' = root); null = the screen itself
const undoStack = [];

// ---------- defaults used by the palette and the inspector ----------
const DEFAULTS = {
  Layout: {
    row: { gap: 16, align: 'start', children: [] },
    col: { flex: 1, gap: 16, children: [] },
    grid: { cols: 3, children: [] },
    card: { title: 'Tarjeta', to: '', children: [] },
    divider: {},
    spacer: { size: 16 },
    slot: {},
  },
  Navegación: {
    nav: { title: 'App', items: [], create: [], search: '', alerts: 0, alertsTo: '', user: 'Usuario' },
    sidebar: { switcher: false, title: '', items: ['Inicio', '# Grupo', 'Sección'], active: 0 },
    appswitch: { label: '' },
    tabs: { items: ['Pestaña 1', 'Pestaña 2'], active: 0 },
    button: { label: 'Botón', variant: 'secondary', to: '' },
  },
  Contenido: {
    heading: { text: 'Título', level: 2 },
    text: { text: '', lines: 3 },
    image: { label: 'Imagen', height: 160 },
    stat: { label: 'Métrica', value: '0', hint: '', to: '' },
    chart: { kind: 'bar', label: 'Gráfico', height: 180 },
    table: { columns: ['Columna 1', 'Columna 2', 'Columna 3'], rows: 4, data: [], rowTo: '' },
    list: { items: ['Elemento 1', 'Elemento 2'], to: '' },
    badge: { text: 'Estado', tone: 'neutral' },
    alert: { text: 'Mensaje', tone: 'warn', to: '' },
    steps: { items: ['Paso 1', 'Paso 2', 'Paso 3'], active: 0 },
    timeline: { items: ['Evento 1', 'Evento 2'] },
    calendar: { label: 'Calendario', view: 'month' },
    kanban: { columns: ['Por hacer', 'En curso', 'Hecho'], cards: [['Tarea 1 · detalle', 'Tarea 2'], ['Tarea 3'], []], to: '' },
    avatar: { label: 'Nombre' },
    icon: { label: '★' },
  },
  Formularios: {
    input: { label: 'Campo', placeholder: '' },
    select: { label: 'Selección', placeholder: '', options: ['Opción 1', 'Opción 2'] },
    textarea: { label: 'Comentario', rows: 3 },
    date: { label: 'Fecha' },
    checkbox: { label: 'Opción' },
    toggle: { label: 'Activar' },
    upload: { label: 'Subir archivos' },
    search: { placeholder: 'Buscar…' },
  },
};
const DEF = Object.assign({}, ...Object.values(DEFAULTS), { ref: { name: '', children: [] } });
const ENUMS = {
  variant: ['primary', 'secondary', 'ghost'], tone: ['neutral', 'ok', 'warn', 'danger'], kind: ['bar', 'line', 'pie'],
  align: ['start', 'center', 'end', 'between'], view: ['month', 'week'], level: [1, 2, 3],
};
const LINK_PROPS = ['to', 'rowTo', 'parent', 'alertsTo'];
const TEMPLATES = 'Plantillas';
const fresh = (type) => ({ type, ...structuredClone(DEF[type]) });

// ---------- state helpers ----------
// Template screens are reusable pieces (used via `ref`): visible only while editing.
const screens = () => (doc?.screens || []).filter((s) => editing || !s.template);
const names = () => screens().map((s) => s.name);
const pageNames = () => screens().filter((s) => !s.template).map((s) => s.name);
const templates = () => (doc?.screens || []).filter((s) => s.template);
// Free add-on row, shared by the panel and the PDF. Plain strings still work.
const extraItem = (x) => (typeof x === 'string' ? h('li', {}, x) : h('li', {},
  h('strong', {}, x.name, x.tag ? h('span.extra-tag', {}, x.tag) : null),
  x.detail ? h('span', {}, x.detail) : null));
const sectionOf = (s) => (s?.template ? TEMPLATES : s?.section || 'General');
const sections = () => [...new Set(screens().map(sectionOf))];
const findName = (name) => names().find((n) => n.toLowerCase() === String(name ?? '').trim().toLowerCase());
const hashName = () => findName(decodeURIComponent(location.hash.slice(1)));
const screen = () => screens().find((s) => s.name === (hashName() || pageNames()[0]));
const go = (name) => { location.hash = encodeURIComponent(name); };
const ARCH = 'Arquitectura'; // Canvas view for plan.diagram, reached through the hash like any screen.
const archOpen = () => !editing && doc.plan?.diagram?.columns?.length && decodeURIComponent(location.hash.slice(1)) === ARCH;

const getNode = (path, root = screen()?.root) => (path ? path.split('.').reduce((n, i) => n?.children?.[+i], root) : root);
const parentPath = (path) => path.split('.').slice(0, -1).join('.');
const lastIndex = (path) => +path.split('.').pop();
function pathOf(target, node = screen().root, path = '') {
  if (node === target) return path;
  for (const [i, c] of (node.children || []).entries()) {
    const p = pathOf(target, c, path ? `${path}.${i}` : `${i}`);
    if (p != null) return p;
  }
  return null;
}
// Visit every node of every screen.
function walk(fn) { const visit = (n) => { if (!n) return; fn(n); (n.children || []).forEach(visit); }; doc.screens.forEach((s) => visit(s.root)); }
const usesOf = (name) => doc.screens.filter((s) => { let used = false; const visit = (n) => { if (n?.type === 'ref' && n.name === name) used = true; (n?.children || []).forEach(visit); }; visit(s.root); return used; });
// Replace a template's slot with `children` (used to unlink an instance).
const fillSlot = (node, children) => ({ ...node, ...(node.children && { children: node.children.flatMap((c) => (c.type === 'slot' ? structuredClone(children) : [fillSlot(c, children)])) }) });

let saveTimer;
function save() {
  $('json').value = JSON.stringify(doc, null, 2);
  if (!slug) return localStorage.setItem(STORE, JSON.stringify(doc));
  if (!admin) return;
  // Admin edits in the cloud save themselves a moment after the last change.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const res = await fetch(`/api/proposals/${slug}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ doc }) });
    status(res.ok ? 'Guardado en la nube.' : 'No se pudo guardar: revisa tu conexión.');
  }, 800);
}
// Every edit goes through commit() so ⌘Z can undo it.
function commit(mutate) {
  undoStack.push(JSON.stringify(doc));
  if (undoStack.length > 100) undoStack.shift();
  mutate();
  delete doc.example; // edited: no longer replaced by the latest bundled example
  save();
  draw();
}
function undo() {
  if (!undoStack.length) return;
  doc = JSON.parse(undoStack.pop());
  selected = null;
  save();
  draw();
}

function load(next) {
  if (!Array.isArray(next?.screens) || !next.screens.length) throw new Error('JSON inválido: falta "screens"');
  doc = next;
  selected = null;
  save();
  if (!hashName() && !archOpen()) history.replaceState(null, '', '#');
  selected = null;
  draw();
}

// ---------- kits: generic screens shared by all projects ----------
// User-saved kits live in localStorage and override the built-in kit with the same section.
const KIT_STORE = 'wireframly-kits';
const userKits = () => JSON.parse(localStorage.getItem(KIT_STORE) || '{}');
const kits = () => { const u = userKits(); return [...BUILTIN_KITS.filter((k) => !u[k.section]), ...Object.values(u)]; };
const isCustom = (section) => !!userKits()[section];

// Clone a kit for `project`: resolve $app and $home.
function instantiateKit(kit, project) {
  const pages = project.screens.filter((s) => !s.template && s.section !== kit.section);
  const home = pages[0]?.name || '';
  const app = project.app || 'Mi sistema';
  const sub = (v) => (typeof v === 'string' ? v.replaceAll('$app', app) : v);
  const fix = (n) => {
    const out = {};
    for (const [k, v] of Object.entries(n)) out[k] = Array.isArray(v) && k !== 'children' ? v.map(sub) : sub(v);
    for (const k of LINK_PROPS) if (out[k] === '$home') out[k] = home || undefined;
    if (n.children) out.children = n.children.map(fix);
    return out;
  };
  return structuredClone(kit.screens).map((s) => ({ ...s, section: kit.section, root: fix(s.root) }));
}
// Replace the project's screens of each kit's section with the kit (kit screens go first).
function applyKits(project, list = kits()) {
  for (const kit of list) {
    const kitScreens = instantiateKit(kit, project);
    const taken = new Set(kitScreens.map((s) => s.name));
    project.screens = [...kitScreens, ...project.screens.filter((s) => s.section !== kit.section && !taken.has(s.name))];
  }
  return project;
}
// Save the current section as a generic kit: links leaving the section become $home, the app name $app.
function saveSectionAsKit() {
  const section = screen().section;
  if (!section) return status('Asigna una sección a la pantalla primero.');
  const own = doc.screens.filter((s) => !s.template && s.section === section);
  const inKit = new Set(own.map((s) => s.name));
  const app = doc.app;
  const sub = (v) => (typeof v === 'string' && app ? v.replaceAll(app, '$app') : v);
  const unfix = (n) => {
    const out = {};
    for (const [k, v] of Object.entries(n)) out[k] = Array.isArray(v) && k !== 'children' ? v.map(sub) : sub(v);
    for (const k of LINK_PROPS) if (out[k] && !inKit.has(out[k])) out[k] = '$home';
    if (n.children) out.children = n.children.map(unfix);
    return out;
  };
  const withRefs = own.filter((s) => JSON.stringify(s.root).includes('"type":"ref"')).length;
  if (withRefs && !confirm(`${withRefs} pantalla(s) usan plantillas de este proyecto, que no existen en otros. Desvincúlalas primero para conservarlas. ¿Guardar igual?`)) return;
  const kit = { section, description: `guardado desde "${app || 'un proyecto'}"`, screens: own.map((s) => ({ ...s, root: unfix(s.root) })) };
  localStorage.setItem(KIT_STORE, JSON.stringify({ ...userKits(), [section]: kit }));
  status(`Kit "${section}" guardado: se usará en todos tus proyectos nuevos.`);
  drawKits();
}
function drawKits() {
  $('kits').replaceChildren(...kits().map((k) => h('div.kit', {},
    h('strong', {}, k.section, isCustom(k.section) ? ' (personalizado)' : ''),
    h('p.hint', {}, `${k.screens.length} pantallas · ${k.description || ''}`),
    h('div.actions', {},
      h('button', { type: 'button', onclick: () => addKit(k) }, 'Agregar / actualizar'),
      isCustom(k.section) ? h('button', { type: 'button', onclick: () => resetKit(k.section) }, BUILTIN_KITS.some((b) => b.section === k.section) ? 'Restaurar original' : 'Quitar kit') : null))));
}
function addKit(kit) {
  if (doc.screens.some((s) => s.section === kit.section) && !confirm(`Se reemplazarán las pantallas de "${kit.section}" de este proyecto. ¿Continuar? (⌘Z deshace)`)) return;
  commit(() => applyKits(doc, [kit]));
  go(kit.screens[0].name);
}
function resetKit(section) {
  const u = userKits();
  delete u[section];
  localStorage.setItem(KIT_STORE, JSON.stringify(u));
  drawKits();
}

// ---------- drawing ----------
// Apps for the switcher: every section with desktop pages, except the generic access kit.
const apps = () => {
  const home = new Map();
  for (const s of doc.screens) if (!s.template && s.device !== 'mobile' && s.section !== 'Acceso' && !home.has(sectionOf(s))) home.set(sectionOf(s), s.name);
  return [...home].map(([name, first]) => ({ name, home: first }));
};
const ctx = (s, edit = editing) => ({ names: names(), current: s.name, parent: s.parent, section: sectionOf(s), apps: apps(), templates: Object.fromEntries(templates().map((t) => [t.name, t.root])), edit, go });
const screenEl = (s, edit = editing, mobile = mobilePreview) => h(`div.screen${s.device === 'mobile' || mobile ? '.mobile' : ''}${s.template ? '.template' : ''}`, {}, render(s.root, ctx(s, edit)));
const tab = (label, name, active) => h(`a${active ? '.active' : ''}`, { href: `#${encodeURIComponent(name)}` }, label);

// ---------- delivery plan: stages, cost and the screens each stage delivers ----------
// A stage owns the screens it lists, plus its sections' screens not listed by another stage.
const planGroups = () => [...(doc.plan?.stages || []), ...(doc.plan?.addons || [])];
const inStage = (s, st) => !st || st.screens?.includes(s.name) ||
  (st.sections?.includes(sectionOf(s)) && !planGroups().some((o) => o !== st && o.screens?.includes(s.name)));
const span = (s) => (s.weeks ? `${s.weeks} ${s.weeks === 1 ? 'semana' : 'semanas'}` : '');
const money = (n) => (typeof n === 'number' ? `${doc.plan.currency || '$'} ${n.toLocaleString('en-US')}` : n);
// "Ver" opens the stage's first screen; every other page stays reachable.
function showStage(group) {
  const first = screens().find((s) => !s.template && inStage(s, group));
  $('canvas').scrollTop = 0;
  if (matchMedia('(max-width: 860px)').matches) { panelHidden = true; showPanel(); }
  if (first) go(first.name);
}
// "Try it" under the WhatsApp extra: only the number is the visitor's, the message is a fixed sample on the server.
function whatsappTry() {
  const input = h('input', { type: 'tel', inputmode: 'tel', autocomplete: 'tel', 'aria-label': 'Tu número de WhatsApp', placeholder: 'Tu WhatsApp: 6000-0000', required: '' });
  const button = h('button', { type: 'submit' }, 'Probar');
  const status = h('p.pp-meta', { role: 'status' }, 'Recibirás un mensaje de ejemplo de un pedido nuevo. Usa tu propio número. Hasta 5 pruebas por día.');
  return h('form.ref-form.wa-try', { onsubmit: async (e) => {
    e.preventDefault();
    button.disabled = true;
    status.textContent = 'Enviando…';
    try {
      const res = await fetch(`/api/proposals/${slug}/wa`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to: input.value }) });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'No se pudo enviar el mensaje de prueba');
      status.textContent = 'Listo: revisa tu WhatsApp.';
    } catch (err) {
      status.textContent = err.message;
    }
    button.disabled = false;
  } }, input, button, status);
}

const IDEA_SITES = [
  { name: 'Pinterest', url: 'https://www.pinterest.com/search/pins/?q=dashboard%20saas' },
  { name: 'Behance', url: 'https://www.behance.net/search/projects?search=dashboard%20saas' },
];
// "What design do you like?": anyone with access leaves links, images or notes, stored apart from the admin-only doc.
function referencesBlock(redraw) {
  const base = `/api/proposals/${slug}/refs`;
  const send = async (query, init) => {
    const res = await fetch(base + query, init);
    if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'No se pudo guardar');
  };
  // The panel redraws after each change: what was typed comes back unless it was saved.
  const sync = async (work, saved = () => {}) => {
    refsError = '';
    try { await work(); saved(); } catch (e) { refsError = e.message; }
    refs = await fetch(base).then((r) => (r.ok ? r.json() : refs));
    redraw();
  };
  const link = h('input', { type: 'text', inputmode: 'url', 'aria-label': 'Enlace', placeholder: 'https://…', oninput: (e) => { refsDraft.url = e.target.value; } });
  const note = h('textarea', { rows: 3, maxlength: 2000, 'aria-label': 'Nota', placeholder: 'Escribe una nota: qué te gusta, qué no, qué te gustaría ver…', oninput: (e) => { refsDraft.note = e.target.value; } });
  link.value = refsDraft.url;
  note.value = refsDraft.note;
  const add = (body, key) => sync(() => send('', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), () => { refsDraft[key] = ''; });
  const group = (title, ...body) => h('div.ref-group', {}, h('p.ref-title', {}, title), ...body);
  const remove = (r) => r.mine || admin ? h('button.pp-link', { type: 'button', onclick: () => sync(() => send(`?id=${r.id}`, { method: 'DELETE' })) }, 'Quitar') : null;
  const noteOf = (r) => r.note ? h('p.ref-note', {}, r.note) : null;
  const links = refs.filter((r) => r.url);
  const images = refs.filter((r) => r.image);
  const notes = refs.filter((r) => !r.url && !r.image);
  return h('div.refs', {},
    h('h4', {}, '¿Hay algún sitio, dashboard o diseño que te llame la atención?'),
    h('p.pp-meta', {}, 'Déjanos enlaces, imágenes o notas: lo que te guste es nuestro punto de partida. Diseñamos tu sistema según cómo trabaja tu empresa, no sobre una plantilla.'),
    h('p.ref-title', {}, '¿No sabes por dónde empezar? Busca ideas aquí:'),
    h('ul.design-links', {}, IDEA_SITES.map((x) => h('li.pp-row', {},
      h('a.pp-link', { href: x.url, target: '_blank', rel: 'noopener noreferrer' }, x.name), h('span.pp-meta', {}, 'Dashboards SaaS')))),
    group('Enlaces',
      h('form.ref-form', { onsubmit: (e) => { e.preventDefault(); if (link.value.trim()) add({ url: link.value }, 'url'); } },
        link, h('button', { type: 'submit' }, 'Agregar enlace')),
      links.length ? h('ul.ref-list', {}, links.map((r) => h('li', {},
        h('div.ref-body', {}, h('a.ref-link', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, new URL(r.url).hostname.replace(/^www\./, '')), noteOf(r)), remove(r)))) : null),
    group('Imágenes',
      h('label.ref-upload', {}, h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif', multiple: '',
        onchange: (e) => { const picked = [...e.target.files]; if (picked.length) sync(() => Promise.all(picked.map((f) => send(`?name=${encodeURIComponent(f.name)}`, { method: 'POST', headers: { 'content-type': f.type }, body: f })))); } }), 'Subir imágenes'),
      images.length ? h('ul.ref-images', {}, images.map((r) => h('li', {},
        h('a', { href: r.image, target: '_blank', rel: 'noopener noreferrer' }, h('img', { src: r.image, alt: r.note || r.name || 'Referencia', loading: 'lazy' })), noteOf(r), remove(r)))) : null),
    group('Notas',
      h('form.ref-form', { onsubmit: (e) => { e.preventDefault(); if (note.value.trim()) add({ note: note.value }, 'note'); } },
        note, h('button', { type: 'submit' }, 'Agregar nota')),
      notes.length ? h('ul.ref-list', {}, notes.map((r) => h('li', {}, h('div.ref-body', {}, noteOf(r)), remove(r)))) : null),
    refsError ? h('p.ref-error', { role: 'alert' }, refsError) : null);
}

// Sticky jump menu over the proposal: one button per section, the one in view marked.
let planNav = [];
let planNavPicked = null; // the clicked section stays marked even if it is too short to reach the top
function markPlanNav() {
  if (!planNav.length) return;
  const nav = planNav[0].button.parentElement;
  const scroller = $('side');
  const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
  const line = nav.getBoundingClientRect().bottom + 24;
  const current = planNav.find((x) => x.section === planNavPicked) || (atEnd ? planNav.at(-1) : planNav.findLast((x) => x.section.getBoundingClientRect().top <= line));
  for (const item of planNav) {
    const on = item === current;
    if (on && item.button.getAttribute('aria-current') !== 'true') nav.scrollLeft = item.button.offsetLeft - 20;
    if (on) item.button.setAttribute('aria-current', 'true'); else item.button.removeAttribute('aria-current');
  }
}
function drawPlanNav() {
  const sections = [...$('plan').querySelectorAll(':scope > .pp-section')];
  if (!sections.length) { planNav = []; return; }
  const jump = (section, nav) => {
    planNavPicked = section;
    section.style.scrollMarginTop = `${nav.offsetHeight + 16}px`;
    section.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const nav = h('nav.pp-nav', { 'aria-label': 'Secciones de la propuesta' });
  planNav = sections.map((section) => ({ section, button: h('button', { type: 'button', onclick: () => jump(section, nav) }, section.querySelector('h3').textContent) }));
  nav.append(...planNav.map((x) => x.button));
  sections[0].before(nav);
  markPlanNav();
}
$('side').addEventListener('scroll', markPlanNav, { passive: true });
for (const type of ['wheel', 'touchmove']) $('side').addEventListener(type, () => { planNavPicked = null; }, { passive: true });

function drawPlan(cur) {
  const p = doc.plan;
  $('plan').hidden = editing || !p;
  if (!p || editing) return;
  const st = p.stages || [];
  const cost = (s) => s.cost ?? (s.hours || 0) * (p.rate || 0);
  const priced = st.filter((s) => typeof cost(s) === 'number');
  const total = priced.reduce((a, s) => a + cost(s), 0);
  const weeks = priced.reduce((a, s) => a + (s.weeks || 0), 0);
  const scope = priced.length === st.length ? 'Sistema completo' : priced.map((s) => `Etapa ${st.indexOf(s) + 1}`).join(' y ');
  // Server options: the client picks one; it adds to the monthly total.
  const hosting = p.hosting || [];
  const pick = hosting[hostingChoice ?? hosting.findIndex((o) => o.recommended)] || hosting[0];
  const num = (v) => (typeof v === 'number' ? v : 0);
  const monthlyRows = [...(pick ? [{ item: pick.name, detail: pick.storage, monthly: pick.monthly }] : []), ...(p.recurring || [])];
  const monthly = monthlyRows.reduce((a, r) => a + num(r.monthly), 0);
  // The whole project is paid in monthly installments of p.installment (the last one is the remainder).
  const quotas = (amount) => {
    const n = p.installment ? Math.ceil(amount / p.installment) : 0;
    return { n, last: amount - p.installment * (n - 1) };
  };
  const payText = (amount) => {
    const { n, last } = quotas(amount);
    return n === 1 ? `1 cuota de ${money(last)}` : last === p.installment ? `${n} cuotas de ${money(p.installment)}` : `${n - 1} ${n === 2 ? 'cuota' : 'cuotas'} de ${money(p.installment)} + 1 de ${money(last)}`;
  };
  const due = total + (p.addons || []).filter((a) => addonsChosen.has(a.name)).reduce((x, a) => x + cost(a), 0);
  const section = (title, ...body) => h('section.pp-section', {}, h('h3', {}, title), ...body);

  $('plan').replaceChildren(...[
    h('header.pp-head', {},
      h('h2', {}, doc.app ? `Propuesta para ${doc.app}` : 'Tu propuesta'),
      st[0] && h('p.pp-lede', {}, ...(p.installment
        ? ['Ofrecemos un plan de ', h('b', {}, `${money(p.installment)} al mes`), ', una vez vistos los primeros avances.']
        : ['Empieza con ', h('b', {}, st[0].name), ` por ${money(cost(st[0]))}, en uso en ${st[0].weeks} semanas.`])),
      h('button.btn', { type: 'button', onclick: printQuote },
        downloadIcon(), 'Descargar cotización en PDF')),

    section('Etapas',
      h('ol.pp-stages', {}, st.map((s, i) => {
        const count = screens().filter((x) => !x.template && inStage(x, s)).length;
        const on = inStage(cur, s);
        return h(`li.pp-stage${on ? '.active' : ''}`, {},
          h('span.pp-dot', { 'aria-hidden': 'true' }, i + 1),
          h('div.pp-body', {},
            h('div.pp-row', {}, h('strong', {}, s.name), h('span.pp-num', {}, money(cost(s)))),
            h('p', {}, s.summary || ''),
            s.includes?.length ? h('ul.pp-includes', {}, s.includes.map((x) => h('li', {}, x))) : null,
            h('div.pp-row', {}, h('span.pp-meta', {}, [span(s), `${count} pantallas`].filter(Boolean).join(' · ')),
              h('button.pp-link', { type: 'button', 'aria-current': on ? 'step' : null, onclick: () => showStage(s) }, on ? 'Viendo' : 'Ver pantallas'))));
      }))),

    p.addons?.length ? section('Adicionales',
      h('p', {}, 'Mejoras opcionales. Marca las que te interesen y se suman a las cuotas.'),
      h('div.pp-options', {}, p.addons.map((a) => {
        const count = screens().filter((x) => !x.template && inStage(x, a)).length;
        const on = addonsChosen.has(a.name);
        return h(`div.pp-option.pp-addon${on ? '.active' : ''}`, {},
          h('input', { type: 'checkbox', id: `addon-${a.name}`, checked: on ? '' : null, onchange: () => { on ? addonsChosen.delete(a.name) : addonsChosen.add(a.name); drawPlan(cur); } }),
          h('span.pp-body', {},
            h('label.pp-row', { for: `addon-${a.name}` }, h('strong', {}, a.name), h('span.pp-num', {}, money(cost(a)))),
            h('span.pp-meta', {}, a.summary),
            count ? h('button.pp-link', { type: 'button', onclick: () => showStage(a) }, inStage(cur, a) ? 'Viendo' : 'Ver pantalla') : null));
      }))) : null,


    p.design ? section('Diseño', h('p', {}, p.design.note),
      p.design.links?.length ? h('ul.design-links', {}, p.design.links.map((l) => h('li.pp-row', {},
        h('a.pp-link', { href: l.url, target: '_blank', rel: 'noopener' }, l.name), h('span.pp-meta', {}, l.kind)))) : null,
      p.design.url ? h('a.pp-link', { href: p.design.url, target: '_blank', rel: 'noopener' }, 'Ver más proyectos') : null,
      slug ? referencesBlock(() => drawPlan(cur)) : null) : null,

    p.extras?.length ? section('Adicionales gratis', h('ul.extras', {}, p.extras.map((x) => {
      const item = extraItem(x);
      if (x.demo === 'whatsapp' && slug) item.append(whatsappTry());
      return item;
    }))) : null,

    p.diagram?.columns?.length ? section(ARCH, h('p', {}, 'Cómo se conectan las partes del sistema.'),
      h('button.pp-link', { type: 'button', onclick: () => { $('canvas').scrollTop = 0; if (matchMedia('(max-width: 860px)').matches) { panelHidden = true; showPanel(); } go(ARCH); } }, 'Ver diagrama')) : null,

    p.distribution?.length ? section('App en el celular', h('div.pp-options', {}, p.distribution.map((o) => h(`div.pp-option.pp-static${o.recommended ? '.active' : ''}`, {},
      h('span.pp-body', {},
        h('span.pp-row', {}, h('strong', {}, o.name, o.recommended ? h('span.pp-tag', {}, 'Recomendado') : null), h('span.pp-num', {}, o.cost)),
        h('span.pp-meta', {}, o.detail)))))) : null,

    p.architecture?.length ? section('Cómo está hecho', h('ul.pp-includes', {}, p.architecture.map((x) => h('li', {}, x)))) : null,

    hosting.length ? section('Servidor',
      p.hostingNote ? h('p', {}, p.hostingNote) : null,
      h('div.pp-options', { role: 'radiogroup', 'aria-label': 'Servidor' }, hosting.map((o, i) => h(`label.pp-option${o === pick ? '.active' : ''}`, {},
        h('input', { type: 'radio', name: 'hosting', checked: o === pick ? '' : null, onchange: () => { hostingChoice = i; drawPlan(cur); } }),
        h('span.pp-body', {},
          h('span.pp-row', {}, h('strong', {}, o.name, o.recommended ? h('span.pp-tag', {}, 'Recomendado') : null), h('span.pp-num', {}, `${money(o.monthly)}/mes`)),
          h('span.pp-meta', {}, o.detail)))))) : null,

    section('Cada mes',
      h('dl.pp-ledger', {}, monthlyRows.flatMap((r) => [h('dt', {}, r.item, h('small', {}, r.detail || '')), h('dd.pp-num', {}, money(r.monthly))]),
        h('dt.pp-total', {}, 'Total mensual'), h('dd.pp-num.pp-total', {}, money(monthly)))),

    p.deliverables?.length ? section('Qué recibes', h('ul.pp-includes', {}, p.deliverables.map((x) => h('li', {}, x)))) : null,

    files.length ? section('Documentos', h('ul.pp-includes', {}, files.map((f) => h('li', {}, h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.name))))) : null,

    p.installment ? (() => {
      const { n, last } = quotas(due);
      return section('Forma de pago',
        h('div.pp-pay', {},
          h('div.pp-row', {}, h('strong', {}, 'Cada mes'), h('span.pp-meta', {}, payText(due))),
          h('div.pp-quotas', { role: 'img', 'aria-label': `${n} cuotas` },
            Array.from({ length: n }, (_, k) => { const q = h('span'); q.style.flex = k === n - 1 ? last / p.installment : 1; return q; }))),
        h('p', {}, `${scope}: ${money(due)}, con ${weeks} semanas de trabajo. La primera cuota una vez vistos los primeros avances y una cada mes hasta completar el pago.`));
    })() : null,
    p.more?.items?.length ? section(p.more.title, p.more.note ? h('p', {}, p.more.note) : null,
      h('div.pp-options', {}, p.more.items.map((x) => h('div.pp-option.pp-static', {},
        h('span.pp-body', {},
          h('strong', {}, x.name),
          h('span.pp-meta', {}, x.text),
          h('a.pp-link', { href: x.url, target: '_blank', rel: 'noopener' }, x.label)))))) : null,
    p.terms ? h('p.pp-terms', {}, p.terms) : null,
  ].filter(Boolean));
  drawPlanNav();
  drawQuote({ p, st, cost, total, weeks, scope, pick, hosting, monthlyRows, monthly, payText });
}

const downloadIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [k, v] of Object.entries({ width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(k, v);
  svg.innerHTML = '<path d="M9 2.5v9M5.5 8 9 11.5 12.5 8M3 15.5h12"/>';
  return svg;
};
// ponytail: browser print dialog ("Guardar como PDF"), no PDF library. Add one if clients need a one-tap file on phones.
function printQuote() {
  document.body.classList.add('quote-print');
  window.print();
}
// The downloadable quote: what each stage and add-on includes, with the client's current choices.
function drawQuote({ p, st, cost, total, weeks, scope, pick, hosting, monthlyRows, monthly, payText }) {
  const pages = (group) => screens().filter((x) => !x.template && inStage(x, group)).map((x) => x.name);
  const today = new Date().toLocaleDateString('en-GB') /* dd/mm/aaaa */;
  const addons = p.addons || [];
  const chosen = addons.filter((a) => addonsChosen.has(a.name));
  const extra = chosen.reduce((a, x) => a + cost(x), 0);
  const list = (items) => h('ul', {}, items.map((x) => h('li', {}, x)));
  const block = (title, ...body) => [h('h2', {}, title), ...body.flat()];
  $('quote').replaceChildren(...[
    h('header.q-head', {}, h('img', { src: '/logo.svg', alt: 'Istmo Code' }),
      h('div', {}, h('strong', {}, 'Cotización'), h('br'), today)),
    h('h1', {}, doc.app || 'Tu sistema'),
    clientName ? h('p.q-lede', {}, `Preparada para ${clientName}.`) : h('p.q-lede', {}, `${scope} en ${weeks} semanas.`),
    ...block('Resumen', h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, 'Etapa'), h('th.q-n', {}, 'Tiempo'), h('th.q-n', {}, 'Precio'))),
      h('tbody', {}, st.map((s, i) => h('tr', {}, h('td', {}, `${i + 1}. ${s.name}`), h('td.q-n', {}, span(s)), h('td.q-n', {}, money(cost(s))))),
        chosen.length ? h('tr', {}, h('td', {}, 'Adicionales elegidos'), h('td.q-n', {}, ''), h('td.q-n', {}, money(extra))) : null),
      h('tfoot', {}, h('tr', {}, h('td', {}, scope === 'Sistema completo' ? 'Total' : `Total ${scope.toLowerCase()}`), h('td.q-n', {}, `${weeks} semanas`), h('td.q-n', {}, money(total + extra)))))),
    ...block('Qué incluye cada etapa', st.map((s, i) => h('section.q-stage', {},
      h('h3', {}, h('span', {}, `Etapa ${i + 1}: ${s.name}`), h('span', {}, money(cost(s)))),
      s.summary ? h('p', {}, s.summary) : null,
      s.includes?.length ? list(s.includes) : null,
      pages(s).length ? h('p.q-screens', {}, `Pantallas: ${pages(s).join(' · ')}.`) : null))),
    ...(p.design ? block('Diseño', h('p', {}, p.design.note, p.design.url ? [' ', h('a', { href: p.design.url }, p.design.url.replace(/^https?:\/\//, ''))] : null),
      p.design.links?.length ? list(p.design.links.map((l) => [`${l.name} (${l.kind}): `, h('a', { href: l.url }, l.url.replace(/^https?:\/\//, ''))])) : null) : []),
    ...(p.extras?.length ? block('Adicionales gratis', h('ul.extras', {}, p.extras.map(extraItem))) : []),
    ...(addons.length ? block('Adicionales opcionales', h('table', {}, h('tbody', {}, addons.map((a) => h('tr', {},
      h('td', {}, a.name, addonsChosen.has(a.name) ? h('span.q-chip', {}, 'Elegido') : null, h('small', {}, a.summary)),
      h('td.q-n', {}, money(cost(a)))))))) : []),
    ...block('Cada mes', h('table', {}, h('tbody', {}, monthlyRows.map((r) => h('tr', {},
      h('td', {}, r.item, r.detail ? h('small', {}, r.detail) : null), h('td.q-n', {}, typeof r.monthly === 'number' ? money(r.monthly) : r.monthly)))),
      h('tfoot', {}, h('tr', {}, h('td', {}, 'Total mensual'), h('td.q-n', {}, money(monthly))))),
    hosting.length > 1 ? h('small', {}, `Otras opciones de servidor: ${hosting.filter((o) => o !== pick).map((o) => `${o.name} (${money(o.monthly)}/mes)`).join(', ')}.`) : null),
    p.hostingNote ? h('small', {}, p.hostingNote) : null,
    ...(p.diagram?.columns?.length ? block('Arquitectura', archDiagram(p.diagram)) : []),
    ...(p.distribution?.length ? block('App en el celular', h('table', {}, h('tbody', {}, p.distribution.map((o) => h('tr', {},
      h('td', {}, o.name, o.recommended ? h('span.q-chip', {}, 'Recomendado') : null, h('small', {}, o.detail)),
      h('td.q-n', {}, o.cost)))))) : []),
    h('div.q-cols', {},
      p.architecture?.length ? h('div', {}, ...block('Cómo está hecho', list(p.architecture))) : null,
      p.deliverables?.length ? h('div', {}, ...block('Qué recibes', list(p.deliverables))) : null),
    ...(p.installment ? block('Forma de pago', h('table', {}, h('tbody', {},
      h('tr', {}, h('td', {}, 'Cuotas mensuales'), h('td.q-n', {}, payText(total + extra))))),
    h('small', {}, 'La primera cuota una vez vistos los primeros avances y una cada mes hasta completar el pago.')) : []),
    ...(p.more?.items?.length ? block(p.more.title, p.more.note ? h('p', {}, p.more.note) : null,
      list(p.more.items.map((x) => [h('b', {}, x.name), `: ${x.text} `, h('a', { href: x.url }, x.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))]))).filter(Boolean) : []),
    h('p.q-foot', {}, p.terms ? `${p.terms} ` : '', 'Istmo Code · www.istmocode.com'),
  ].filter(Boolean));
}

// Show the whole desktop wireframe instead of cropping it; the editor keeps 100% so drag coordinates stay true.
function fitScreen() {
  const canvas = $('canvas');
  const el = canvas.querySelector('.screen:not(.mobile)');
  if (el) el.style.zoom = editing ? 1 : Math.min(1, (canvas.clientWidth - 48) / 1280);
}
addEventListener('resize', fitScreen);

function draw() {
  if (!screens().length) return;
  const cur = screen();
  if (!cur) return go(pageNames()[0]);
  drawPlan(cur);
  const sec = sectionOf(cur);
  const secs = sections();
  const arch = archOpen();
  $('sections').replaceChildren(...(secs.length > 1 ? secs : []).map((name) => tab(name, screens().find((s) => sectionOf(s) === name).name, !arch && name === sec)),
    ...(!editing && doc.plan?.diagram?.columns?.length ? [tab(ARCH, ARCH, arch)] : []));
  $('screens').hidden = arch;
  $('device').hidden = arch;
  $('screens').replaceChildren(
    ...screens().filter((s) => sectionOf(s) === sec).map((s) => tab(`${s.name}${s.device === 'mobile' ? ' ▯' : ''}`, s.name, s === cur)),
    ...(editing ? [h('button.ghost', { type: 'button', onclick: addScreen }, cur.template ? '+ Plantilla' : '+ Pantalla')] : []));
  $('canvas').replaceChildren(arch ? h('div.arch-page', {}, h('h2', {}, 'Arquitectura del sistema'), doc.plan.diagram.summary ? h('p', {}, doc.plan.diagram.summary) : null, archDiagram(doc.plan.diagram)) : screenEl(cur));
  fitScreen();
  document.body.classList.toggle('editing', editing);
  $('mode').textContent = editing ? 'Probar prototipo' : 'Editar';
  $('device').textContent = mobilePreview ? 'Ver escritorio' : 'Ver móvil';
  $('palette').hidden = !editing;
  $('inspector').hidden = !editing;
  if (!editing) return;
  drawTemplatePalette();
  if (selected != null && !getNode(selected)) selected = null;
  if (selected != null) $('canvas').querySelector(`[data-path="${selected}"]`)?.classList.add('selected');
  drawInspector();
}

// Print every screen, one per page, labelled with its section.
function drawAll() {
  $('canvas').replaceChildren(...doc.screens.filter((s) => !s.template).map((s) => h('section.print-page', {}, h('div.print-title', {}, `${sectionOf(s)} · ${s.name}`), screenEl(s, false, false))));
}

// ---------- palette ----------
const palItem = (label, data, title) => h('div.pal-item', { draggable: 'true', title, ondragstart: (e) => { e.dataTransfer.setData('text/plain', data); e.dataTransfer.effectAllowed = 'copy'; } }, label);
const group = (title, items, open = false) => { const d = h('details.pal-section', {}, h('summary', {}, title), h('div.pal-items', {}, items)); d.open = open; return d; };

function drawPalette() {
  $('palette').append(h('div', { id: 'pal-templates' }));
  for (const [name, types] of Object.entries(DEFAULTS)) $('palette').append(group(name, Object.keys(types).map((type) => palItem(type, `new:${type}`)), true));
  const byGroup = Object.groupBy(BLOCKS.map((b, i) => ({ ...b, i })), (b) => b.group);
  $('palette').append(h('div.pal-group', {}, 'Bloques (estilo shadcn/ui)'),
    ...Object.entries(byGroup).map(([name, blocks]) => group(name, blocks.map((b) => palItem(b.name, `block:${b.i}`, 'Inserta una copia editable')))));
}
// Project templates: dropping one inserts a linked instance (`ref`).
function drawTemplatePalette() {
  const list = templates().map((t) => palItem(`⧉ ${t.name}`, `ref:${t.name}`, 'Instancia vinculada: cambia cuando editas la plantilla'));
  $('pal-templates').replaceChildren(group(`Plantillas del proyecto (${list.length})`, list.length ? list : [h('p.hint', {}, 'Selecciona un componente y pulsa "Crear plantilla".')], true));
}

// ---------- drag & drop ----------
// Where would a drop at (x, y) over element `el` land? → { parent, index, ...indicator info } or null.
function dropTarget(el, x, y) {
  const nodeEl = el.closest?.('.node');
  if (!nodeEl) return null;
  const path = nodeEl.dataset.path;
  const node = getNode(path);
  const r = nodeEl.getBoundingClientRect();
  const nearEdge = Math.min(x - r.left, r.right - x, y - r.top, r.bottom - y) < 10;
  if (CONTAINERS.has(node.type) && !(nearEdge && path)) {
    // Inside a container: index = children "before" the pointer along the container's axis.
    const kids = [...nodeEl.querySelectorAll('.node')].filter((k) => parentPath(k.dataset.path) === path && k.dataset.path !== path);
    let index = 0;
    for (const k of kids) {
      const kr = k.getBoundingClientRect();
      const before = node.type === 'grid' ? kr.bottom < y || (kr.top <= y && kr.left + kr.width / 2 < x)
        : node.type === 'row' ? kr.left + kr.width / 2 < x : kr.top + kr.height / 2 < y;
      if (before) index = lastIndex(k.dataset.path) + 1;
    }
    return { parent: path, index, el: nodeEl, kids, horizontal: node.type === 'row' };
  }
  if (!path) return null;
  // On a leaf (or a container's edge): before/after it inside its parent.
  const parent = parentPath(path);
  const horizontal = getNode(parent).type === 'row';
  const after = horizontal ? x > r.left + r.width / 2 : y > r.top + r.height / 2;
  return { parent, index: lastIndex(path) + (after ? 1 : 0), sibling: nodeEl, after, horizontal };
}

function showLine(t) {
  const line = $('drop-line');
  line.hidden = !t;
  if (!t) return;
  let anchor = t.sibling, end = t.after;
  if (!anchor) { anchor = t.kids[t.index] || t.kids.at(-1); end = !t.kids[t.index]; }
  if (!anchor) { // empty container
    const r = t.el.getBoundingClientRect();
    return Object.assign(line.style, { left: `${r.left + 4}px`, top: `${r.top + 4}px`, width: `${r.width - 8}px`, height: `${Math.max(r.height - 8, 8)}px` }, line.classList.add('box'));
  }
  line.classList.remove('box');
  const r = anchor.getBoundingClientRect();
  Object.assign(line.style, t.horizontal
    ? { left: `${(end ? r.right : r.left) - 2}px`, top: `${r.top}px`, width: '4px', height: `${r.height}px` }
    : { left: `${r.left}px`, top: `${(end ? r.bottom : r.top) - 2}px`, width: `${r.width}px`, height: '4px' });
}

function drop(data, t) {
  const parentNode = getNode(t.parent);
  const kind = data.slice(0, data.indexOf(':'));
  const arg = data.slice(kind.length + 1);
  if (kind !== 'move') {
    const node = kind === 'new' ? fresh(arg) : kind === 'block' ? structuredClone(BLOCKS[+arg].node) : { type: 'ref', name: arg, children: [] };
    return commit(() => { (parentNode.children ??= []).splice(t.index, 0, node); selected = pathOf(node); });
  }
  const from = data.slice(5);
  if (t.parent === from || t.parent.startsWith(`${from}.`)) return; // can't drop into itself
  commit(() => {
    const node = getNode(from);
    const oldParent = getNode(parentPath(from));
    const oldIndex = lastIndex(from);
    oldParent.children.splice(oldIndex, 1);
    const index = oldParent === parentNode && oldIndex < t.index ? t.index - 1 : t.index;
    (parentNode.children ??= []).splice(index, 0, node);
    selected = pathOf(node);
  });
}

const canvas = $('canvas');
canvas.addEventListener('dragstart', (e) => {
  const el = e.target.closest?.('.node');
  if (!editing || !el) return;
  e.dataTransfer.setData('text/plain', `move:${el.dataset.path}`);
  e.dataTransfer.effectAllowed = 'move';
});
canvas.addEventListener('dragover', (e) => {
  if (!editing) return;
  const t = dropTarget(e.target, e.clientX, e.clientY);
  if (t) e.preventDefault();
  showLine(t);
});
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  showLine(null);
  const t = dropTarget(e.target, e.clientX, e.clientY);
  const data = e.dataTransfer.getData('text/plain');
  if (t && /^(new|move|block|ref):/.test(data)) drop(data, t);
});
addEventListener('dragend', () => showLine(null));

// In edit mode a click selects the component instead of using it (no navigation, no file dialogs).
canvas.addEventListener('click', (e) => {
  if (!editing) return;
  e.preventDefault();
  e.stopPropagation();
  selected = e.target.closest('.node')?.dataset.path ?? null;
  draw();
}, true);

// ---------- inspector ----------
const option = (value, label, on) => { const o = h('option', { value }, label); o.selected = on; return o; };
const labeled = (label, control) => h('label.field', {}, h('span.label', {}, label), control);

function propInput(node, key) {
  const value = node[key] ?? DEF[node.type]?.[key];
  const set = (v) => commit(() => { if (v === '' || v == null) delete node[key]; else node[key] = v; });
  let control;
  if (LINK_PROPS.includes(key)) {
    control = h('select', { onchange: (e) => set(e.target.value) }, option('', '— sin enlace —', !value), pageNames().map((n) => option(n, n, n === value)));
  } else if (node.type === 'ref' && key === 'name') {
    control = h('select', { onchange: (e) => set(e.target.value) }, templates().map((t) => option(t.name, t.name, t.name === value)));
  } else if (ENUMS[key]) {
    control = h('select', { onchange: (e) => set(typeof ENUMS[key][0] === 'number' ? +e.target.value : e.target.value) }, ENUMS[key].map((v) => option(v, v, String(v) === String(value))));
  } else if (key === 'data' || key === 'cards') {
    control = h('textarea', { rows: 5, placeholder: key === 'cards' ? 'una columna por línea, tarjetas separadas por |' : 'una fila por línea, celdas separadas por |', onchange: (e) => set(e.target.value.trim() ? e.target.value.trim().split('\n').map((l) => l.split('|').map((c) => c.trim())) : []) });
    control.value = (value || []).map((r) => r.join(' | ')).join('\n');
  } else if (Array.isArray(value)) {
    control = h('textarea', { rows: Math.min(Math.max(value.length, 2), 10), placeholder: 'uno por línea', onchange: (e) => set(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)) });
    control.value = value.join('\n');
  } else if (typeof value === 'boolean') {
    control = h('input', { type: 'checkbox', onchange: (e) => set(e.target.checked || '') });
    control.checked = !!value;
    return h('label.check', {}, control, key);
  } else if (typeof value === 'number') {
    control = h('input', { type: 'number', onchange: (e) => set(e.target.value === '' ? '' : +e.target.value) });
    control.value = value;
  } else {
    control = h('input', { onchange: (e) => set(e.target.value) });
    control.value = value ?? '';
  }
  return labeled(key, control);
}

// Swap the node at `path` (root included) for `next`, and select it.
function replaceAt(path, next) {
  if (path) getNode(parentPath(path)).children[lastIndex(path)] = next;
  else screen().root = next;
  selected = pathOf(next);
}

function nodeActions(path) {
  const node = getNode(path);
  const btn = (label, onclick, extra = {}) => h(`button${extra.cls || ''}`, { type: 'button', onclick, disabled: extra.disabled ? '' : null }, label);
  const templateActions = node.type === 'ref'
    ? [btn('Editar plantilla', () => go(node.name)),
      btn('Desvincular', () => commit(() => { const tpl = templates().find((x) => x.name === node.name); if (tpl) replaceAt(path, fillSlot(structuredClone(tpl.root), node.children || [])); }))]
    : [btn('Crear plantilla', () => makeTemplate(path))];
  if (!path) return h('div.actions', {}, ...templateActions);
  const parent = getNode(parentPath(path));
  const i = lastIndex(path);
  const move = (d) => commit(() => { parent.children.splice(i, 1); parent.children.splice(i + d, 0, node); selected = pathOf(node); });
  return h('div.actions', {},
    btn('↑ Subir', () => move(-1), { disabled: i === 0 }),
    btn('↓ Bajar', () => move(1), { disabled: i === parent.children.length - 1 }),
    btn('Duplicar', () => commit(() => { const copy = structuredClone(node); parent.children.splice(i + 1, 0, copy); selected = pathOf(copy); })),
    btn('Envolver en fila', () => commit(() => replaceAt(path, { type: 'row', gap: 16, children: [node] }))),
    btn('Seleccionar padre', () => { selected = parentPath(path); draw(); }),
    ...templateActions,
    btn('Eliminar', removeSelected, { cls: '.danger' }));
}

function drawInspector() {
  const box = $('inspector');
  const s = screen();
  if (selected == null) {
    const name = h('input', { onchange: (e) => renameScreen(e.target.value) });
    name.value = s.name;
    const section = h('input', { list: 'section-list', onchange: (e) => commit(() => { s.section = e.target.value.trim() || undefined; }) });
    section.value = s.section || '';
    const device = h('select', { onchange: (e) => commit(() => { s.device = e.target.value === 'mobile' ? 'mobile' : undefined; }) },
      ['desktop', 'mobile'].map((d) => option(d, d, (s.device || 'desktop') === d)));
    const parent = h('select', { onchange: (e) => commit(() => { s.parent = e.target.value || undefined; }) },
      option('', '— ninguno —', !s.parent), pageNames().filter((n) => n !== s.name).map((n) => option(n, n, n === s.parent)));
    const uses = s.template ? usesOf(s.name) : [];
    box.replaceChildren(h('h2', {}, s.template ? 'Plantilla' : 'Pantalla'),
      labeled('nombre', name),
      ...(s.template
        ? [h('p.hint', {}, `Usada en ${uses.length} pantalla(s). Los cambios se aplican en todas. Un "slot" marca dónde va el contenido de cada pantalla.`)]
        : [labeled('sección / rol', section), h('datalist', { id: 'section-list' }, sections().filter((x) => x !== TEMPLATES).map((x) => h('option', { value: x }))),
          labeled('resaltar en menú (pantalla padre)', parent)]),
      labeled('dispositivo', device),
      h('div.actions', {},
        h('button', { type: 'button', onclick: duplicateScreen }, 'Duplicar pantalla'),
        h('button.danger', { type: 'button', disabled: screens().length < 2 ? '' : null, onclick: deleteScreen }, 'Eliminar pantalla')),
      s.template ? null : h('button.wide', { type: 'button', onclick: saveSectionAsKit }, `Guardar sección "${sectionOf(s)}" como kit genérico`),
      h('p.hint', {}, 'Clic en un componente para editarlo. Arrastra desde la paleta para añadir. Renombrar actualiza los enlaces.'));
    return;
  }
  const node = getNode(selected);
  const keys = [...new Set([...Object.keys(DEF[node.type] || {}), ...Object.keys(node)])].filter((k) => k !== 'type' && k !== 'children');
  box.replaceChildren(
    h('h2', {}, node.type),
    h('p.hint', {}, selected ? `ruta ${selected}` : 'raíz de la pantalla'),
    ...keys.map((k) => propInput(node, k)),
    nodeActions(selected),
    h('button.ghost', { type: 'button', onclick: () => { selected = null; draw(); } }, '← Propiedades de la pantalla'));
}

// Turn the node at `path` into a template and replace it with a linked instance.
function makeTemplate(path) {
  const node = getNode(path);
  const name = prompt('Nombre de la plantilla', uniqueName(`Plantilla ${node.type}`))?.trim();
  if (!name) return;
  if (findName(name) || doc.screens.some((s) => s.name === name)) return status(`Ya existe "${name}".`);
  commit(() => {
    doc.screens.push({ name, template: true, root: structuredClone(node) });
    replaceAt(path, { type: 'ref', name, children: [] });
  });
  status(`Plantilla "${name}" creada. Edítala en la sección ${TEMPLATES}.`);
}

function removeSelected() {
  if (!selected) return;
  const path = selected;
  commit(() => { getNode(parentPath(path)).children.splice(lastIndex(path), 1); selected = null; });
}

// ---------- screens ----------
function uniqueName(base) { let n = base, i = 2; while (findName(n)) n = `${base} ${i++}`; return n; }
function insertScreen(s) {
  const cur = screen();
  commit(() => { doc.screens.splice(doc.screens.indexOf(cur) + 1, 0, s); selected = null; });
  go(s.name);
}
const addScreen = () => insertScreen(screen()?.template
  ? { name: uniqueName('Nueva plantilla'), template: true, root: { type: 'col', gap: 16, children: [fresh('slot')] } }
  : { name: uniqueName('Nueva pantalla'), section: screen()?.section, root: { type: 'col', gap: 16, children: [fresh('heading')] } });
const duplicateScreen = () => insertScreen({ ...structuredClone(screen()), name: uniqueName(`${screen().name} copia`) });
function deleteScreen() {
  const cur = screen();
  const uses = cur.template ? usesOf(cur.name).length : 0;
  if (!confirm(uses ? `"${cur.name}" se usa en ${uses} pantalla(s), que mostrarán un aviso. ¿Eliminar igual? (⌘Z deshace)` : `¿Eliminar "${cur.name}"?`)) return;
  commit(() => doc.screens.splice(doc.screens.indexOf(cur), 1));
  go(pageNames()[0]);
}
// Renaming also updates links and menu items that point to the old name.
function renameScreen(value) {
  const cur = screen();
  const next = value.trim();
  if (!next || next === cur.name) return;
  if (findName(next)) { $('status').textContent = `Ya existe una pantalla "${next}".`; return draw(); }
  const old = cur.name;
  history.replaceState(null, '', `#${encodeURIComponent(next)}`);
  commit(() => {
    cur.name = next;
    doc.screens.forEach((x) => { if (x.parent === old) x.parent = next; });
    walk((n) => {
      for (const k of LINK_PROPS) if (n[k] === old) n[k] = next;
      if (n.type === 'ref' && n.name === old) n.name = next;
      for (const k of ['items', 'create']) if (Array.isArray(n[k])) n[k] = n[k].map((x) => (x === old ? next : x));
    });
  });
}

// ---------- wiring ----------
const status = (msg) => { $('status').textContent = msg; };
const tryLoad = (fn, msg) => { try { fn(); status(msg); } catch (e) { status(`Error: ${e.message}`); } };
const keepUndo = () => doc && undoStack.push(JSON.stringify(doc));

$('go').onclick = async () => {
  $('go').disabled = true;
  status('Generando… (puede tardar 1–3 min con requerimientos largos)');
  try {
    const res = await fetch('/api/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: $('prompt').value }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    keepUndo();
    load(applyKits(data));
    status(`${doc.screens.length} pantallas en ${sections().length} secciones (incluye kits genéricos).`);
  } catch (e) {
    status(`Error: ${e.message}`);
  } finally {
    $('go').disabled = false;
  }
};
$('apply').onclick = () => tryLoad(() => { keepUndo(); load(JSON.parse($('json').value)); }, 'JSON aplicado.');
async function loadExample(goHome) {
  const ex = (await import('./vigil.js')).default;
  keepUndo();
  tryLoad(() => load(applyKits({ ...structuredClone(ex), example: true })), 'Ejemplo cargado con kits genéricos.');
  if (goHome) go(pageNames()[0]);
}
$('example').onclick = () => loadExample(true);
$('new').onclick = () => {
  if (doc && !confirm('¿Reemplazar el proyecto actual? (⌘Z para deshacer)')) return;
  keepUndo();
  editing = true;
  const app = prompt('Nombre del sistema', 'Mi sistema')?.trim() || 'Mi sistema';
  load(applyKits({ app, screens: [{ name: 'Inicio', section: 'App', root: { type: 'col', gap: 16, children: [fresh('heading')] } }] }));
  go('Inicio');
};
$('export').onclick = () => {
  const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })), download: 'wireframe.json' });
  a.click();
  URL.revokeObjectURL(a.href);
};
$('import').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const text = await f.text();
  tryLoad(() => { keepUndo(); load(JSON.parse(text)); }, `Importado: ${f.name}`);
  e.target.value = '';
};
$('print').onclick = () => window.print();
$('device').onclick = () => { mobilePreview = !mobilePreview; draw(); };
const showPanel = () => {
  $('side').hidden = panelHidden;
  $('toggle-panel').setAttribute('aria-expanded', String(!panelHidden));
  document.body.classList.toggle('proto-view', panelHidden);
  $('show-plan').setAttribute('aria-pressed', String(!panelHidden));
  $('show-proto').setAttribute('aria-pressed', String(panelHidden));
};
$('show-plan').onclick = () => { panelHidden = false; showPanel(); };
$('show-proto').onclick = () => { panelHidden = true; showPanel(); fitScreen(); };
$('toggle-panel').onclick = () => { panelHidden = !panelHidden; showPanel(); fitScreen(); };
showPanel();
$('mode').onclick = () => { editing = !editing; selected = null; if (!editing && !hashName() && !archOpen()) history.replaceState(null, '', '#'); draw(); };

addEventListener('keydown', (e) => {
  if (!editing || e.target.closest?.('input, textarea, select')) return;
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); removeSelected(); }
  else if (e.key === 'Escape') { selected = null; draw(); }
});
addEventListener('hashchange', () => { selected = null; draw(); });
const quoting = () => !admin || document.body.classList.contains('quote-print');
let titleBefore;
addEventListener('beforeprint', () => {
  if (!quoting()) return drawAll();
  // The browser suggests the document title as the PDF's file name.
  titleBefore = document.title;
  document.title = `Cotización ${doc.app || ''} · Istmo Code`;
});
addEventListener('afterprint', () => {
  if (titleBefore) document.title = titleBefore;
  titleBefore = null;
  document.body.classList.remove('quote-print');
  draw();
});

drawPalette();
drawKits();
// An unedited example is refreshed from the latest code; anything else is restored as saved.
if (slug) openCloud();
else if (doc && !doc.example) { tryLoad(() => load(doc), ''); restoreView(); }
else loadExample(false).then(restoreView);

async function fetchProposal() {
  const res = await fetch(`/api/proposals/${slug}`);
  if (res.status === 401) location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
async function openCloud() {
  $('home').hidden = false;
  try {
    const data = await fetchProposal();
    setAdmin(data.admin);
    clientName = data.client_name || '';
    document.title = `${data.title} · Propuesta`;
    files = await fetch(`/api/proposals/${slug}/files`).then((r) => (r.ok ? r.json() : []));
    refs = await fetch(`/api/proposals/${slug}/refs`).then((r) => (r.ok ? r.json() : []));
    tryLoad(() => load(data.doc), '');
    restoreView();
    if (!admin) watchProposal(data.updated_at);
  } catch (e) {
    $('canvas').replaceChildren(h('p.empty', {}, e.message));
  }
}
// Realtime: when the admin saves, the client's open page reloads the proposal on its own.
async function watchProposal(seen) {
  try {
    const seal = () => fetch(`/api/proposals/${slug}/live`, { method: 'POST' }).then((r) => r.json());
    const { url, sealed } = await seal();
    const { createRealtimeClient } = await import('https://esm.sh/@neon/realtime@0.1.2/client');
    const sub = createRealtimeClient({ url }).subscribe(sealed);
    // Sealed queries are short-lived: fetch a fresh one 10 s before it expires (retry in 1 s on failure).
    const renewAt = (expiresAt) => setTimeout(async () => {
      try { const next = (await seal()).sealed; renewAt(next.expiresAt); await sub.renew(next); } catch { renewAt(Date.now() + 11_000); }
    }, Math.max(0, expiresAt - Date.now() - 10_000));
    renewAt(sealed.expiresAt);
    sub.onChange(async ({ data }) => {
      const at = data?.[0]?.updated_at;
      if (!at || at === seen) return;
      seen = at;
      const fresh = await fetchProposal();
      doc = fresh.doc;
      draw();
    });
  } catch (e) {
    console.warn('Sin actualizaciones en vivo:', e.message);
  }
}

function restoreView() {
  if (view.selected != null && editing) { selected = view.selected; draw(); }
  requestAnimationFrame(() => { $('canvas').scrollTop = view.scroll || 0; });
}
addEventListener('pagehide', () => sessionStorage.setItem('view', JSON.stringify({ editing, mobile: mobilePreview, panelHidden, selected, scroll: $('canvas').scrollTop })));
if (!slug) new EventSource('/api/events').onmessage = () => location.reload();
