// ADG-ARC TG045 / FB-113 — Gate B1 local-only pilot registry.
//
// LOCAL DEVELOPMENT ONLY. This module (and everything under
// src/dev-pilot/) exists solely to prove a narrow, OPERATOR-approved
// prototype: a real, verified, street-following pedestrian line between
// exactly four directed building pairs, drawn in MapLibre when a visitor
// manually picks an origin and a destination. It is reached exclusively
// through a `import.meta.env.DEV`-gated dynamic import (see App.tsx) so a
// normal production build never evaluates or bundles it — see that call
// site's comment for why this is the actual exclusion mechanism, not merely
// a hidden UI affordance.
//
// Authority chain (do not relax without a new OPERATOR gate):
// - _wrkops/handoffs/adg_arc_tg045_fb113_street_following_typographic_route.gate_b1.local_pilot_prototype.md
// - _wrkops/handoffs/..._route.gate_a2.manual_origin_no_gps_constraints.md
// - work_materials/product_intelligence/source_packs/ADGARC_TG045_FB113_PILOT0{1,2,3}_*/manifest.json
//
// Raw exports are copied byte-for-byte from the OPERATOR-reviewed source
// packs (see sources/ in this folder) — never edited, never hand-authored.
// Each copy's sha256 is independently verified against the pack's own
// manifest below (Gate B1 preflight). Distance/duration shown to the
// visitor are read directly from each export's own BRouter `track-length`/
// `total-time` properties, not re-typed as literals here, so this registry
// can never silently drift from its source.
import macbaToCasaPlanellsRaw from "./sources/ADGARC_MACBA_CASA_PLANELLS_RAW_20261009.geojson?raw";
import walden7ToCocheresRaw from "./sources/ADGARC_WALDEN7_COTXERES_SARRIA_RAW_20261009.geojson?raw";
import bibliotecaToGreenUseRaw from "./sources/ADGARC_BIBLIOTECA_GGM_TO_GREEN_USE_22_RAW_20261009.geojson?raw";
import greenUseToBibliotecaRaw from "./sources/ADGARC_GREEN_USE_22_TO_BIBLIOTECA_GGM_RAW_20261009.geojson?raw";

export type RoutePilotId = "P01" | "P02" | "P03";

export interface RoutePilotDirection {
  pilotId: RoutePilotId;
  fromSlug: string;
  toSlug: string;
  distanceM: number;
  durationS: number;
  sourceFile: string;
  sourceSha256: string;
  feature: GeoJSON.Feature<GeoJSON.LineString>;
}

interface BrouterFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: { type: string; coordinates: unknown };
  }>;
}

// Parses one immutable BRouter raw export. Never fabricates a geometry or a
// distance/time — if the single expected LineString feature is absent or
// malformed, this throws rather than silently falling back to a straight
// line (FB-113's hard "no fabricated paths" rule applies to this prototype
// too).
function parseDirection(args: {
  pilotId: RoutePilotId;
  fromSlug: string;
  toSlug: string;
  raw: string;
  sourceFile: string;
  sourceSha256: string;
}): RoutePilotDirection {
  const parsed = JSON.parse(args.raw) as BrouterFeatureCollection;
  const feature = parsed.features[0];
  if (!feature || feature.geometry.type !== "LineString") {
    throw new Error(`ADG-ARC dev pilot: malformed/missing LineString in ${args.sourceFile}`);
  }

  const distanceM = Number(feature.properties["track-length"]);
  const durationS = Number(feature.properties["total-time"]);
  if (!Number.isFinite(distanceM) || !Number.isFinite(durationS)) {
    throw new Error(`ADG-ARC dev pilot: ${args.sourceFile} is missing track-length/total-time`);
  }

  return {
    pilotId: args.pilotId,
    fromSlug: args.fromSlug,
    toSlug: args.toSlug,
    distanceM,
    durationS,
    sourceFile: args.sourceFile,
    sourceSha256: args.sourceSha256,
    feature: {
      type: "Feature",
      properties: { pilotId: args.pilotId, fromSlug: args.fromSlug, toSlug: args.toSlug },
      // `feature.geometry`'s declared type here (`{ type: string;
      // coordinates: unknown }`) is not structurally comparable to
      // `GeoJSON.LineString` (TS2352, the same pattern MapView.tsx's
      // `mapTuple3` comment documents) — routing through `unknown` first is
      // correct, not a safety shortcut, since the `geometry.type ===
      // "LineString"` check above already proves this at runtime.
      geometry: feature.geometry as unknown as GeoJSON.LineString,
    },
  };
}

// Exactly four directed exports, three pairs — the only routes the Gate B1
// addendum authorizes. P01/P02 reverse directions are intentionally absent
// (not "not yet added") — do not infer or construct them from the forward
// geometry. sourceSha256 values are the raw file hashes recorded in each
// pack's manifest.json, independently re-verified against the copies under
// ./sources/ during this Gate B1 session.
export const ROUTE_PILOT_DIRECTIONS: RoutePilotDirection[] = [
  parseDirection({
    pilotId: "P01",
    fromSlug: "macba",
    toSlug: "casa-planells",
    raw: macbaToCasaPlanellsRaw,
    sourceFile: "ADGARC_MACBA_CASA_PLANELLS_RAW_20261009.geojson",
    sourceSha256: "b77b44c7fe8fc0a11ebc2c956a30573d029a0c07e6210f3e8e44af51b083c49a",
  }),
  parseDirection({
    pilotId: "P02",
    fromSlug: "walden-7",
    toSlug: "cocheras-de-sarria",
    raw: walden7ToCocheresRaw,
    sourceFile: "ADGARC_WALDEN7_COTXERES_SARRIA_RAW_20261009.geojson",
    sourceSha256: "2e98033a3256fff7fc46436412f92423351444b6055d85b557dd6db828b04b16",
  }),
  parseDirection({
    pilotId: "P03",
    fromSlug: "biblioteca-ggm",
    toSlug: "green-use-22",
    raw: bibliotecaToGreenUseRaw,
    sourceFile: "ADGARC_BIBLIOTECA_GGM_TO_GREEN_USE_22_RAW_20261009.geojson",
    sourceSha256: "899b6c859bcf9323d8ed3f11a6352b74318eb1a6aecec5acb32cf74114a26504",
  }),
  parseDirection({
    pilotId: "P03",
    fromSlug: "green-use-22",
    toSlug: "biblioteca-ggm",
    raw: greenUseToBibliotecaRaw,
    sourceFile: "ADGARC_GREEN_USE_22_TO_BIBLIOTECA_GGM_RAW_20261009.geojson",
    sourceSha256: "fdedfba36b52cdf7e4dcca0ec04d246909f0fcf9fb256c7fb66ae3d8e58d0666",
  }),
];

// Identical origin/destination is never "available" — callers must treat a
// null result as the single unavailable state, never a fallback line.
export function findRoutePilotDirection(fromSlug: string, toSlug: string): RoutePilotDirection | null {
  if (!fromSlug || !toSlug || fromSlug === toSlug) return null;
  return ROUTE_PILOT_DIRECTIONS.find((d) => d.fromSlug === fromSlug && d.toSlug === toSlug) ?? null;
}

// Mirrors cases.ts's `green-use-22` CoordinateStatus ("provisional_external_
// street") — any pilot route touching this endpoint must not be shown as
// more precise than the point itself already claims (Gate B1 addendum §2/§3
// and the Gate A report's §2 constraint, carried forward unchanged here).
export const PROVISIONAL_ENDPOINT_SLUGS: ReadonlySet<string> = new Set(["green-use-22"]);

// Prompt 096 (Gate B1 marker/visitPoint alignment) — derives each of the six
// pilot cases' DEV-only marker preview position directly from the first/last
// vertex of its already-hash-verified directed route feature above. This is
// not a second, independently-authored coordinate table: every value here
// traces back to one of the four `ROUTE_PILOT_DIRECTIONS` entries, which are
// themselves byte-for-byte copies of OPERATOR-approved, hash-verified raw
// exports (see this file's own header). P03's reverse direction
// (`green-use-22` → `biblioteca-ggm`) is intentionally skipped: Prompt 096's
// approved mapping uses only the forward direction's endpoints as the shared
// anchor for both `biblioteca-ggm` and `green-use-22`, since the reverse
// export's own endpoints differ by a few metres (an OPERATOR-disclosed
// reverse-export discrepancy, not a second source of truth).
export const ROUTE_PILOT_VISIT_POINTS: ReadonlyMap<string, [number, number]> = (() => {
  const map = new Map<string, [number, number]>();
  for (const direction of ROUTE_PILOT_DIRECTIONS) {
    if (direction.pilotId === "P03" && direction.fromSlug === "green-use-22") continue;
    const coords = direction.feature.geometry.coordinates;
    const first = coords[0];
    const last = coords[coords.length - 1];
    map.set(direction.fromSlug, [first[0], first[1]]);
    map.set(direction.toSlug, [last[0], last[1]]);
  }
  return map;
})();
