// TG006I Scope E — locale identity/activation authority (ADGARC-FB-010).
// `es` is the only active locale this milestone; `ca`/`en` are visible in
// the selector but cannot be activated while their catalogs are prepared/
// empty (ca.ts / en.ts) — this is the single place that status is decided,
// so LocaleProvider.setLocale and the Settings selector can never disagree
// about which locales are real choices.
export type LocaleCode = "es" | "ca" | "en";

export type LocaleStatus = "active" | "disabled";

export interface LocaleMeta {
  code: LocaleCode;
  // Visible selector label — the handoff's exact accepted wording: "CAT ES
  // ENG", not a translation of the locale name.
  selectorLabel: string;
  status: LocaleStatus;
}

// Display order matches the accepted selector order: CAT, ES, ENG.
export const LOCALES: LocaleMeta[] = [
  { code: "ca", selectorLabel: "CAT", status: "disabled" },
  { code: "es", selectorLabel: "ES", status: "active" },
  { code: "en", selectorLabel: "ENG", status: "disabled" },
];

export const DEFAULT_LOCALE: LocaleCode = "es";

export function isActivatableLocale(code: string): code is LocaleCode {
  return LOCALES.some((l) => l.code === code && l.status === "active");
}
