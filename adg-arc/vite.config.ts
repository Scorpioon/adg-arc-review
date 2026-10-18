import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ADGARC-FB-120 F2: single source of the shipped product version. Read once
// here (not via a TS JSON import — package.json sits outside src's rootDir)
// and injected as a build-time constant so src/config/devtools.ts no longer
// hand-duplicates the literal.
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8")) as {
  version: string;
};

// GitHub Pages serves this project from a subpath; base is set at build time
// via the VITE_BASE env var so local dev keeps the default "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/",
  define: {
    __PRODUCT_VERSION__: JSON.stringify(pkg.version),
  },
});
