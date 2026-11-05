import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/components/index.ts",
    table: "src/table/index.ts",
    charts: "src/charts/index.ts",
    auth: "src/auth/index.ts",
    screens: "src/screens/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  target: "es2020",
  treeshake: false,
  splitting: true,
  clean: true,
  banner: { js: '"use client";' },
});
