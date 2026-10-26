// MTG01 TG063 IMP-02A — additive locale resolver (report §10.3/§10.4 R2-2).
// Currently unconsumed: no component imports this yet (that swap is R2-3,
// separately authorized). Because the overlay it reads is empty, this hook
// changes nothing about today's rendered output.
import { useMemo } from "react";
import type { CaseRecord } from "../data/cases";
import { caseEditorialTranslations, type CaseEditorialLocale, type CaseEditorialTranslation } from "../data/caseEditorialTranslations";
import { useLocale } from "../i18n/context";

function isEditorialLocale(code: string): code is CaseEditorialLocale {
  return code === "es" || code === "en";
}

// Exported for later OPERATOR-owned testing (prompt §3) — kept in this file
// rather than a third helper module. Returns the exact same `record`
// reference whenever no field actually changes, so an empty/partial overlay
// never forces a new object identity on callers.
export function resolveLocalizedCase(
  record: CaseRecord,
  locale: CaseEditorialLocale | "ca"
): CaseRecord {
  if (locale === "ca") return record;

  const translation: CaseEditorialTranslation | undefined =
    caseEditorialTranslations[record.slug]?.[locale];
  if (!translation) return record;

  const buildingProse =
    translation.buildingProse !== undefined
      ? { ...record.infocard.buildingProse, displayText: translation.buildingProse }
      : record.infocard.buildingProse;

  const architectureCopy =
    translation.architectureCopy !== undefined
      ? { ...record.infocard.architectureCopy, displayText: translation.architectureCopy }
      : record.infocard.architectureCopy;

  const typographyCopy =
    translation.typographyCopy !== undefined
      ? { ...record.infocard.typographyCopy, displayText: translation.typographyCopy }
      : record.infocard.typographyCopy;

  const dialogueCopy =
    translation.dialogueCopy !== undefined
      ? { ...record.infocard.dialogueCopy, displayText: translation.dialogueCopy }
      : record.infocard.dialogueCopy;

  const highlightedPhrase =
    record.infocard.highlightedPhrase && translation.highlightedPhrase !== undefined
      ? { ...record.infocard.highlightedPhrase, displayText: translation.highlightedPhrase }
      : record.infocard.highlightedPhrase;

  const typographyHighlightedPhrase =
    record.infocard.typographyHighlightedPhrase && translation.typographyHighlightedPhrase !== undefined
      ? {
          ...record.infocard.typographyHighlightedPhrase,
          displayText: translation.typographyHighlightedPhrase,
        }
      : record.infocard.typographyHighlightedPhrase;

  const heroMedia =
    record.heroMedia && translation.heroMediaAlt !== undefined
      ? { ...record.heroMedia, alt: translation.heroMediaAlt }
      : record.heroMedia;

  const infocardChanged =
    buildingProse !== record.infocard.buildingProse ||
    architectureCopy !== record.infocard.architectureCopy ||
    typographyCopy !== record.infocard.typographyCopy ||
    dialogueCopy !== record.infocard.dialogueCopy ||
    highlightedPhrase !== record.infocard.highlightedPhrase ||
    typographyHighlightedPhrase !== record.infocard.typographyHighlightedPhrase;

  if (!infocardChanged && heroMedia === record.heroMedia) return record;

  return {
    ...record,
    infocard: infocardChanged
      ? {
          ...record.infocard,
          buildingProse,
          architectureCopy,
          typographyCopy,
          dialogueCopy,
          highlightedPhrase,
          typographyHighlightedPhrase,
        }
      : record.infocard,
    heroMedia,
  };
}

// `ca` (disabled) and `en` (disabled) are read, never activated, here —
// activation stays `locales.ts`'s sole authority (R2-6, not this phase).
export function useLocalizedCase(record: CaseRecord): CaseRecord {
  const { locale } = useLocale();

  return useMemo(() => {
    if (!isEditorialLocale(locale)) return record;
    return resolveLocalizedCase(record, locale);
  }, [record, locale]);
}
