import { readFile } from "node:fs/promises";
import path from "node:path";
import { codeToHtml } from "shiki";

export async function highlight(code: string, lang = "tsx") {
  return codeToHtml(code, { lang, themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" }, defaultColor: false });
}

/** Reads a demo from disk, so the shown code is always the code that runs. */
export async function readSource(folder: "demos" | "templates", slug: string) {
  const code = await readFile(path.join(process.cwd(), folder, `${slug}.tsx`), "utf8");
  return highlight(code.replace(/^"use client";\n/, ""));
}

