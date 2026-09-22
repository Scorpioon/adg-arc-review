import type { TranslationKey } from "./es";

// TG006I Scope E — English catalog: prepared, intentionally NOT translated
// this milestone. See ca.ts's identical rationale — `en` is listed in
// i18n/locales.ts with status "disabled" and cannot be activated until a
// full catalog is authored.
export const en: Partial<Record<TranslationKey, string>> = {
  // TG020-R3 (chapter-nav accessibility correction): a single explicit
  // exception to the "empty until a full catalog is authored" rule above —
  // the operator supplied this string directly. `t()` still falls back to
  // `es` for every other key, and the locale itself stays "disabled" in
  // locales.ts (unreachable in the running app), so this carries no
  // activation risk.
  "caseSheet.chapterOrdinal": "Chapter %{index} of %{total}",
};
