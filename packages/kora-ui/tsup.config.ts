import { defineConfig } from "tsup";

export default defineConfig((options) => ({
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
  // Watch mode keeps dist: cleaning wiped styles.css and broke running dev servers mid-rebuild.
  clean: !options.watch,
  banner: { js: '"use client";' },
}));
