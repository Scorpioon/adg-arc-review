// TG006F — single-source semantic map Level-of-Detail (LOD) registry.
// Mirrors config/mapPaint.ts's shape/conventions deliberately: a stable
// semantic role id + human-readable label + canonical default, validated
// independently of MapView, with a classifier boundary kept in MapView.tsx
// (classifySemanticLodRoles) between "ADG-ARC semantic LOD role" and "actual
// upstream Liberty layer id(s)" — never exposing raw Liberty ids as the
// product-facing model (handoff Scope A).
//
// Zoom bands are semantic guidance, not a hard-coded product decision: the
// three canonical thresholds below were chosen from the *current* upstream
// Liberty style's own already-baked-in zoom behavior (inspected directly
// from the fetched style JSON, not guessed) —
//   - `building` (2D fill) layer: minzoom 13 / maxzoom 14 (upstream).
//   - `building-3d` (extrusion) layer: minzoom 14 (upstream).
//   - `road_minor` line-width interpolates from ~0 to visible over 13.5-14.
//   - `road_minor_casing` line-opacity interpolates 0->1 over 12-12.5.
//   - `highway-name-major` label minzoom 12.2; `highway-name-minor` minzoom
//     15; `highway-name-path` minzoom 15.5.
//   - `road_motorway` (major) has no minzoom floor above 5 — always present.
// A DISTRICT floor of 13 and a BUILDING floor of 15 sits cleanly on top of
// that existing upstream hierarchy (buildings/minor-road width finish
// resolving inside DISTRICT; minor/path labels turn on exactly at/just past
// the BUILDING floor) rather than fighting it — see the paired report for
// the full inventory this was derived from. HOME_ZOOM (11.2, MapView.tsx)
// and every case focus zoom (15.5-17, data/cases.ts) land inside CITY and
// BUILDING respectively, confirming the bands match actual product usage.
// Both thresholds remain editable in Developer Tools per handoff Scope C.

export type LodBand = "CITY" | "DISTRICT" | "BUILDING";

export interface ZoomBandThresholds {
  // Zoom at/above which the band is DISTRICT rather than CITY.
  districtMin: number;
  // Zoom at/above which the band is BUILDING rather than DISTRICT.
  buildingMin: number;
}

// Derived from actual current product configuration (MapView.tsx MIN_ZOOM/
// MAX_ZOOM/HOME_ZOOM) plus the upstream-style inventory documented above —
// not predetermined by the prompt/handoff, per handoff Scope B.
export const CANONICAL_ZOOM_THRESHOLDS: ZoomBandThresholds = {
  districtMin: 13,
  buildingMin: 15,
};

export function deriveBand(zoom: number, thresholds: ZoomBandThresholds): LodBand {
  if (zoom >= thresholds.buildingMin) return "BUILDING";
  if (zoom >= thresholds.districtMin) return "DISTRICT";
  return "CITY";
}

// Every semantic map role TG006F actively models. Roads are split into
// major/minor/casing/labels (four distinct roles, matching the handoff's
// minimum list exactly) rather than reusing the paint registry's coarser
// map.road.fill split. Buildings are one role (`buildings.fill`) covering
// both the upstream 2D `building` fill layer and the `building-3d`
// extrusion layer — grouped because both are "fill/detail" for the same
// footprint (handoff's own "buildings.fill/detail" wording) and always
// share one visibility/opacity/minzoom decision in this system. Case
// markers and their halo are two independently tunable roles.
export type EditableLodRoleId =
  | "roads.major"
  | "roads.minor"
  | "roads.casing"
  | "roads.labels"
  | "buildings.fill"
  | "cases.markers"
  | "cases.markerHalo";

// `buildings.outline` has no independent MapLibre layer/property of its own
// — `fill-outline-color` has no separate opacity axis distinct from its
// parent fill layer's `fill-opacity` (Style Spec). It is therefore modeled
// as derived from `buildings.fill` (same pattern as mapPaint.ts's
// DERIVED_MAP_PAINT_ROLES) rather than given a second, uncontrollable
// DevTools row. `places.labels` is not modeled at all: the existing atlas
// classifier (TG004-FB-01, styleLayerRoles in MapView.tsx) drops every
// place/POI label layer entirely, so there is nothing currently rendered to
// manage. An optional case hover label exists (`.map-hover-label` in
// App/MapView) but is a plain React-rendered DOM overlay, not a MapLibre
// style layer — it has no runtime paint/layout property for this system to
// mutate, so it is intentionally not modeled as a LOD role either.
export type DerivedLodRoleId = "buildings.outline";

export type LodRoleId = EditableLodRoleId | DerivedLodRoleId;

export interface LodRoleCapabilities {
  // Layout visibility toggle (setLayoutProperty "visibility").
  visible: boolean;
  // Runtime minzoom override (Map#setLayerZoomRange), maxzoom left at the
  // upstream layer's own value — never widened past what the source data
  // actually supports.
  minZoom: boolean;
  // Per-band opacity override (line-opacity / fill-opacity / text-opacity /
  // circle-opacity depending on role) — a *replacement* step(zoom)
  // expression, only ever applied when the role's stored value is non-null;
  // null means "do not touch the property at all", preserving whatever
  // upstream already does with it (handoff Scope D/§7 "preserve upstream
  // expressions when ADG-ARC is not explicitly overriding them").
  opacity: boolean;
  // Per-band circle-radius/halo-radius multiplier. Deliberately NOT offered
  // for road/building roles: their width/size already comes from upstream
  // zoom-interpolate expressions, and safely re-deriving a scaled version of
  // an *existing* zoom expression (rather than replacing the property
  // outright, as opacity does) is exactly the kind of nested-expression risk
  // the prior TG006D regression came from — out of scope for a low-risk
  // pass. Markers/halo own their radius expression outright (built from
  // scratch here, no upstream expression to preserve or risk), so scale is
  // safe and offered there.
  scale: boolean;
}

export interface EditableLodRoleMeta {
  id: EditableLodRoleId;
  label: string;
  capabilities: LodRoleCapabilities;
}

export interface DerivedLodRoleMeta {
  id: DerivedLodRoleId;
  label: string;
  derivedFrom: EditableLodRoleId;
}

// One role's stored/effective override. All four fields are always present
// (uniform shape, per handoff §8 "keep the UI comprehensible") — fields a
// role's capabilities don't support are simply never read by the apply
// function or rendered by DevTools, rather than the type growing a second,
// role-specific shape.
export interface LodRoleOverride {
  visible: boolean;
  // null = inherited/unmanaged: never call setLayerZoomRange for this role.
  minZoom: number | null;
  // [CITY, DISTRICT, BUILDING], each 0..1. null = inherited/unmanaged: never
  // call setPaintProperty for this role's opacity property.
  opacity: [number, number, number] | null;
  // [CITY, DISTRICT, BUILDING] multiplier, each > 0. null = treated as
  // [1, 1, 1] (no-op) wherever scale is actually applied.
  scale: [number, number, number] | null;
}

const NO_OVERRIDE: LodRoleOverride = { visible: true, minZoom: null, opacity: null, scale: null };

const ROAD_CAPABILITIES: LodRoleCapabilities = { visible: true, minZoom: true, opacity: true, scale: false };
const BUILDING_CAPABILITIES: LodRoleCapabilities = { visible: true, minZoom: true, opacity: true, scale: false };
// Markers must stay reachable/clickable at every zoom the map allows, so no
// minzoom control is offered for them (unlike roads/buildings, hiding a
// case marker by zoom would actively hide product content, not just
// cartographic clutter).
const MARKER_CAPABILITIES: LodRoleCapabilities = { visible: true, minZoom: false, opacity: true, scale: true };
const MARKER_HALO_CAPABILITIES: LodRoleCapabilities = { visible: false, minZoom: false, opacity: true, scale: true };

export const EDITABLE_LOD_ROLES: EditableLodRoleMeta[] = [
  { id: "roads.major", label: "Roads — major", capabilities: ROAD_CAPABILITIES },
  { id: "roads.minor", label: "Roads — minor", capabilities: ROAD_CAPABILITIES },
  { id: "roads.casing", label: "Roads — casing", capabilities: ROAD_CAPABILITIES },
  { id: "roads.labels", label: "Road labels", capabilities: ROAD_CAPABILITIES },
  { id: "buildings.fill", label: "Buildings (fill + 3D detail)", capabilities: BUILDING_CAPABILITIES },
  { id: "cases.markers", label: "Case markers", capabilities: MARKER_CAPABILITIES },
  { id: "cases.markerHalo", label: "Case marker halo", capabilities: MARKER_HALO_CAPABILITIES },
];

export const DERIVED_LOD_ROLES: DerivedLodRoleMeta[] = [
  { id: "buildings.outline", label: "Building outlines", derivedFrom: "buildings.fill" },
];

// Canonical defaults: every role is fully inherited/unmanaged (upstream's
// own zoom behavior, documented above, already produces a coherent
// hierarchy) EXCEPT the two roles this milestone has actual evidence-backed
// product reasons to actively tune out of the box:
//   - roads.labels: upstream's own per-class minzoom already suppresses
//     most labels at CITY, but a restrained *fade* (not a hard cut) reads
//     better than the abrupt on/off upstream ships, per handoff Scope E
//     ("labels are restrained" at CITY, "become more useful" at DISTRICT).
//   - cases.markers: slightly larger at CITY, where the map is otherwise
//     sparse and the marker needs to read as the dominant element, settling
//     to its normal size once real cartographic detail is present — see
//     handoff Scope B "CITY: strong case-marker legibility" / "BUILDING:
//     selected case remains visually dominant" (still true at 1x — nothing
//     else in the BUILDING band outcompetes the accent-colored marker).
export const CANONICAL_LOD_DEFAULTS: Record<EditableLodRoleId, LodRoleOverride> = {
  "roads.major": { ...NO_OVERRIDE },
  "roads.minor": { ...NO_OVERRIDE },
  "roads.casing": { ...NO_OVERRIDE },
  "roads.labels": { ...NO_OVERRIDE, opacity: [0.55, 0.85, 1] },
  "buildings.fill": { ...NO_OVERRIDE },
  "cases.markers": { ...NO_OVERRIDE, scale: [1.15, 1.05, 1] },
  "cases.markerHalo": { ...NO_OVERRIDE },
};

export type EffectiveLodConfig = {
  roles: Record<EditableLodRoleId, LodRoleOverride>;
  thresholds: ZoomBandThresholds;
};

export function isEditableLodRoleId(value: string): value is EditableLodRoleId {
  return Object.prototype.hasOwnProperty.call(CANONICAL_LOD_DEFAULTS, value);
}

// Style Spec zoom range is documented as 0-24; MapView's own MIN_ZOOM/
// MAX_ZOOM (10.5/18) are the practical envelope, but validation here stays
// at the wider Style Spec bound so a threshold edit is only rejected for
// being genuinely malformed/unordered, not for temporarily exceeding the
// current app-configured camera envelope.
const ZOOM_BOUND_MIN = 0;
const ZOOM_BOUND_MAX = 24;

function isValidZoom(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= ZOOM_BOUND_MIN && value <= ZOOM_BOUND_MAX;
}

// Strictly ordered per handoff §4/§16 — rejects (returns null) rather than
// clamping a malformed pair into a silently-different valid one.
export function normalizeZoomThresholds(value: unknown): ZoomBandThresholds | null {
  if (typeof value !== "object" || value === null) return null;
  const { districtMin, buildingMin } = value as Record<string, unknown>;
  if (!isValidZoom(districtMin) || !isValidZoom(buildingMin)) return null;
  if (!(districtMin < buildingMin)) return null;
  return { districtMin, buildingMin };
}

function normalizeOpacityValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1
    ? Math.round(value * 1000) / 1000
    : null;
}

function normalizeOpacityTriplet(value: unknown): [number, number, number] | null {
  if (value === null) return null;
  if (!Array.isArray(value) || value.length !== 3) return null;
  const a = normalizeOpacityValue(value[0]);
  const b = normalizeOpacityValue(value[1]);
  const c = normalizeOpacityValue(value[2]);
  return a === null || b === null || c === null ? null : [a, b, c];
}

function normalizeScaleValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 4
    ? Math.round(value * 1000) / 1000
    : null;
}

function normalizeScaleTriplet(value: unknown): [number, number, number] | null {
  if (value === null) return null;
  if (!Array.isArray(value) || value.length !== 3) return null;
  const a = normalizeScaleValue(value[0]);
  const b = normalizeScaleValue(value[1]);
  const c = normalizeScaleValue(value[2]);
  return a === null || b === null || c === null ? null : [a, b, c];
}

// Validates one candidate role override. Every unknown/malformed field is
// dropped back to "inherited" individually rather than rejecting the whole
// role — mirrors useMapPaintOverrides.ts's per-field fail-safe contract, per
// handoff §16 "invalid LOD persistence safely falls back".
export function normalizeLodRoleOverride(value: unknown): LodRoleOverride | null {
  if (typeof value !== "object" || value === null) return null;
  const { visible, minZoom, opacity, scale } = value as Record<string, unknown>;
  if (typeof visible !== "boolean") return null;
  const normalizedMinZoom = minZoom === null ? null : isValidZoom(minZoom) ? minZoom : undefined;
  if (normalizedMinZoom === undefined) return null;
  const normalizedOpacity = opacity === null ? null : normalizeOpacityTriplet(opacity);
  if (opacity !== null && normalizedOpacity === null) return null;
  const normalizedScale = scale === null ? null : normalizeScaleTriplet(scale);
  if (scale !== null && normalizedScale === null) return null;
  return { visible, minZoom: normalizedMinZoom, opacity: normalizedOpacity, scale: normalizedScale };
}

// A valid top-level MapLibre `step` expression: `["zoom"]` is the direct
// input, and every branch value is a plain literal or a non-zoom
// sub-expression — the exact pattern the Style Spec allows and the TG006D
// regression violated (see the module comment in MapView.tsx's
// styleLayerRoles for the historical root cause). Building three fully
// pre-resolved branch values in JS (rather than trying to multiply a
// runtime zoom-driven expression by a scale factor at render time) is a
// deliberate simplicity/safety choice — see LodRoleCapabilities.scale.
export function buildZoomStepExpression<T>(
  thresholds: ZoomBandThresholds,
  values: [T, T, T]
): ["step", ["zoom"], T, number, T, number, T] {
  return ["step", ["zoom"], values[0], thresholds.districtMin, values[1], thresholds.buildingMin, values[2]];
}
