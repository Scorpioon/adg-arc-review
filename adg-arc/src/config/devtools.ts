// TG006E Developer Tools visibility rule (handoff Scope B): visible
// automatically under Vite dev, or when explicitly opted into via
// VITE_ENABLE_DEVTOOLS — never exposed by default in an ordinary production
// build. Both flags are statically inlined by Vite at build time, so an
// unflagged production build can dead-code-eliminate the branch this gates.
export const DEVTOOLS_ENABLED: boolean =
  import.meta.env.DEV === true || import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

// Debug-state / export display only. ADGARC-FB-120 F2: derived once at
// build time from package.json's "version" field via Vite's `define` (see
// vite.config.ts) rather than hand-duplicated as a literal here.
declare const __PRODUCT_VERSION__: string;
export const PRODUCT_VERSION: string = __PRODUCT_VERSION__;
