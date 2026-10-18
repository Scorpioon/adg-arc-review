// ADG-ARC TG046 Prompt 046-05 — Catalog R2 production-schema candidate
// adapter.
//
// DELIBERATELY NON-RUNTIME-IMPORTED. Nothing in this module may be imported
// by `App.tsx`, `cases.ts`, `MapView.tsx`, or any other runtime/production
// module at this gate. It derives its entire output from the existing,
// already-unimported `CATALOG_R2_INTEGRATION_MODEL`
// (catalogR2IntegrationModel.ts) — itself a pure join of
// catalogR2Intake.ts's 20 visitPoints and catalogR2EditorialDraft.ts's nine
// bilingual editorial drafts — and re-literalizes no coordinate pair or
// bilingual prose. It is a typed reference/projection for OPERATOR review of
// what a future production `visitPoint`/`CaseRecord` consumption could look
// like — NOT a schema migration, NOT an edit to `cases.ts`'s 31 existing
// records, `HIDDEN_CASE_SLUGS`, or `activeCases`, and NOT publication of any
// of the nine R2 buildings as finished `CaseRecord`s (typeface/dialogue
// provenance, independent source comparison, and media rights all remain
// pending — see `CATALOG_R2_CANDIDATE_READINESS` below).
//
// `cases.ts`'s `CaseVisitPoint` is referenced here only as a type (no
// runtime import from `cases.ts`), to demonstrate structural compatibility
// with the newly optional `CaseRecord.visitPoint` field — this module never
// constructs, mutates, or asserts against an actual `CaseRecord`.

import {
  CATALOG_R2_INTEGRATION_MODEL,
  type CatalogR2LocaleAvailability,
} from "./catalogR2IntegrationModel";
import type { R2VisitPoint } from "./catalogR2Intake";
import type { CatalogR2EditorialDraftRecord } from "./catalogR2EditorialDraft";
import type { CaseVisitPoint } from "./cases";

/**
 * Read-only by-slug projection of all 20 candidate visitPoints — the exact
 * `R2VisitPoint` object reference from `CATALOG_R2_INTAKE` (via
 * `CATALOG_R2_INTEGRATION_MODEL`), never copied, rounded, or re-derived. No
 * route geometry, no navigation ordering, no GeoJSON LineString is read or
 * represented here.
 */
export const CATALOG_R2_VISITPOINTS_BY_SLUG: ReadonlyMap<string, R2VisitPoint> =
  new Map(CATALOG_R2_INTEGRATION_MODEL.map((slot) => [slot.slug, slot.visitPoint] as const));

/**
 * The same 20 visitPoints, reshaped to the exact structural shape of the
 * newly optional `CaseRecord.visitPoint` field (`cases.ts`'s
 * `CaseVisitPoint`: longitude + latitude only). `marker` is deliberately
 * dropped — it is `catalogR2Intake.ts`'s source GeoJSON waypoint-role label
 * (`R2WaypointMarkerRole`), never a production field, quality signal, or
 * route/approval instruction. This is a type-compatibility demonstration
 * only, not a production assignment or activation.
 */
export const CATALOG_R2_PRODUCTION_SHAPED_VISITPOINTS_BY_SLUG: ReadonlyMap<string, CaseVisitPoint> =
  new Map(
    [...CATALOG_R2_VISITPOINTS_BY_SLUG.entries()].map(([slug, point]) => [
      slug,
      { longitude: point.longitude, latitude: point.latitude },
    ] as const),
  );

/**
 * Explicit, typed readiness marker for the nine new editorial candidates —
 * structurally distinct from `CaseRecord` (no `identity`/`architecture`/
 * `heroMedia`/etc.), so a value of this type can never be mistaken for, or
 * substituted as, a finished `CaseRecord`. The same three structural reasons
 * apply uniformly to all nine today — never a per-slug switch statement.
 */
export interface NotReadyForPublicCaseRecord {
  readonly status: "NOT_READY_FOR_PUBLIC_CASE_RECORD";
  readonly reasons: readonly string[];
}

export const CATALOG_R2_CANDIDATE_READINESS: NotReadyForPublicCaseRecord = {
  status: "NOT_READY_FOR_PUBLIC_CASE_RECORD",
  reasons: [
    "typeface/designer/CARÀCTERS/DIÀLEG provenance absent from the editorial source for all nine (catalogR2EditorialDraft.ts's TYPOGRAPHY_PENDING on every record)",
    "editorial text not yet independently source-compared against the original fiche/GeoJSON evidence (SOURCE_COMPARISON=PENDING per the TG046 handoff and prior report sections)",
    "media rights unresolved for 4 of 9 buildings (courtesy-only, no redistribution right) and base/pass image selection pending for all nine (TG046 handoff §3)",
  ],
} as const;

/**
 * One non-public editorial candidate: a slug plus direct references into the
 * existing integration-model slot's visitPoint and editorial text, never a
 * copy of either.
 */
export interface CatalogR2ProductionCandidate {
  readonly slot: number;
  readonly slug: string;
  readonly visitPoint: CaseVisitPoint;
  readonly editorial: CatalogR2EditorialDraftRecord;
  readonly localeAvailability: CatalogR2LocaleAvailability;
  readonly readiness: NotReadyForPublicCaseRecord;
}

/**
 * Exactly the nine `new_editorial_candidate` slots (11, 12, 14-20) — derived
 * structurally from `CATALOG_R2_INTEGRATION_MODEL`'s own `kind`
 * discriminant, never a hardcoded slug list.
 */
export const CATALOG_R2_PRODUCTION_CANDIDATES: readonly CatalogR2ProductionCandidate[] =
  CATALOG_R2_INTEGRATION_MODEL.reduce<CatalogR2ProductionCandidate[]>((candidates, slot) => {
    if (slot.kind !== "new_editorial_candidate" || slot.editorial === null) {
      return candidates;
    }
    const productionVisitPoint = CATALOG_R2_PRODUCTION_SHAPED_VISITPOINTS_BY_SLUG.get(slot.slug);
    if (!productionVisitPoint) {
      return candidates;
    }
    if (slot.localeAvailability === null) {
      throw new Error(
        `CATALOG_R2_INTEGRATION_MODEL slot "${slot.slug}" is a new_editorial_candidate with ` +
          "non-null editorial but null localeAvailability, which the integration model should " +
          "never produce together — refusing to silently drop this expected candidate.",
      );
    }
    candidates.push({
      slot: slot.slot,
      slug: slot.slug,
      visitPoint: productionVisitPoint,
      editorial: slot.editorial,
      localeAvailability: slot.localeAvailability,
      readiness: CATALOG_R2_CANDIDATE_READINESS,
    });
    return candidates;
  }, []);

/**
 * Data-driven identity lookup — pure, zero global mutation, not asserted at
 * import time.
 */
export function getCatalogR2ProductionCandidateBySlug(
  slug: string,
): CatalogR2ProductionCandidate | undefined {
  return CATALOG_R2_PRODUCTION_CANDIDATES.find((candidate) => candidate.slug === slug);
}

export interface CatalogR2ProductionCandidatesStaticCheck {
  readonly totalVisitPoints: number;
  readonly expectedTotalVisitPoints: 20;
  readonly totalVisitPointsOk: boolean;
  readonly candidateCount: number;
  readonly expectedCandidateCount: 9;
  readonly candidateCountOk: boolean;
  readonly allCandidatesNotReady: boolean;
}

/**
 * Pure, side-effect-free static check. NOT executed at module import time
 * and NOT run by this pass (NO_RUNTIME — no npm/test/build/tsc was invoked
 * to produce these numbers; they are only computable, not computed, until
 * something explicitly calls this function). Intended for OPERATOR's own
 * independent QA or a future test harness.
 */
export function computeCatalogR2ProductionCandidatesStaticCheck(): CatalogR2ProductionCandidatesStaticCheck {
  return {
    totalVisitPoints: CATALOG_R2_VISITPOINTS_BY_SLUG.size,
    expectedTotalVisitPoints: 20,
    totalVisitPointsOk: CATALOG_R2_VISITPOINTS_BY_SLUG.size === 20,
    candidateCount: CATALOG_R2_PRODUCTION_CANDIDATES.length,
    expectedCandidateCount: 9,
    candidateCountOk: CATALOG_R2_PRODUCTION_CANDIDATES.length === 9,
    allCandidatesNotReady: CATALOG_R2_PRODUCTION_CANDIDATES.every(
      (candidate) => candidate.readiness.status === "NOT_READY_FOR_PUBLIC_CASE_RECORD",
    ),
  };
}
