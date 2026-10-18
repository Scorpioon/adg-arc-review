// ADG-ARC TG046 Prompt 046-11 — approved pedestrian visitPoint production map.
//
// Single, minimal-import production source for MapView.tsx's existing
// `visitPointOverrides` seam (see toFeatureCollection in MapView.tsx).
// Derives directly from catalogR2Intake.ts's `CATALOG_R2_INTAKE` — the
// OPERATOR-accepted 20-point manually-placed pedestrian waypoint snapshot
// (acceptance scope: this exact snapshot only, 2026-10-12/13; see
// catalogR2IntegrationModel.ts's `CATALOG_R2_INTEGRATION_PROVENANCE` for the
// full decision record). Deliberately does NOT import
// catalogR2IntegrationModel.ts or catalogR2ProductionCandidates.ts, which
// both transitively pull in catalogR2EditorialDraft.ts's nine bilingual
// editorial drafts — unrelated runtime weight this map has no need for and
// must not introduce into MapView's bundle.
//
// `marker` (R2WaypointMarkerRole) is dropped — it is a GeoJSON waypoint-role
// label describing a point's position in the original source route line
// (start/intermediate/end), never an approval, quality, or routing signal
// (see catalogR2Intake.ts's own doc comment and Prompt 046-04a's semantic
// fix in the TG046 report). Only longitude/latitude survive into this map.
//
// This is a pedestrian waypoint for map marker placement only — distinct
// from, and never a substitute for, a case's editorial/building
// `coordinates` in cases.ts. It confers no route, GPS, proximity, or QR/
// Passport-stamp authority; see cases.ts's `CaseVisitPoint` doc comment.

import { CATALOG_R2_INTAKE } from "./catalogR2Intake";

function buildApprovedVisitPoints(): ReadonlyMap<string, [number, number]> {
  const map = new Map<string, [number, number]>();
  for (const row of CATALOG_R2_INTAKE) {
    if (map.has(row.slug)) {
      throw new Error(
        `ADG-ARC catalogR2ApprovedVisitPoints: duplicate slug "${row.slug}" in CATALOG_R2_INTAKE`
      );
    }
    map.set(row.slug, [row.visitPoint.longitude, row.visitPoint.latitude]);
  }
  if (map.size !== 20) {
    throw new Error(
      `ADG-ARC catalogR2ApprovedVisitPoints: expected 20 approved visitPoints, found ${map.size}`
    );
  }
  return map;
}

/**
 * Approved pedestrian visitPoints, keyed by slug, longitude/latitude only
 * (no rounding, no re-derivation — values are copied verbatim from
 * `CATALOG_R2_INTAKE`). Covers all 20 accepted slots: the 10 unchanged
 * existing slugs, `walden-7`, and the 9 new Catalog R2 candidate slugs (the
 * latter have no matching `CaseRecord` in cases.ts yet, so they are inert
 * until separately authorized — a slug with no corresponding case simply
 * never appears in MapView's rendered feature set).
 */
export const CATALOG_R2_APPROVED_VISITPOINTS_BY_SLUG: ReadonlyMap<string, [number, number]> =
  buildApprovedVisitPoints();
