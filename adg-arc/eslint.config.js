import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// ADG-ARC TG035 — conservative engineering-quality baseline (ADGARC-FB-124).
// Scope is deliberately narrow: probable bugs, TypeScript-aware correctness,
// React Hooks correctness, and dead-code signals not already enforced by
// tsconfig's own strict/noUnusedLocals/noUnusedParameters. No formatting
// rules; no Prettier. `reportUnusedDisableDirectives` makes every existing
// `eslint-disable` comment in src/ self-checking rather than trusted blindly.
//
// TG035 corrective (same-day): `eslint-plugin-react-hooks`'s own
// `recommended` preset (v7, shipped with ESLint 10's resolved toolchain)
// turns on three newer architectural rules — set-state-in-effect, refs,
// purity — as blocking errors. Those inspect React component-design
// patterns, not the probable-bugs/correctness signal TG035 was scoped to
// gate on, and the first real lint run surfaced 15 such errors against
// pre-existing, unreviewed product code. Explicitly disabling them here
// keeps this baseline to what the handoff asked for (rules-of-hooks,
// exhaustive-deps, no-explicit-any, react-refresh) without this task
// absorbing a React architectural refactor. They remain available to
// re-enable later as a separately-scoped, deliberate decision.
export default tseslint.config(
  { ignores: ["dist"] },
  { linterOptions: { reportUnusedDisableDirectives: "warn" } },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  }
);
