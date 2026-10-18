// ADG-ARC TG046 Prompt 046-12 — Catalog R2 non-public product-shaped
// CaseRecord drafts.
//
// DELIBERATELY UNIMPORTED. Nothing in this module may be imported by
// `App.tsx`, `cases.ts`, `MapView.tsx`, or any other runtime/production
// module at this gate. No map/UI/roster behavior changes as a result of
// this file existing.
//
// This is the first pass to perform an actual *product-field* mapping from
// the nine R2 editorial candidates (`catalogR2ProductionCandidates.ts`'s
// `CATALOG_R2_PRODUCTION_CANDIDATES`) toward `cases.ts`'s real `CaseRecord`
// shape — not a re-export of the existing candidate/editorial modules
// unchanged. It is NOT nine finished, publishable CaseRecords: several
// required CaseRecord fields (`typography`, `correlation`, `infocard`,
// `coordinates`, `heroMedia`, `editorial`) cannot be honestly populated from
// the material gathered so far, for structural/evidentiary reasons recorded
// per-record in `blockedFields` below — never filled with an invented
// value, a value borrowed from another case, or a type assertion. No
// `as CaseRecord` and no `!` non-null assertion appears anywhere in this
// file. `CaseRecord.coordinates` (editorial/building identity) is never
// populated from `visitPoint` (pedestrian waypoint) — the two stay
// structurally distinct, exactly as `cases.ts` and every sibling R2 module
// already keep them.

import type { CaseRecord, CaseIdentity, CaseVisitPoint } from "./cases";
import {
  CATALOG_R2_PRODUCTION_CANDIDATES,
  type CatalogR2ProductionCandidate,
  type NotReadyForPublicCaseRecord,
} from "./catalogR2ProductionCandidates";
import type { CatalogR2EditorialDraftRecord } from "./catalogR2EditorialDraft";

/** Why `productFields` deliberately leaves one CaseRecord field unset, rather than inventing or borrowing a value for it. */
export interface BlockedFieldNote {
  readonly field: string;
  readonly reason: string;
}

/**
 * `CaseIdentity.date` is required by the real type; one of the nine
 * candidates (habitatges-socials-824) has an explicit, unreconciled date
 * conflict in its own editorial draft — so identity here is a genuine
 * partial, never the full product type.
 */
export type CatalogR2IdentityDraft = Partial<CaseIdentity>;

/**
 * The real `CaseRecord` shape, minus `identity`'s stricter nested
 * requirement. Every field present here is a genuine, honestly-populated
 * `CaseRecord` field, mapped under its real product name; every field
 * absent is either structurally blocked (see `blockedFields`) or not yet
 * fiche-verified (see `unresolved`) — never a placeholder/fallback value.
 */
export type CatalogR2ProductFieldsDraft = Partial<Omit<CaseRecord, "identity">> & {
  readonly identity?: CatalogR2IdentityDraft;
};

export interface CatalogR2CaseRecordDraft {
  readonly slot: number;
  readonly slug: string;
  /** Genuine CaseRecord-shaped fields this pass can honestly populate today. */
  readonly productFields: CatalogR2ProductFieldsDraft;
  /** The exact, unmodified source editorial record this draft was mapped from — carries the full CAT/ES `forma`/`descripcioWeb` text, source line locators, conflicts, uncertainties and sourceNotes. */
  readonly sourceDraft: CatalogR2EditorialDraftRecord;
  /** The exact OPERATOR-approved pedestrian waypoint for this slug (catalogR2Intake.ts via catalogR2ProductionCandidates.ts) — never copied into `productFields.coordinates`. */
  readonly visitPoint: CaseVisitPoint;
  readonly readiness: NotReadyForPublicCaseRecord;
  readonly blockedFields: readonly BlockedFieldNote[];
  readonly unresolved: readonly string[];
}

/**
 * Generic, non-slug-specific: extracts the most recent 4-digit year
 * literally present in an already fiche-verbatim date label (e.g.
 * "1908-1911" -> 1911, "2017 - 2022" -> 2022, "2008" -> 2008). Never invents
 * a year not already printed in the source string.
 */
function deriveMostRecentYear(dateLabelAsPrinted: string): number | null {
  const years = dateLabelAsPrinted.match(/\d{4}/g);
  if (!years || years.length === 0) return null;
  return Math.max(...years.map(Number));
}

function hasDateConflict(sourceDraft: CatalogR2EditorialDraftRecord): boolean {
  return sourceDraft.conflicts.some((conflict) => conflict.field === "date");
}

const TYPOGRAPHY_BLOCKED: BlockedFieldNote = {
  field: "typography",
  reason:
    "catalogR2EditorialDraft.ts's TYPOGRAPHY_PENDING: the editorial source " +
    "supplies no typeface name, designer, CARACTERS passage, or DIALEG " +
    "passage for any of the nine buildings. CaseTypography.primaryFamily " +
    "is a required, non-nullable string -- there is no honest value to " +
    "put there, so the field is left entirely unset rather than borrowed " +
    "from another case or invented.",
};

const CORRELATION_BLOCKED: BlockedFieldNote = {
  field: "correlation",
  reason:
    "CaseCorrelation.sourceRationale is the architecture<->typography " +
    "DIALEG passage -- the same missing content that blocks `typography` " +
    "above. There is no dialogue text to transcribe for any of the nine " +
    "buildings, so this required field is left unset.",
};

const INFOCARD_BLOCKED: BlockedFieldNote = {
  field: "infocard",
  reason:
    "InfocardContent requires `typographyCopy` and `dialogueCopy` " +
    "(non-optional), both DIALEG/CARACTERS-derived content this source " +
    "does not supply (see `typography`/`correlation` above). A partially " +
    "filled InfocardContent would misrepresent a required-field object as " +
    "complete, so the whole field is left unset. The CAT/ES " +
    "`forma`/`descripcioWeb` text that would otherwise seed " +
    "`architectureCopy`/`buildingProse` remains fully available, verbatim, " +
    "on `sourceDraft` for a future pass once the missing typography " +
    "content is sourced.",
};

const COORDINATES_BLOCKED: BlockedFieldNote = {
  field: "coordinates",
  reason:
    "CaseCoordinates is the editorial/building identity point, never the " +
    "pedestrian visitPoint captured in catalogR2Intake.ts -- no " +
    "independent building-coordinate evidence (map source, heritage " +
    "registry, etc.) has been gathered for any of these nine, so this " +
    "field is left unset rather than populated by copying `visitPoint`.",
};

const HERO_MEDIA_BLOCKED: BlockedFieldNote = {
  field: "heroMedia",
  reason:
    "No base/pass image is embedded, copied, or referenced by this module. " +
    "Per the TG046 handoff Section 3 and the 046-07/046-07B media audits, " +
    "four of the nine candidates are courtesy-only with no redistribution " +
    "grant, and the remaining five Commons-sourced candidates still need " +
    "adaptation-compliance / per-photo-identity verification before any " +
    "`CaseHeroMedia` object could be honestly constructed. See " +
    "`mediaRightsCandidate` in `unresolved` for the per-slug evidence " +
    "pointer (informational only, not a redistribution grant).",
};

const EDITORIAL_FLAG_BLOCKED: BlockedFieldNote = {
  field: "editorial",
  reason:
    "`CaseRecord.editorial` records a specific historical product decision " +
    "(ADGARC-DEC-001, the TG005 DhUB-style fuller-ficha flag) this gate has " +
    "no authority to assign for a new building; left unset rather than " +
    "guessed true or false.",
};

const IDENTITY_NAME_PROVENANCE_NOTE =
  "productFields.identity.name is the fiche header's own printed form " +
  "verbatim (header.nameAsPrinted) -- it may differ in spelling or locale " +
  "from sourceDraft.handoffDisplayName (the TG046 handoff/candidate working " +
  "label, which in some records also carries disambiguation commentary " +
  "rather than a clean display string). No final display-name decision has " +
  "been made by this gate.";

const ADDRESS_NOTE =
  "identity.address is intentionally left unset: none of the nine fiches " +
  "state a clean postal address in their FORMA/Descripcio WEB text; any " +
  "street number or municipality named in the TG046 handoff table is " +
  "handoff-sourced only, not fiche-verified -- see " +
  "sourceDraft.uncertainties/supplementalFacts for the specific per-record " +
  "claims.";

const MOVEMENT_STATUS_NOTE =
  "architecture.movementStatus is deliberately \"tbd\", not \"verified\": " +
  "the fiche header names a style/movement directly, but this nine-building " +
  "set has not been through the same editorial-finalization review that " +
  "lets the ten existing physical cases carry movementStatus \"verified\".";

const EXPERIENCE_TYPE_NOTE =
  "experienceType \"digital_only\" is inferred from the absence of any " +
  "physical-QR provisioning for these nine buildings (consistent with " +
  "every other non-physical-totem case in cases.ts) -- not yet an explicit " +
  "OPERATOR decision recorded for this specific set.";

/**
 * Candidate-level media-rights note, sourced verbatim from the 046-07 /
 * 046-07B media-provenance audits already recorded in this task's own
 * canonical report -- never a CaseHeroMedia object, never a usable image
 * path, never a redistribution grant.
 */
const MEDIA_RIGHTS_CANDIDATES: Readonly<Record<string, string>> = {
  "casa-fuster":
    "Commons candidate: Enfo, CC BY-SA 3.0 -- adaptation/credit implementation " +
    "and per-photo identity still pending (046-07). NOT_CLEARED_FOR_REDISTRIBUTION.",
  "casa-lopez-sert":
    "Commons candidate: Enric, CC BY-SA 4.0 -- local base-to-credited-photo " +
    "correspondence visually confirmed (046-07B); adaptation/credit " +
    "implementation still pending. NOT_CLEARED_FOR_REDISTRIBUTION.",
  "edifici-mediapro":
    "Commons candidate: Zarateman, CC0 1.0 -- source-to-local identity still " +
    "needs independent review (046-07). NOT_CLEARED_FOR_REDISTRIBUTION.",
  "habitatges-industrialitzats-marroc":
    "Courtesy-only: Constructora del Cardoner -- NO_REUSE_GRANT (046-07/046-07B).",
  "habitatges-socials-824":
    "Courtesy-only: H Arquitectes -- NO_REUSE_GRANT (046-07/046-07B).",
  "escola-massana":
    "Commons candidate: Enric, CC BY-SA 4.0 -- local base-to-credited-photo " +
    "correspondence visually confirmed (046-07B); adaptation/credit " +
    "implementation still pending. An independent building-photo " +
    "identity-mismatch risk was also flagged (046-07, new findings 1) and is " +
    "NOT resolved by this module. NOT_CLEARED_FOR_REDISTRIBUTION.",
  "la-escocesa-nau-foseco":
    "Commons candidate: Xavier Badia Castella, CC BY-SA 3.0 -- complex-level " +
    "identity supported, Nau Foseco sub-unit specificity still unverified " +
    "(046-07/046-07B). NOT_CLEARED_FOR_REDISTRIBUTION.",
  "vpo-torre-baro":
    "Courtesy-only: DATAAE -- NO_REUSE_GRANT (046-07/046-07B).",
  "illa-glories-bloc-a":
    "Courtesy-only: Cierto Estudio -- NO_REUSE_GRANT (046-07/046-07B).",
};

function buildIdentityDraft(
  candidate: CatalogR2ProductionCandidate,
): { identity: CatalogR2IdentityDraft; blockedFields: BlockedFieldNote[] } {
  const { editorial } = candidate;
  const blockedFields: BlockedFieldNote[] = [];
  const identity: CatalogR2IdentityDraft = {
    name: editorial.header.nameAsPrinted,
    architect: editorial.header.architectAsPrinted,
  };
  if (hasDateConflict(editorial)) {
    blockedFields.push({
      field: "identity.date",
      reason:
        "This candidate's editorial draft carries an explicit " +
        "UNRESOLVED_LISTED_EXPLICITLY conflict on \"date\" " +
        "(sourceDraft.conflicts) -- the fiche-printed " +
        `"${editorial.header.dateLabelAsPrinted}" has not been reconciled ` +
        "against the OPERATOR-supplied alternative. Left unset rather than " +
        "silently picking one value.",
    });
  } else {
    identity.date = {
      year: deriveMostRecentYear(editorial.header.dateLabelAsPrinted),
      displayLabel: editorial.header.dateLabelAsPrinted,
    };
  }
  return { identity, blockedFields };
}

function buildUnresolvedNotes(candidate: CatalogR2ProductionCandidate): string[] {
  const { editorial } = candidate;
  const notes: string[] = [
    IDENTITY_NAME_PROVENANCE_NOTE,
    ADDRESS_NOTE,
    MOVEMENT_STATUS_NOTE,
    EXPERIENCE_TYPE_NOTE,
    `mediaRightsCandidate (non-CaseRecord field, informational only): ${MEDIA_RIGHTS_CANDIDATES[candidate.slug]}`,
  ];
  for (const uncertainty of editorial.uncertainties) {
    notes.push(`sourceDraft.uncertainties: ${uncertainty}`);
  }
  for (const conflict of editorial.conflicts) {
    notes.push(
      `sourceDraft.conflicts["${conflict.field}"]: fiche="${conflict.ficheValue}" vs other="${conflict.otherValue}" (${conflict.otherValueProvenance}) -- ${conflict.status}.`,
    );
  }
  for (const sourceNote of editorial.sourceNotes) {
    notes.push(`sourceDraft.sourceNotes: ${sourceNote}`);
  }
  return notes;
}

function buildDraft(candidate: CatalogR2ProductionCandidate): CatalogR2CaseRecordDraft {
  const { identity, blockedFields: identityBlocked } = buildIdentityDraft(candidate);
  const blockedFields: BlockedFieldNote[] = [
    ...identityBlocked,
    TYPOGRAPHY_BLOCKED,
    CORRELATION_BLOCKED,
    INFOCARD_BLOCKED,
    COORDINATES_BLOCKED,
    HERO_MEDIA_BLOCKED,
    EDITORIAL_FLAG_BLOCKED,
  ];
  const productFields: CatalogR2ProductFieldsDraft = {
    slug: candidate.slug,
    identity,
    experienceType: "digital_only",
    architecture: {
      movement: candidate.editorial.header.styleAsPrinted,
      movementStatus: "tbd",
    },
    visitPoint: candidate.visitPoint,
  };
  return {
    slot: candidate.slot,
    slug: candidate.slug,
    productFields,
    sourceDraft: candidate.editorial,
    visitPoint: candidate.visitPoint,
    readiness: candidate.readiness,
    blockedFields,
    unresolved: buildUnresolvedNotes(candidate),
  };
}

function buildAllDrafts(): readonly CatalogR2CaseRecordDraft[] {
  const drafts = CATALOG_R2_PRODUCTION_CANDIDATES.map(buildDraft);
  const slugs = new Set(drafts.map((draft) => draft.slug));
  if (drafts.length !== 9 || slugs.size !== 9) {
    throw new Error(
      "ADG-ARC catalogR2CaseRecordDrafts: expected exactly 9 unique-slug " +
        `drafts, found ${drafts.length} (unique slugs: ${slugs.size})`,
    );
  }
  return drafts;
}

/**
 * The nine non-public, product-shaped CaseRecord drafts. Not nine finished
 * CaseRecords -- see each entry's `blockedFields`/`unresolved` for exactly
 * what is, and is not, honestly populated today.
 */
export const CATALOG_R2_CASE_RECORD_DRAFTS: readonly CatalogR2CaseRecordDraft[] = buildAllDrafts();

export function getCatalogR2CaseRecordDraftBySlug(
  slug: string,
): CatalogR2CaseRecordDraft | undefined {
  return CATALOG_R2_CASE_RECORD_DRAFTS.find((draft) => draft.slug === slug);
}
