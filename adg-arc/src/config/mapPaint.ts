// TG006E — single-source semantic map-paint registry. Promotes the
// TG006D-016 `MAP_PAINT` constant (previously private to MapView.tsx) into a
// reusable module: type/schema, canonical defaults, stable semantic role
// IDs + human-readable labels, and hex/alpha validation. MapView consumes the
// runtime-effective config built from these defaults; it holds no
// independent palette authority of its own (see useMapPaintOverrides.ts).
//
// Canonical defaults remain only the three TG006D-accepted literals — no
// fourth dominant color is introduced by this milestone.
//
// TG006E corrective pass: each editable role's color is now a base
// `#RRGGBB` hex plus a separate `alpha` (0..1) rather than an opaque hex
// alone, per the corrective handoff's "preferred" data-model option — role
// identity stays a stable string ID; only the value shape gained a field.

// Independently editable roles — every color-bearing MapLibre paint
// property this app manages by hand.
export type EditableMapPaintRoleId =
  | "map.background"
  | "map.water.fill"
  | "map.building.fill"
  | "map.building.outline"
  | "map.road.fill"
  | "map.road.casing"
  | "map.road.label"
  | "map.road.labelHalo"
  | "map.caseMarker.default"
  | "map.caseMarker.hover"
  | "map.caseMarker.selected";

// Derived roles — CSS-side map-overlay chrome (tether, hover-label border,
// map-controls chrome) and marker aliases that always mirror one editable
// role 1:1 (see global.css's --map-ink/--map-white/--map-accent consumers).
// Never independently stored; resolved by reading `derivedFrom` off the
// effective config. Listed here so the registry documents every managed
// color-bearing map role, per the TG006E handoff, even the ones with no
// independent editor control.
export type DerivedMapPaintRoleId =
  | "map.caseMarker.stroke"
  | "map.caseMarker.halo"
  | "map.tether.line"
  | "map.tether.joint"
  | "map.hoverLabel.border"
  | "map.mapControls.border"
  | "map.mapControls.hover";

export type MapPaintRoleId = EditableMapPaintRoleId | DerivedMapPaintRoleId;

// TG006E corrective pass: Developer Tools groups editable roles into two
// review sections ("Map palette" for base cartography, "Map overlays /
// markers" for case-marker states) — see handoff §4.
export type MapPaintRoleGroup = "cartography" | "markers";

export interface MapPaintRoleMeta {
  id: MapPaintRoleId;
  label: string;
}

export interface EditableMapPaintRoleMeta extends MapPaintRoleMeta {
  id: EditableMapPaintRoleId;
  group: MapPaintRoleGroup;
}

export interface DerivedMapPaintRoleMeta extends MapPaintRoleMeta {
  id: DerivedMapPaintRoleId;
  derivedFrom: EditableMapPaintRoleId;
}

// One editable role's effective value: a validated base hex plus a
// validated 0..1 alpha. Kept as two plain fields (not a merged #RRGGBBAA
// string) so hex and alpha can be edited/validated independently in
// Developer Tools without re-parsing a packed literal.
export interface MapPaintColor {
  hex: string;
  alpha: number;
}

export const MAP_PAINT_DEFAULTS: Record<EditableMapPaintRoleId, MapPaintColor> = {
  "map.background": { hex: "#FFFFFF", alpha: 1 },
  "map.water.fill": { hex: "#FFED00", alpha: 1 },
  "map.building.fill": { hex: "#FFFFFF", alpha: 1 },
  "map.building.outline": { hex: "#1D1D1B", alpha: 1 },
  "map.road.fill": { hex: "#FFFFFF", alpha: 1 },
  "map.road.casing": { hex: "#1D1D1B", alpha: 1 },
  "map.road.label": { hex: "#1D1D1B", alpha: 1 },
  "map.road.labelHalo": { hex: "#FFFFFF", alpha: 1 },
  "map.caseMarker.default": { hex: "#1D1D1B", alpha: 1 },
  "map.caseMarker.hover": { hex: "#FFFFFF", alpha: 1 },
  "map.caseMarker.selected": { hex: "#FFED00", alpha: 1 },
};

export const EDITABLE_MAP_PAINT_ROLES: EditableMapPaintRoleMeta[] = [
  { id: "map.background", label: "Background / land", group: "cartography" },
  { id: "map.water.fill", label: "Water", group: "cartography" },
  { id: "map.building.fill", label: "Building fill", group: "cartography" },
  { id: "map.building.outline", label: "Building outline", group: "cartography" },
  { id: "map.road.fill", label: "Road fill", group: "cartography" },
  { id: "map.road.casing", label: "Road casing", group: "cartography" },
  { id: "map.road.label", label: "Road label text", group: "cartography" },
  { id: "map.road.labelHalo", label: "Road label halo", group: "cartography" },
  { id: "map.caseMarker.default", label: "Case marker — default (ink)", group: "markers" },
  { id: "map.caseMarker.hover", label: "Case marker — hover", group: "markers" },
  { id: "map.caseMarker.selected", label: "Case marker — selected (accent)", group: "markers" },
];

export const DERIVED_MAP_PAINT_ROLES: DerivedMapPaintRoleMeta[] = [
  { id: "map.caseMarker.stroke", label: "Case marker stroke", derivedFrom: "map.caseMarker.default" },
  { id: "map.caseMarker.halo", label: "Case marker halo", derivedFrom: "map.caseMarker.selected" },
  { id: "map.tether.line", label: "Selection tether line", derivedFrom: "map.caseMarker.default" },
  { id: "map.tether.joint", label: "Selection tether joint", derivedFrom: "map.caseMarker.default" },
  { id: "map.hoverLabel.border", label: "Hover label border", derivedFrom: "map.caseMarker.default" },
  { id: "map.mapControls.border", label: "Map controls border", derivedFrom: "map.caseMarker.default" },
  { id: "map.mapControls.hover", label: "Map controls hover fill", derivedFrom: "map.caseMarker.default" },
];

// The effective runtime paint configuration: canonical defaults with any
// validated devtools overrides merged in. Only editable roles are stored —
// derived roles are always read via `derivedFrom`, never duplicated.
export type EffectiveMapPaint = Record<EditableMapPaintRoleId, MapPaintColor>;

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// Accepts "#RRGGBB" or bare "RRGGBB"; rejects everything else (3-digit
// shorthand, named colors, alpha channels) so the effective config only
// ever holds one exact literal shape. Returns null rather than throwing —
// callers decide how to surface the rejection.
export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return HEX_RE.test(withHash) ? withHash.toUpperCase() : null;
}

// Bounds alpha to the closed range [0, 1]; rejects (returns null) anything
// that isn't a finite number, rather than silently clamping a typo like
// "1e9" or "" into a valid value.
export function normalizeAlpha(value: number | string): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 1) return null;
  return Math.round(n * 1000) / 1000;
}

export function isEditableRoleId(value: string): value is EditableMapPaintRoleId {
  return Object.prototype.hasOwnProperty.call(MAP_PAINT_DEFAULTS, value);
}

// Resolves one role's value to a CSS color string. MapLibre's style-spec
// color parser and CSS both accept `rgba()` natively, so this is the single
// format used everywhere an effective color is actually consumed (MapLibre
// paint properties, CSS custom properties) — no second color-string
// pipeline for alpha-aware vs. opaque roles.
export function paintToCss({ hex, alpha }: MapPaintColor): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
