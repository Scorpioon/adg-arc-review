import type { TranslationKey } from "./es";

// TG006I Scope E — English catalog: prepared, intentionally NOT translated
// this milestone. See ca.ts's identical rationale — `en` is listed in
// i18n/locales.ts with status "disabled" and cannot be activated until a
// full catalog is authored.
export const en: Partial<Record<TranslationKey, string>> = {
  // TG041 (page-nav accessibility correction, supersedes the TG020-R3
  // chapter-circle string of the same exception): a single explicit
  // exception to the "empty until a full catalog is authored" rule above —
  // the operator supplied this string directly. `t()` still falls back to
  // `es` for every other key, and the locale itself stays "disabled" in
  // locales.ts (unreachable in the running app), so this carries no
  // activation risk.
  "caseSheet.pageOrdinal": "Page %{index} of %{total}",
  // TG049 Stage 1 Phase C A01 (OPERATOR-approved): the four Passport
  // dossier labels this pass renames/adds in `es.ts`, translated here for
  // the same reason as `caseSheet.pageOrdinal` above — the locale stays
  // "disabled" (unreachable), so these carry no activation risk, but `t()`
  // resolves them correctly the moment `en` is ever activated.
  "caseSheet.section.architecture": "Form",
  // MTG01_R2 FB-014: tracks the `es`/`ca` rename to the short form.
  "caseSheet.section.typographyPhoto": "Typeface",
  "caseSheet.section.typography": "Characters",
  "caseSheet.fact.architect": "Author",
  // TG051 IMP-01 (OPERATOR-approved): the five keys this pass adds in
  // `es.ts`, translated here for the same reason as the keys above — the
  // locale stays "disabled" (unreachable), so these carry no activation risk,
  // but `t()` resolves them correctly the moment `en` is ever activated.
  // MTG01_R2 FB-016: tracks the `es`/`ca` rename to the short form. `en` has
  // no entry for the building sheet's own `caseSheet.section.facts`, so that
  // page falls back to the Catalan "Fitxa"; this key is given the matching
  // English short form rather than left as the long label, which would have
  // made the two sheets read inconsistently the moment `en` is activated.
  "caseSheet.section.typographySheet": "Sheet",
  "caseSheet.fact.typeface": "Typeface",
  "caseSheet.fact.designer": "Designer",
  "caseSheet.fact.classification": "Classification",
  "caseSheet.typographyLink": "link to typeface",
};
