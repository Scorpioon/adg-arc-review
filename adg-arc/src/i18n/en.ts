import type { TranslationKey } from "./es";

// TG006I Scope E — English catalog: prepared, intentionally NOT translated
// this milestone. See ca.ts's identical rationale — `en` is listed in
// i18n/locales.ts with status "disabled" and cannot be activated until a
// full catalog is authored.
export const en: Partial<Record<TranslationKey, string>> = {};
