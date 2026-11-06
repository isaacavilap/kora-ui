import { defineConfig } from "tsup";

export default defineConfig({
  entry: { server: "src/server.ts", cli: "src/cli.ts" },
  format: ["esm"],
  dts: { entry: "src/server.ts" },
  clean: true,
  target: "node20",
});
