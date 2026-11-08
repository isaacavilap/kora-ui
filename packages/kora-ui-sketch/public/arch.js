// Reusable architecture diagram. Any proposal gets one by adding `plan.diagram` to its JSON; nothing here knows a project.
//
// plan.diagram = {
//   summary: 'One sentence under the title.',
//   columns: [{ label: 'Who uses it', nodes: [{ id: 'web', name: 'App', tech: 'Next.js', detail: '...', icon: 'chart', device: true, hub: true, optional: true }] }],
//   bottom: { label: 'External services', from: 1, nodes: [{ id: 'pay', name: 'Payments' }] },  // optional row under the columns
//   source: { label: 'Code', to: 'web', via: 'Deploy', node: { id: 'git', name: 'Repository', tech: 'GitHub', icon: 'branch' } },  // optional, under the first column; needs bottom.from >= 1
//   links: [{ from: 'web', to: 'api', label: 'HTTPS', main: true, both: true }],
// }
// Links run between neighbouring columns, inside one column (top to bottom) or from a column node down to `bottom`.
import { h } from './render.js';

const W = 1040;
const COL_GAP = 80;
const NODE_GAP = 14;
const LINKED_GAP = 40; // Room for an arrow and its label between nodes of one column.
const TOP = 40;
const MIN_H = 96;
const BOTTOM_GAP = 74;
const BOTTOM_H = 90;

// Pure geometry, no DOM: scripts/arch-check.mjs runs it in Node.
export function layoutDiagram(d) {
  const columns = d.columns || [];
  const links = d.links || [];
  const n = Math.max(columns.length, 1);
  const colW = (W - COL_GAP * (n - 1)) / n;
  const inColumn = (col, l) => col.nodes.some((x) => x.id === l.from) && col.nodes.some((x) => x.id === l.to);
  const gapOf = (col) => (links.some((l) => inColumn(col, l)) ? LINKED_GAP : NODE_GAP);
  const needs = (col) => {
    const count = col.nodes?.length || 0;
    const device = col.nodes?.some((x) => x.device) ? 220 : 0;
    return Math.max(count * MIN_H + (count - 1) * gapOf(col), device);
  };
  const height = Math.max(316, ...columns.map(needs));
  const rects = {};
  const labels = [];
  columns.forEach((col, c) => {
    const x = c * (colW + COL_GAP);
    labels.push({ x, y: 20, text: col.label });
    const nodes = col.nodes || [];
    const gap = gapOf(col);
    const h = (height - gap * (nodes.length - 1)) / (nodes.length || 1);
    nodes.forEach((node, i) => { rects[node.id] = { ...node, x, y: TOP + i * (h + gap), w: colW, h, col: c }; });
  });
  const bottom = d.bottom?.nodes || [];
  const bottomY = TOP + height + BOTTOM_GAP;
  if (bottom.length) {
    const startX = (d.bottom.from || 0) * (colW + COL_GAP);
    const gap = 15;
    const w = (W - startX - gap * (bottom.length - 1)) / bottom.length;
    bottom.forEach((node, i) => { rects[node.id] = { ...node, x: startX + i * (w + gap), y: bottomY, w, h: BOTTOM_H, col: 'bottom' }; });
  }

  const source = d.source?.node;
  if (source) {
    labels.push({ x: 0, y: bottomY - 10, text: d.source.label });
    rects[source.id] = { ...source, x: 0, y: bottomY, w: colW, h: BOTTOM_H, col: 'source' };
  }

  // Each node edge spreads its links evenly; a lone pair of facing edges stays a straight line.
  const sideCount = {};
  const sideSeen = {};
  const side = (id, edge) => `${id}:${edge}`;
  const sideLinks = links.filter((l) => rects[l.from] && rects[l.to] && rects[l.from].col !== 'bottom' && rects[l.to].col !== 'bottom' && rects[l.from].col !== rects[l.to].col);
  const edges = (l) => (rects[l.from].col < rects[l.to].col ? ['r', 'l'] : ['l', 'r']);
  for (const l of sideLinks) {
    const [a, b] = edges(l);
    sideCount[side(l.from, a)] = (sideCount[side(l.from, a)] || 0) + 1;
    sideCount[side(l.to, b)] = (sideCount[side(l.to, b)] || 0) + 1;
  }
  const spread = (id, edge) => {
    const key = side(id, edge);
    sideSeen[key] = (sideSeen[key] || 0) + 1;
    return rects[id].y + (rects[id].h * sideSeen[key]) / (sideCount[key] + 1);
  };
  const paths = [];
  const toBottom = new Map();
  for (const l of links) {
    const a = rects[l.from];
    const b = rects[l.to];
    if (!a || !b) continue;
    if (b.col === 'bottom') { toBottom.set(l.from, [...(toBottom.get(l.from) || []), b]); continue; }
    if (a.col === b.col) {
      const x = a.x + a.w / 2;
      paths.push({ d: `M${x} ${a.y + a.h}V${b.y - 8}`, heads: [{ x, y: b.y, dir: 'down' }], label: l.label && { x: x + 12, y: b.y - 16, text: l.label }, main: l.main });
      continue;
    }
    const [ea, eb] = edges(l);
    let ya = spread(l.from, ea);
    let yb = spread(l.to, eb);
    const top = Math.max(a.y, b.y);
    const low = Math.min(a.y + a.h, b.y + b.h);
    if (sideCount[side(l.from, ea)] === 1 && sideCount[side(l.to, eb)] === 1 && top < low) ya = yb = (top + low) / 2;
    // A target that faces its source flat gets a straight line instead of a barely tilted one.
    else if (sideCount[side(l.to, eb)] === 1 && yb > a.y + 10 && yb < a.y + a.h - 10) ya = yb;
    const dir = ea === 'r' ? 1 : -1;
    const xa = ea === 'r' ? a.x + a.w : a.x;
    const xb = eb === 'l' ? b.x : b.x + b.w;
    const start = xa + (l.both ? dir * 8 : 0);
    const end = xb - dir * 8;
    const mid = (start + end) / 2;
    paths.push({
      d: ya === yb ? `M${start} ${ya}H${end}` : `M${start} ${ya}C${mid} ${ya} ${mid} ${yb} ${end} ${yb}`,
      heads: [{ x: xb, y: yb, dir: dir > 0 ? 'right' : 'left' }, ...(l.both ? [{ x: xa, y: ya, dir: dir > 0 ? 'left' : 'right' }] : [])],
      label: l.label && { x: (xa + xb) / 2, y: Math.min(ya, yb) - 12, text: l.label, middle: true },
      main: l.main,
    });
  }
  // A trunk leaves the source and branches to every target in the bottom row.
  for (const [id, targets] of toBottom) {
    const a = rects[id];
    const centers = targets.map((t) => t.x + t.w / 2);
    const row = (Math.min(...centers) + Math.max(...centers)) / 2;
    const x = Math.min(Math.max(row, a.x + 16), a.x + a.w - 16);
    const trunk = bottomY - 46;
    for (const cx of centers) {
      const bend = cx === x ? '' : `H${cx < x ? cx + 10 : cx - 10}Q${cx} ${trunk} ${cx} ${trunk + 10}`;
      paths.push({ d: `M${x} ${a.y + a.h}V${trunk}${bend}V${bottomY - 8}`, heads: [{ x: cx, y: bottomY, dir: 'down' }] });
    }
    if (d.bottom.label) labels.push({ x: x + 12, y: bottomY - 54, text: d.bottom.label });
  }
  // The code feeds the app from below, through the gutter next to the first column.
  const target = source && rects[d.source.to];
  if (target) {
    const gutter = colW + COL_GAP / 2;
    const cx = target.x + target.w / 2;
    const run = target.y + target.h + 20;
    paths.push({
      d: `M${colW} ${bottomY + BOTTOM_H / 2}H${gutter}V${run}H${cx}V${target.y + target.h + 8}`,
      heads: [{ x: cx, y: target.y + target.h, dir: 'up' }],
      label: d.source.via && { x: gutter - 10, y: bottomY - 10, text: d.source.via, end: true },
    });
  }
  return { width: W, height: bottom.length || source ? bottomY + BOTTOM_H : TOP + height, labels, nodes: Object.values(rects), paths };
}

const ICONS = {
  chart: 'M3 3v18h18 M8 17v-5 M13 17V7 M18 17v-8',
  factory: 'M2 20V9l6 4V9l6 4V5h8v15z',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  shield: 'M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z M9 12l2 2 4-4',
  card: 'M3 6h18v12H3z M3 10h18 M7 15h3',
  doc: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-5A8 8 0 1 1 21 12z',
  ai: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z',
  branch: 'M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-7 8-7s8 3 8 7',
  server: 'M3 4h18v7H3z M3 13h18v7H3z M7 7.5h.01 M7 16.5h.01',
  cloud: 'M7 19a5 5 0 0 1-.6-10A6 6 0 0 1 18 9.5a4.5 4.5 0 0 1-.5 9.5z',
};

const svg = (tag, attrs = {}, ...kids) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat().filter(Boolean));
  return el;
};
const text = (x, y, cls, content, attrs = {}) => { const el = svg('text', { x, y, class: cls, ...attrs }); el.textContent = content; return el; };
export const wrapText = (value, max) => String(value || '').split(' ').filter(Boolean).reduce((rows, word) => {
  if (rows.length && `${rows.at(-1)} ${word}`.length <= max) rows[rows.length - 1] += ` ${word}`;
  else rows.push(word);
  return rows;
}, []);
const head = ({ x, y, dir }, cls) => svg('path', {
  class: cls,
  d: dir === 'right' ? `M${x - 8} ${y - 5}L${x} ${y}L${x - 8} ${y + 5}z` : dir === 'left' ? `M${x + 8} ${y - 5}L${x} ${y}L${x + 8} ${y + 5}z` : dir === 'up' ? `M${x - 5} ${y + 8}L${x} ${y}L${x + 5} ${y + 8}z` : `M${x - 5} ${y - 8}L${x} ${y}L${x + 5} ${y - 8}z`,
});
// The same product on a computer and a phone, for a node with `device: true`.
const devices = (x, y, w) => {
  const s = (w - 16) / 204;
  const r = (rx, ry, width, height, radius, cls) => svg('rect', { x: rx, y: ry, width, height, rx: radius, ...(cls && { class: cls }) });
  return svg('g', { class: 'arch-device', transform: `translate(${x + 8} ${y + 22}) scale(${s})` },
    r(14, 4, 150, 96, 6), svg('path', { d: 'M2 108h174' }),
    r(24, 14, 34, 76, 3, 'arch-fill'), r(68, 16, 84, 10, 2, 'arch-fill-accent'), r(68, 34, 84, 6, 2, 'arch-fill'), r(68, 46, 62, 6, 2, 'arch-fill'), r(68, 58, 84, 6, 2, 'arch-fill'),
    r(144, 34, 52, 92, 8, 'arch-phone'), r(152, 46, 36, 8, 2, 'arch-fill-accent'), r(152, 60, 36, 5, 2, 'arch-fill'), r(152, 71, 26, 5, 2, 'arch-fill'), r(152, 82, 36, 5, 2, 'arch-fill'));
};
function nodeEl(n) {
  const icon = ICONS[n.icon];
  const left = n.x + (icon ? 56 : 18);
  const max = Math.floor((n.x + n.w - left - 12) / 7.6);
  const rows = [
    ...wrapText(n.name, max).map((t) => ['arch-t-name', t, 19]),
    ...(n.tech ? [['arch-t-tech', n.tech, 18]] : []),
    ...wrapText(n.detail, Math.floor(max * 1.15)).map((t) => ['arch-t-detail', t, 17]),
  ];
  const total = rows.reduce((a, r) => a + r[2], 0);
  let y = n.device ? n.y + 192 : n.y + (n.h - total) / 2 + 13;
  return svg('g', {},
    svg('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: 12, class: n.hub ? 'arch-hub' : n.optional ? 'arch-card arch-optional' : 'arch-card' }),
    n.device ? devices(n.x, n.y, n.w) : null,
    icon ? svg('path', { d: icon, transform: `translate(${n.x + 18} ${n.y + n.h / 2 - 12})`, class: 'arch-icon' }) : null,
    rows.map(([cls, t, lh]) => { const el = text(left, y, cls, t); y += lh; return el; }));
}
function archMap(d) {
  const map = layoutDiagram(d);
  const all = [...(d.columns || []), ...(d.bottom ? [d.bottom] : []), ...(d.source ? [{ label: d.source.label, nodes: [d.source.node] }] : [])];
  return svg('svg', {
    class: 'arch-map',
    viewBox: `0 0 ${map.width} ${map.height}`,
    role: 'img',
    'aria-label': all.map((c) => `${c.label}: ${(c.nodes || []).map((n) => n.name).join(', ')}`).join('. '),
  },
    map.labels.map((l) => text(l.x, l.y, 'arch-t-label', l.text)),
    map.paths.map((p) => svg('g', {},
      svg('path', { d: p.d, class: p.main ? 'arch-link arch-link-main' : 'arch-link' }),
      p.heads.map((x) => head(x, p.main ? 'arch-head arch-head-main' : 'arch-head')),
      p.label ? text(p.label.x, p.label.y, 'arch-t-via', p.label.text, p.label.middle ? { 'text-anchor': 'middle' } : p.label.end ? { 'text-anchor': 'end' } : {}) : null)),
    map.nodes.map(nodeEl));
}
// The map for wide screens and the PDF; the stacked list is the phone version of the same data.
export const archDiagram = (d) => h('div.arch-wrap', {},
  archMap(d),
  h('ol.arch', {}, [...(d.columns || []), ...(d.bottom ? [{ ...d.bottom, detached: true }] : []), ...(d.source ? [{ label: d.source.label, nodes: [d.source.node], detached: true }] : [])].map((l) => h(l.detached ? 'li.arch-layer.arch-detached' : 'li.arch-layer', {},
    h('span.arch-label', {}, l.label),
    h('div.arch-nodes', {}, (l.nodes || []).map((n) => h(n.hub ? 'div.arch-node.is-hub' : 'div.arch-node', {}, h('strong', {}, n.name), n.tech ? h('span', {}, n.tech) : null, n.detail ? h('small', {}, n.detail) : null)))))));
