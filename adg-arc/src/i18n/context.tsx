import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { es, type TranslationKey } from "./es";
import { ca } from "./ca";
import { en } from "./en";
import { DEFAULT_LOCALE, isActivatableLocale, LOCALES, type LocaleCode, type LocaleMeta } from "./locales";

// TG006I Scope E — lightweight, dependency-free UI-localization authority
// (ADGARC-FB-010): no i18n library added, matching the handoff's "a small
// project-local i18n module/context/hook is preferred over adding a library
// for three prepared locales at this stage." `es` is both the active
// catalog and the type/fallback authority — every `t()` lookup falls back
// to the Spanish string for any key a non-active catalog (ca/en) does not
// yet define, so an incomplete catalog can never render a blank/missing
// string even if a future build activates it prematurely.
const CATALOGS: Record<LocaleCode, Partial<Record<TranslationKey, string>>> = { es, ca, en };

const STORAGE_KEY = "adgarc.ui.locale.v1";

function readStoredLocale(): LocaleCode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isActivatableLocale(raw)) return raw;
  } catch {
    // Local-dev/persistence convenience only — a storage failure just means
    // the session falls back to the default locale, never a hard failure.
  }
  return DEFAULT_LOCALE;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/%\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export interface LocaleContextValue {
  locale: LocaleCode;
  // Rejects (no-ops) rather than throwing when asked to activate a
  // "disabled" locale — the single enforcement point for ADGARC-FB-010's
  // "incomplete locales cannot be selected accidentally," so the Settings
  // selector doesn't need to duplicate this check itself.
  setLocale: (code: LocaleCode) => void;
  locales: LocaleMeta[];
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => readStoredLocale());

  const setLocale = (code: LocaleCode) => {
    if (!isActivatableLocale(code)) return;
    setLocaleState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Local-dev/persistence convenience only — see readStoredLocale.
    }
  };

  const t = useMemo(() => {
    const catalog = CATALOGS[locale];
    return (key: TranslationKey, vars?: Record<string, string | number>) =>
      interpolate(catalog[key] ?? es[key], vars);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, locales: LOCALES, t }),
    [locale, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT(): LocaleContextValue["t"] {
  return useLocale().t;
}
