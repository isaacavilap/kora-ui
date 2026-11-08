// Self-check for the reusable diagram layout: node --no-warnings scripts/arch-check.mjs
import assert from 'node:assert/strict';
import { layoutDiagram } from '../public/arch.js';

const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const shapes = {
  small: { columns: [{ label: 'A', nodes: [{ id: 'a', name: 'App' }] }, { label: 'B', nodes: [{ id: 'b', name: 'DB' }] }], links: [{ from: 'a', to: 'b' }] },
  many: {
    columns: [
      { label: 'P', nodes: ['p1', 'p2', 'p3', 'p4', 'p5'].map((id) => ({ id, name: id })) },
      { label: 'A', nodes: [{ id: 'app', name: 'App', device: true }] },
      { label: 'S', nodes: [{ id: 'api', name: 'API' }, { id: 'jobs', name: 'Jobs' }] },
    ],
    bottom: { label: 'X', from: 1, nodes: [{ id: 'x1', name: 'One' }, { id: 'x2', name: 'Two' }] },
    source: { label: 'Code', to: 'app', via: 'Deploy', node: { id: 'git', name: 'Repo' } },
    links: [
      { from: 'p1', to: 'app' }, { from: 'p5', to: 'app' }, { from: 'app', to: 'api', both: true, main: true },
      { from: 'api', to: 'jobs', label: 'Queue' }, { from: 'jobs', to: 'x1' }, { from: 'jobs', to: 'x2' },
      { from: 'api', to: 'missing' },
    ],
  },
};
for (const [name, d] of Object.entries(shapes)) {
  const map = layoutDiagram(d);
  for (const n of map.nodes) {
    assert.ok(n.x >= 0 && n.x + n.w <= map.width + 0.01, `${name}: ${n.id} outside width`);
    assert.ok(n.y >= 0 && n.y + n.h <= map.height + 0.01, `${name}: ${n.id} outside height`);
    assert.ok(n.h >= 90, `${name}: ${n.id} too short for its text`);
  }
  map.nodes.forEach((a, i) => map.nodes.slice(i + 1).forEach((b) => assert.ok(!overlap(a, b), `${name}: ${a.id} overlaps ${b.id}`)));
  assert.ok(map.paths.every((p) => !p.d.includes('NaN')), `${name}: broken path`);
}
const many = layoutDiagram(shapes.many);
assert.equal(many.paths.length, 7, 'links to unknown nodes are skipped; the rest are drawn');
console.log('arch-check ok');
