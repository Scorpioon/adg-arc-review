import type { TranslationKey } from "./es";

// TG006I Scope E — Catalan catalog: prepared, intentionally NOT translated
// this milestone (ADGARC-FB-010 "translate current UI into Spanish...
// prepare CAT/ENG catalogs/contracts but disable activation"). `ca` is
// listed in i18n/locales.ts with status "disabled" so it cannot be
// activated while this catalog is incomplete — see LocaleProvider's
// `setLocale`, which rejects activating a non-"active" locale. `t()` falls
// back key-by-key to the `es` catalog for any key missing here, so an empty
// catalog is a safe, non-crashing starting point for future full
// translation, never a runtime hazard.
export const ca: Partial<Record<TranslationKey, string>> = {
  // TG041 (page-nav accessibility correction, supersedes the TG020-R3
  // chapter-circle string of the same exception): a single explicit
  // exception to the "empty until a full catalog is authored" rule above —
  // the operator supplied this string directly. `t()` still falls back to
  // `es` for every other key, and the locale itself stays "disabled" in
  // locales.ts (unreachable in the running app), so this carries no
  // activation risk.
  "caseSheet.pageOrdinal": "Pàgina %{index} de %{total}",
  // TG049 Stage 1 Phase C A01 (OPERATOR-approved): the four Passport dossier
  // labels this pass renames/adds in `es.ts` — the `es` catalog already
  // uses this exact Catalan-register wording for these particular keys
  // (see its own comments), so the genuine Catalan string is identical; set
  // explicitly here rather than left to the es fallback, for the same
  // no-activation-risk reason as `caseSheet.pageOrdinal` above.
  "caseSheet.section.architecture": "Forma",
  "caseSheet.section.typographyPhoto": "Fotografia de la tipografia",
  "caseSheet.section.typography": "Caràcters",
  "caseSheet.fact.architect": "Autor",
};
