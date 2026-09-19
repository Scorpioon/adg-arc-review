import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this project from a subpath; base is set at build time
// via the VITE_BASE env var so local dev keeps the default "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/",
});
