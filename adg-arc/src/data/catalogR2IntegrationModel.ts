// ADG-ARC TG046 Prompt 046-04 — Catalog R2 isolated integration candidate
// model: joins the 20-slot visitPoint intake (catalogR2Intake.ts) with the
// nine-record bilingual editorial draft (catalogR2EditorialDraft.ts) into
// one inspectable, read-only candidate contract.
//
// DELIBERATELY UNIMPORTED. Nothing in this module may be imported by
// `App.tsx`, `cases.ts`, `MapView.tsx`, or any other runtime/production
// module at this gate. It is a preparation/candidate model for OPERATOR
// review — not a schema migration, not a change to `cases.ts`'s
// `CaseRecord`/`activeCases`, and not an activation of any R2 data.
//
// This module reads `CATALOG_R2_INTAKE` and `CATALOG_R2_EDITORIAL_DRAFT` as
// read-only source data only. It never re-derives, rounds, or re-hashes
// their values — every `visitPoint` below is the exact object reference
// from `catalogR2Intake.ts`'s own rows, and every joined editorial record is
// the exact object reference from `catalogR2EditorialDraft.ts`. It never
// imports or parses the source GeoJSON LineString as route geometry, and it
// never imports `src/dev-pilot/**`.
//
// `visitPoint` (pedestrian waypoint) stays a distinct field/type from
// `cases.ts`'s editorial/building `coordinates` — this module does not
// define, extend, or touch `CaseRecord`/`CaseCoordinates` in any way.

import {
  CATALOG_R2_INTAKE,
  CATALOG_R2_SOURCE_PROVENANCE,
  type R2VisitPoint,
} from "./catalogR2Intake";
import {
  CATALOG_R2_EDITORIAL_DRAFT,
  type CatalogR2EditorialDraftRecord,
} from "./catalogR2EditorialDraft";

/**
 * How a slot's identity relates to the existing published roster, derived
 * structurally (slot number + whether an editorial draft record exists for
 * that slug) — never a `slug === '...'` special case.
 *
 * - `existing_unchanged`: slots 1-10, the current active roster, untouched.
 * - `existing_record_reference`: a slot with no new editorial draft (today
 *   only slot 13, Walden 7) — an existing `CaseRecord` carried forward by
 *   reference, not a new/incomplete placeholder masquerading as one.
 * - `new_editorial_candidate`: a slot whose slug has a matching
 *   `CatalogR2EditorialDraftRecord` — the nine new R2 buildings.
 */
export type CatalogR2SlotKind =
  | "existing_unchanged"
  | "existing_record_reference"
  | "new_editorial_candidate";

export interface CatalogR2LocaleAvailability {
  readonly cat: boolean;
  readonly es: boolean;
}

/**
 * One slot of the 20-slot candidate contract: the exact intake visitPoint,
 * joined (by stable slug, never by ordinal) to its editorial draft when one
 * exists.
 */
export interface CatalogR2IntegrationSlot {
  readonly slot: number;
  readonly slug: string;
  readonly kind: CatalogR2SlotKind;
  /** Exact value from CATALOG_R2_INTAKE — evidence of a manually positioned
   * pedestrian waypoint, never a navigational instruction or route order. */
  readonly visitPoint: R2VisitPoint;
  /** Joined by slug for `new_editorial_candidate` slots only; `null` for
   * `existing_unchanged`/`existing_record_reference` slots, which are never
   * given a fabricated draft/editorial placeholder. */
  readonly editorial: CatalogR2EditorialDraftRecord | null;
  /** `null` when `editorial` is `null` — there is nothing to derive
   * availability from. */
  readonly localeAvailability: CatalogR2LocaleAvailability | null;
}

function isLocaleTextPresent(text: string): boolean {
  return typeof text === "string" && text.trim().length > 0;
}

/**
 * General availability rule: CAT (or ES) counts as available for a record
 * only when BOTH its FORMA and Descripció WEB text are actually populated
 * for that locale in the source draft. Deliberately generic — no
 * slug-specific branches, no silent CAT->ES relabeling, no activation of
 * any runtime locale. A locale with only one of the two fields populated is
 * treated as not yet available, since partial display copy is not display
 * copy.
 */
export function deriveLocaleAvailability(
  record: CatalogR2EditorialDraftRecord,
): CatalogR2LocaleAvailability {
  return {
    cat:
      isLocaleTextPresent(record.forma.cat) &&
      isLocaleTextPresent(record.descripcioWeb.cat),
    es:
      isLocaleTextPresent(record.forma.es) &&
      isLocaleTextPresent(record.descripcioWeb.es),
  };
}

const EDITORIAL_DRAFT_BY_SLUG: ReadonlyMap<string, CatalogR2EditorialDraftRecord> =
  new Map(CATALOG_R2_EDITORIAL_DRAFT.map((record) => [record.slug, record] as const));

function deriveSlotKind(
  slot: number,
  editorial: CatalogR2EditorialDraftRecord | null,
): CatalogR2SlotKind {
  if (editorial) return "new_editorial_candidate";
  return slot <= 10 ? "existing_unchanged" : "existing_record_reference";
}

/**
 * The 20-slot candidate contract. Built once, eagerly, as a pure
 * deterministic derivation of the two source arrays already exported by
 * `catalogR2Intake.ts`/`catalogR2EditorialDraft.ts` (same pattern those two
 * modules themselves use for their own top-level consts) — this is data
 * derivation, not a runtime side effect, and it mutates nothing.
 */
export const CATALOG_R2_INTEGRATION_MODEL: readonly CatalogR2IntegrationSlot[] =
  CATALOG_R2_INTAKE.map((row) => {
    const editorial = EDITORIAL_DRAFT_BY_SLUG.get(row.slug) ?? null;
    const slot: CatalogR2IntegrationSlot = {
      slot: row.slot,
      slug: row.slug,
      kind: deriveSlotKind(row.slot, editorial),
      visitPoint: row.visitPoint,
      editorial,
      localeAvailability: editorial ? deriveLocaleAvailability(editorial) : null,
    };
    return slot;
  });

/**
 * Provenance/authority metadata for the visitPoint half of this candidate
 * model — neutral, non-executable, carried forward from
 * `catalogR2Intake.ts`'s own `CATALOG_R2_SOURCE_PROVENANCE` plus one
 * explicitly-scoped OPERATOR decision record (never a marker-derived
 * approval split — `visitPoint.marker` is only the original source GeoJSON
 * waypoint role, not a quality/verification/rights/approval signal). Walden
 * 7's previously-approved point remains canonical per `walden7Note` below,
 * copied verbatim — not independently re-verified by this pass.
 */
export const CATALOG_R2_INTEGRATION_PROVENANCE = {
  ...CATALOG_R2_SOURCE_PROVENANCE,
  capturedPointCount: CATALOG_R2_INTAKE.length,
  operatorDecision: {
    status: "ACCEPTED_FOR_CATALOG_R2_SNAPSHOT",
    date: "2026-10-12",
    scope: "current-20-manually-placed-visitpoints-only",
    requiresNewReviewIfSnapshotChanges: true,
  },
  note:
    "`capturedPointCount` is simply the number of manually positioned " +
    "waypoints in CATALOG_R2_INTAKE's current snapshot (20) — not an " +
    "approval tally. `operatorDecision` records the OPERATOR's explicit " +
    "acceptance of this current 20-point snapshot only, dated 2026-10-12 " +
    "— not a blanket acceptance of any future/changed intake, not a " +
    "walkable-route or GPS-arrival claim, not QR/stamp proof, and not " +
    "production activation. `visitPoint.marker` (defined in " +
    "catalogR2Intake.ts) remains only the original source GeoJSON " +
    "waypoint role (`from`/`viaN`/`to`/`approved`) and is never read as an " +
    "approval/quality/rights signal by this module.",
} as const;

/**
 * Typography availability is never fabricated here: this model does not
 * invent a typeface/designer/dialogue pairing for the nine new records. It
 * only exposes, generically, whether a given editorial draft record's
 * `typography` field is the explicit pending marker — true for all nine
 * today, since `catalogR2EditorialDraft.ts` itself has no typography source
 * for any of them yet.
 */
export function isTypographyPending(
  record: CatalogR2EditorialDraftRecord,
): boolean {
  return record.typography.status === "PENDING_NOT_IN_SOURCE";
}

export interface CatalogR2StaticCheckResult {
  readonly totalSlots: number;
  readonly expectedTotalSlots: 20;
  readonly totalSlotsOk: boolean;
  readonly newEditorialCandidateCount: number;
  readonly expectedNewEditorialCandidateCount: 9;
  readonly newEditorialCandidateCountOk: boolean;
  readonly slugsUnique: boolean;
  readonly duplicateSlugs: readonly string[];
  readonly everyNewCandidateHasEditorial: boolean;
  readonly unjoinedNewCandidateSlugs: readonly string[];
  readonly orphanEditorialSlugs: readonly string[];
  readonly pendingTypographyCount: number;
}

/**
 * Pure, side-effect-free static check. NOT executed at module import time
 * and NOT run by this pass (NO_RUNTIME — no npm/test/build/tsc was invoked
 * to produce these numbers; they are only computable, not computed, until
 * something explicitly calls this function). Intended for OPERATOR's own
 * independent QA or a future test harness to call and inspect. This is a
 * reflection of expected 20-slot / 9-new-draft / unique-slug / one-to-one
 * join properties as checkable data, not a claim that any dynamic check has
 * already run.
 */
export function computeCatalogR2StaticCheck(): CatalogR2StaticCheckResult {
  const slugCounts = new Map<string, number>();
  for (const { slug } of CATALOG_R2_INTEGRATION_MODEL) {
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  }
  const duplicateSlugs = [...slugCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug);

  const newCandidates = CATALOG_R2_INTEGRATION_MODEL.filter(
    (candidateSlot) => candidateSlot.kind === "new_editorial_candidate",
  );
  const unjoinedNewCandidateSlugs = newCandidates
    .filter((candidateSlot) => candidateSlot.editorial === null)
    .map((candidateSlot) => candidateSlot.slug);

  const newCandidateSlugSet = new Set(newCandidates.map((candidateSlot) => candidateSlot.slug));
  const orphanEditorialSlugs = CATALOG_R2_EDITORIAL_DRAFT.map(
    (record) => record.slug,
  ).filter((slug) => !newCandidateSlugSet.has(slug));

  const pendingTypographyCount = newCandidates.filter(
    (candidateSlot) => candidateSlot.editorial !== null && isTypographyPending(candidateSlot.editorial),
  ).length;

  return {
    totalSlots: CATALOG_R2_INTEGRATION_MODEL.length,
    expectedTotalSlots: 20,
    totalSlotsOk: CATALOG_R2_INTEGRATION_MODEL.length === 20,
    newEditorialCandidateCount: newCandidates.length,
    expectedNewEditorialCandidateCount: 9,
    newEditorialCandidateCountOk: newCandidates.length === 9,
    slugsUnique: duplicateSlugs.length === 0,
    duplicateSlugs,
    everyNewCandidateHasEditorial: unjoinedNewCandidateSlugs.length === 0,
    unjoinedNewCandidateSlugs,
    orphanEditorialSlugs,
    pendingTypographyCount,
  };
}
