// Talks to the built server over stdio, the way an AI client does.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import test from "node:test";

function connect() {
  const child = spawn(process.execPath, [resolve(import.meta.dirname, "../dist/cli.js")], { stdio: ["pipe", "pipe", "inherit"] });
  const pending = new Map();
  createInterface({ input: child.stdout }).on("line", (raw) => {
    const message = JSON.parse(raw);
    pending.get(message.id)?.(message);
  });
  let id = 0;
  const request = (method, params) => new Promise((done) => {
    pending.set(++id, done);
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
  const call = async (name, args = {}) => (await request("tools/call", { name, arguments: args })).result;
  return { child, request, call };
}

test("answers an AI client over stdio", async (t) => {
  const { child, request, call } = connect();
  t.after(() => child.kill());
  const init = await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } });
  assert.equal(init.result.serverInfo.name, "kora-ui");
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);

  const tools = (await request("tools/list", {})).result.tools.map((tool) => tool.name).sort();
  assert.deepEqual(tools, ["get_component", "get_setup", "get_template", "list_components", "list_templates", "search_kora"]);

  const table = (await call("get_component", { slug: "data-table" })).content[0].text;
  assert.match(table, /kora-ui\/table/);
  assert.match(table, /renderExpanded/);

  const page = (await call("get_template", { slug: "group-overview" })).content[0].text;
  assert.match(page, /export default function Template/);

  assert.match((await call("search_kora", { query: "calendar" })).content[0].text, /event-calendar/);
  assert.match((await call("get_setup")).content[0].text, /AppShell/);

  const missing = await call("get_component", { slug: "nope" });
  assert.equal(missing.isError, true);
  assert.match(missing.content[0].text, /list_components/);
});
