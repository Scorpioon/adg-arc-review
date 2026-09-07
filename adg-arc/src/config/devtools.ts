// TG006E Developer Tools visibility rule (handoff Scope B): visible
// automatically under Vite dev, or when explicitly opted into via
// VITE_ENABLE_DEVTOOLS — never exposed by default in an ordinary production
// build. Both flags are statically inlined by Vite at build time, so an
// unflagged production build can dead-code-eliminate the branch this gates.
export const DEVTOOLS_ENABLED: boolean =
  import.meta.env.DEV === true || import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

// Debug-state / export display only — not read from package.json (that
// file sits outside this project's `src` TypeScript root). Keep this in
// sync with package.json's "version" field whenever either changes.
export const PRODUCT_VERSION = "0.0.13";
