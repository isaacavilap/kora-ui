// Copies the docs registry and the source of every demo and template into one JSON file,
// so the server always answers with the code that the docs site runs.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { transformSync } from "esbuild";

const docs = resolve(import.meta.dirname, "../../../apps/docs");
const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../kora-ui/package.json"), "utf8"));

const { code } = transformSync(readFileSync(resolve(docs, "lib/registry.ts"), "utf8"), { loader: "ts", format: "esm" });
const { componentGroups, templateDocs } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

const source = (folder, slug) => {
  const file = resolve(docs, folder, `${slug}.tsx`);
  return existsSync(file) ? readFileSync(file, "utf8").replace(/^"use client";\n/, "") : undefined;
};

const catalog = {
  version: pkg.version,
  components: componentGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.name, example: source("demos", item.slug) }))),
  templates: templateDocs.map((item) => ({ ...item, source: source("templates", item.slug) })),
  shell: source("templates", "shell"),
};

const missing = catalog.templates.filter((t) => !t.source).map((t) => t.slug);
if (missing.length) throw new Error(`Templates with no source file: ${missing.join(", ")}`);

writeFileSync(resolve(import.meta.dirname, "../src/catalog.json"), JSON.stringify(catalog));
console.log(`Catalog: ${catalog.components.length} components, ${catalog.templates.length} templates`);
