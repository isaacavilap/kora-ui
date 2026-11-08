// Fails if page code uses a native tag in place of a kora-ui component.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// style: CSS that a demo injects on purpose (themeColorsCss); kora-ui has no component for it.
const allowed = new Set(["html", "head", "body", "svg", "path", "rect", "circle", "g", "style"]);

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return name.endsWith(".tsx") ? [path] : [];
  });
}

let found = 0;
for (const dir of process.argv.slice(2)) {
  for (const file of files(dir)) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      // A JSX tag follows a line start, a bracket, an arrow, or JSX text. Generics such as useState<string> follow a word.
      for (const [, tag] of line.matchAll(/(?:^|[\s(>{&|?:])<([a-z][a-z0-9]*)(?=[\s/>]|$)/g)) {
        if (allowed.has(tag)) continue;
        console.log(`${file}:${i + 1} <${tag}>`);
        found++;
      }
    });
  }
}
if (found) {
  console.error(`${found} native tags. Use kora-ui components.`);
  process.exit(1);
}
console.log("No native tags.");
