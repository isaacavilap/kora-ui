// Copies packages/kora-ui/dist into each local app's installed copy (apps use install-links, so they hold a copy,
// not a symlink, and React stays single). `npm run dev:lib` runs this after every rebuild; next dev picks it up.
// Each file is written to a temp name and renamed, so a dev server never reads a half-written file.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "packages/kora-ui/dist");
// Apps that install kora-ui with "file:" (paths relative to this repo). Missing ones are skipped.
const apps = ["../social", "../portal", "../web", "../istmobot/apps/web", "../../Lab/validator"];

const files = fs.readdirSync(src);
for (const app of apps) {
  const pkg = path.join(root, app, "node_modules/kora-ui");
  // Not installed, or a symlink straight to this repo (already live).
  if (!fs.existsSync(pkg) || fs.realpathSync(pkg).startsWith(root)) continue;
  const out = path.join(fs.realpathSync(pkg), "dist");
  fs.mkdirSync(out, { recursive: true });
  for (const f of files) {
    const tmp = path.join(out, `.${f}.tmp`);
    fs.copyFileSync(path.join(src, f), tmp);
    fs.renameSync(tmp, path.join(out, f));
  }
  // Old chunk names from earlier builds.
  for (const f of fs.readdirSync(out)) if (!files.includes(f)) fs.rmSync(path.join(out, f), { force: true });
  // New exports too. New dependencies still need `npm run kora` in the app.
  const pj = path.join(out, "../package.json");
  fs.copyFileSync(path.join(src, "../package.json"), `${pj}.tmp`);
  fs.renameSync(`${pj}.tmp`, pj);
  console.log(`kora-ui → ${app}`);
}
