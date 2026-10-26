// MTG01 TG063 IMP-02A — additive ES/EN editorial-content overlay (report
// §10.3/§10.4 R2-2). Catalan `cases.ts` stays the single canonical source;
// this module adds nothing to it and imports only its types, never its
// runtime values. Keyed by the real free-text `infocard`/`heroMedia` fields
// confirmed to exist on `CaseRecord` (cases.ts L.301-351) — proper nouns,
// dates, coordinates, URLs, attribution and provenance are deliberately
// excluded and stay locale-invariant, sourced once from the CA record.
import type { CaseRecord } from "./cases";

export type CaseEditorialLocale = "es" | "en";

// Every field optional: partial translation progress (e.g. ES done, EN
// pending, or only some fields of either) is a defined, inspectable state,
// not an error. A missing field means "not yet translated," never "blank."
export interface CaseEditorialTranslation {
  // `infocard.buildingProse.displayText`
  buildingProse?: string;
  // `infocard.architectureCopy.displayText`
  architectureCopy?: string;
  // `infocard.typographyCopy.displayText`
  typographyCopy?: string;
  // `infocard.dialogueCopy.displayText`
  dialogueCopy?: string;
  // `infocard.highlightedPhrase.displayText` — only `displayText`; `kind`,
  // `attribution` and `bibliographicContext` are proper nouns/citation
  // metadata, excluded from translation per the overlay's scope.
  highlightedPhrase?: string;
  // `infocard.typographyHighlightedPhrase.displayText` (physical cases only)
  typographyHighlightedPhrase?: string;
  // `heroMedia.alt`
  heroMediaAlt?: string;
}

export type CaseEditorialTranslations = Partial<
  Record<CaseRecord["slug"], Partial<Record<CaseEditorialLocale, CaseEditorialTranslation>>>
>;

// Empty by design: 0/20 ES and 0/20 EN dossiers populated at this stage.
// No case keys, no 'TODO' placeholders, no Catalan copy relabeled as a
// translation — see report §15.3 for the honest completeness ledger.
export const caseEditorialTranslations: CaseEditorialTranslations = {};
