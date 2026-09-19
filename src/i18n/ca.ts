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
export const ca: Partial<Record<TranslationKey, string>> = {};
