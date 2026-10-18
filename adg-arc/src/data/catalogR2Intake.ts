// ADG-ARC TG046 Phase P1 — Catalog R2 candidate intake snapshot.
//
// DELIBERATELY UNIMPORTED. Nothing in this module may be imported by app
// code, used to build routes, or substituted for the runtime active roster
// at this gate (Prompt 046-02 v0.2, "Exact allowlisted writes" item 2). It
// is a typed, reviewable record of the 20-slot active identity/waypoint
// candidate for OPERATOR acceptance — not a schema migration and not a
// change to `cases.ts`'s `activeCases`.
//
// Slots 01-10 are the unchanged existing active roster (unchanged display
// order, unchanged slugs). Slots 11-20 are the proposed Catalog R2
// replacement for the current slots 11-20, carrying forward `walden-7` at
// slot 13 with its previously approved point (not the later R2 marker).
//
// `visitPoint` is a pedestrian waypoint manually positioned by OPERATOR —
// distinct from, and never a substitute for, a case's editorial/building
// `coordinates` in cases.ts. Never derived from LineString vertices, route
// snapping, geocoder centroids, or published street maps.

export type R2WaypointMarkerRole =
  | "from"
  | "via1"
  | "via2"
  | "via3"
  | "via4"
  | "via5"
  | "via6"
  | "via7"
  | "via8"
  | "approved"
  | "to";

export interface R2VisitPoint {
  longitude: number;
  latitude: number;
  marker: R2WaypointMarkerRole;
}

export interface R2CatalogIntakeRow {
  /** 1-20, exact proposed display order. */
  slot: number;
  slug: string;
  visitPoint: R2VisitPoint;
}

export const CATALOG_R2_INTAKE: readonly R2CatalogIntakeRow[] = [
  { slot: 1, slug: "casa-caracoles", visitPoint: { longitude: 2.156547009944916, latitude: 41.37538980139865, marker: "from" } },
  { slot: 2, slug: "casa-rodriguez-arias", visitPoint: { longitude: 2.1519899368286137, latitude: 41.39991210483874, marker: "via1" } },
  { slot: 3, slug: "casa-de-la-marina", visitPoint: { longitude: 2.1883719563811614, latitude: 41.37792561109461, marker: "via2" } },
  { slot: 4, slug: "cocheras-de-sarria", visitPoint: { longitude: 2.128332, latitude: 41.393446, marker: "approved" } },
  { slot: 5, slug: "hotel-arts", visitPoint: { longitude: 2.1966218948364262, latitude: 41.387144648803414, marker: "via3" } },
  { slot: 6, slug: "illa-diagonal", visitPoint: { longitude: 2.134550213813782, latitude: 41.389780718880026, marker: "via4" } },
  { slot: 7, slug: "dhub", visitPoint: { longitude: 2.1881455779566754, latitude: 41.40288873585012, marker: "via5" } },
  { slot: 8, slug: "la-borda", visitPoint: { longitude: 2.1348211169242863, latitude: 41.36958056152994, marker: "via6" } },
  { slot: 9, slug: "biblioteca-ggm", visitPoint: { longitude: 2.200092, latitude: 41.417011, marker: "approved" } },
  { slot: 10, slug: "green-use-22", visitPoint: { longitude: 2.209892, latitude: 41.411883, marker: "approved" } },
  { slot: 11, slug: "casa-fuster", visitPoint: { longitude: 2.1580678224563603, latitude: 41.39793838333298, marker: "from" } },
  { slot: 12, slug: "casa-lopez-sert", visitPoint: { longitude: 2.1440291404724126, latitude: 41.39833666544168, marker: "via1" } },
  { slot: 13, slug: "walden-7", visitPoint: { longitude: 2.068062, latitude: 41.379856, marker: "approved" } },
  { slot: 14, slug: "edifici-mediapro", visitPoint: { longitude: 2.1934869292999792, latitude: 41.40465794643973, marker: "via3" } },
  { slot: 15, slug: "habitatges-industrialitzats-marroc", visitPoint: { longitude: 2.2091692686080937, latitude: 41.41476422115247, marker: "via4" } },
  { slot: 16, slug: "habitatges-socials-824", visitPoint: { longitude: 1.9727459550313144, latitude: 41.45084388572231, marker: "via5" } },
  { slot: 17, slug: "escola-massana", visitPoint: { longitude: 2.1707198023796086, latitude: 41.38119787561866, marker: "via6" } },
  { slot: 18, slug: "la-escocesa-nau-foseco", visitPoint: { longitude: 2.2032941579573166, latitude: 41.41160520021903, marker: "via7" } },
  { slot: 19, slug: "vpo-torre-baro", visitPoint: { longitude: 2.1802845597267155, latitude: 41.45882940012756, marker: "via8" } },
  { slot: 20, slug: "illa-glories-bloc-a", visitPoint: { longitude: 2.1851297021157734, latitude: 41.40167573588224, marker: "to" } },
] as const;

/**
 * Nine existing historical identities displaced from the active-20 roster
 * by this candidate (full records, QR/stamp associations and prior route
 * evidence remain — archival-only, never deleted or reassigned).
 */
export const CATALOG_R2_NINE_DISPLACED_ARCHIVAL_SLUGS: readonly string[] = [
  "pavello-mies-van-der-rohe",
  "la-pedrera-casa-mila",
  "torre-de-collserola",
  "mercat-de-santa-caterina",
  "macba",
  "casa-planells",
  "media-tic",
  "casa-bloc",
  "edifici-telefonica",
] as const;

/**
 * Legacy P01 (MACBA -> Casa Planells) dev-pilot route. Metadata marker
 * only — this module never imports from, or writes to,
 * `src/dev-pilot/routePilotRegistry.ts`. P01 stays excluded from any
 * active/suggested route at this gate regardless of roster changes.
 */
export const CATALOG_R2_ROUTE_P01_STATUS = "ARCHIVAL_DEV_ONLY" as const;

/**
 * Provenance as stated by OPERATOR in Prompt 046-02 v0.2 / the TG046
 * handoff. Recorded verbatim for traceability; not independently
 * re-verified by this pass.
 */
export const CATALOG_R2_SOURCE_PROVENANCE = {
  legacyPointsSourceFile: "1-14 edificios ruta.geojson",
  legacyPointsSourceSha256:
    "ab7235144d5f4f6433bba7ace2be60ceee2236452a9b3e59f995aa02c1c226dd",
  r2PointsSourceFile: "11-20 r2 (92,3km).geojson",
  r2PointsSourceSha256:
    "56cda14cfb507eabe9e2653a42629a064c80dfb9e1246a4e471208265df48e49",
  walden7Note:
    "walden-7 retains its previously approved visitPoint (2.068062, 41.379856); " +
    "the R2 BRouter marker (2.0682068468101993, 41.37988186436228) is reference-only and was not adopted.",
} as const;
