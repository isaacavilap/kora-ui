// Wireframly: static server + /api/generate proxy to Claude. No dependencies.
// Serves ./public of the folder it runs from first (portal adds its own pages there), then this package's public/.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, watch } from 'node:fs';
import { extname, join } from 'node:path';
import { generate } from './ai.js';

const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL || 'claude-sonnet-5-5';
const PUBLIC = [...new Set([join(process.cwd(), 'public'), join(import.meta.dirname, 'public')])].filter(existsSync);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

// Live reload: browsers listen on /api/events and reload when a file in public/ changes.
const listeners = new Set();
let timer;
for (const dir of PUBLIC) watch(dir, { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => listeners.forEach((res) => res.write('data: reload\n\n')), 150);
});

http
  .createServer(async (req, res) => {
    try {
      if (req.url === '/api/events') {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
        res.write(': connected\n\n');
        listeners.add(res);
        req.on('close', () => listeners.delete(res));
        return;
      }
      if (req.method === 'POST' && req.url === '/api/generate') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const { prompt } = JSON.parse(body || '{}');
        if (!prompt?.trim()) throw new Error('Prompt vacío');
        const out = await generate(prompt, {
          baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: MODEL,
          rules: await readFile(join(import.meta.dirname, 'rules.md'), 'utf8').catch(() => ''),
        });
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify(out));
      }
      const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = pathname === '/' ? 'index.html' : pathname.slice(1);
      if (file.includes('..')) throw Object.assign(new Error('Not found'), { code: 404 });
      let content;
      for (const dir of PUBLIC) if ((content = await readFile(join(dir, file)).catch(() => null))) break;
      if (!content) throw Object.assign(new Error('Not found'), { code: 404 });
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
      res.end(content);
    } catch (err) {
      const status = err.code === 'ENOENT' || err.code === 404 ? 404 : 500;
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  })
  .listen(PORT, () => console.log(`Wireframly → http://localhost:${PORT} (model ${MODEL})`));
