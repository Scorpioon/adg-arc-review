import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
// ADGARC 030-S2 (MapLibre v6 type-contract corrective): `maplibre-gl` itself
// re-exports no expression/paint-property type (see its own export list) —
// `ExpressionSpecification` is only available from `@maplibre/maplibre-gl-
// style-spec`, the public style-spec type surface maplibre-gl@6.4.1 depends
// on (`^26.2.1`, already installed transitively per package-lock.json).
// Type-only import, erased at build time — no new runtime dependency.
import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// ADGARC-SEC-001 (CVE-2026-85061 / GHSA-jrc7-96c5-q579): MapLibre GL JS 6.x
// requires the worker to be supplied explicitly via Vite's `?worker&url`
// pipeline before any `new maplibregl.Map(...)` call — must run once at
// module scope, ahead of the mount effect below.
maplibregl.setWorkerUrl(maplibreWorkerUrl);
import type { CaseRecord } from "../data/cases";
import type { PanelAnchor } from "./CaseSheet";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useViewportClass } from "../hooks/useViewportClass";
import type { Milestone } from "../hooks/useReadiness";
import { paintToCss, type EditableMapPaintRoleId, type EffectiveMapPaint } from "../config/mapPaint";
import {
  buildZoomStepExpression,
  type EditableLodRoleId,
  type EffectiveLodConfig,
} from "../config/mapLod";
import { DESKTOP_MIN } from "../config/breakpoints";
import { useT } from "../i18n/context";
import MapControls from "./MapControls";

export interface CameraState {
  zoom: number;
  bearing: number;
  pitch: number;
}

interface MapViewProps {
  cases: CaseRecord[];
  selectedSlug: string | null;
  onSelectCase: (slug: string) => void;
  panelAnchor: PanelAnchor | null;
  // TG006E Scope D: the single runtime-effective paint config (canonical
  // defaults + any validated devtools overrides), owned by App via
  // useMapPaintOverrides — MapView holds no independent palette authority.
  paint: EffectiveMapPaint;
  // TG006F Scope D: the single runtime-effective LOD config (canonical
  // defaults + any validated devtools overrides), owned by App via
  // useMapLodOverrides — MapView holds no independent LOD authority either.
  lod: EffectiveLodConfig;
  onMapReady?: (map: MapLibreMap) => void;
  // TG006B: reports real MapLibre lifecycle points to App's readiness
  // tracker (see useReadiness.ts) — never a fabricated/time-based signal.
  onReadinessMilestone?: (milestone: Milestone) => void;
  onReadinessError?: (message: string) => void;
  // TG006F Scope F: a MapLibre "error" event observed *after* the map has
  // already reached styleLoaded — nonfatal by definition (initial readiness
  // already succeeded) — routed to Developer Tools review, never to
  // readiness failure. See the mount effect's error-path comment below for
  // the fatal/nonfatal distinction this hinges on.
  onMapWarning?: (message: string) => void;
  // TG006E Scope G: smallest possible camera-observation surface for
  // Developer Tools' debug-state pane. Only subscribed by App while that
  // pane is actually visible (see App.tsx), so this never runs an
  // unconditional render loop off ordinary map panning.
  onCameraChange?: (state: CameraState) => void;
  // TG006I Scope A: fires once per real, user-originated map interaction
  // (drag/zoom/rotate/pitch start) — used by App to dismiss the one-time
  // gesture coachmark (useGestureCoachmark). Distinguishes genuine user
  // gestures from the app's own programmatic camera moves (case-focus
  // easeTo, reset, etc.) by checking each MapLibre event's `originalEvent`,
  // which MapLibre only ever populates for interaction-driven events — see
  // the [mapReady] effect below.
  onUserInteraction?: () => void;
}

const SOURCE_ID = "cases";
const LAYER_HALO_ID = "cases-taint-halo";
const LAYER_DOT_ID = "cases-taint-dot";
const BACKGROUND_LAYER_ID = "atlas-background";

// Categories to always suppress even when they share a kept source-layer —
// rail/transit geometry and route-shield symbols live in the same
// "transportation"/"transportation_name" source-layers as road geometry and
// road-name text, distinguished only by layer id in the liberty style.
const NOISE_ID = /rail|transit|ferry|aerialway|shield/i;

// TG006E Scope C/D single classifier: which (paint-property, semantic-role)
// pairs a given upstream style layer participates in, if any. Used both by
// `buildAtlasStyle` (initial style construction) and `applyPaintLive` (live
// `setPaintProperty` updates on an existing style) so the two paths can
// never drift apart — one classification, two call sites, no duplicate
// palette authority.
function styleLayerRoles(layer: {
  type: string;
  id: string;
  "source-layer"?: string;
}): Array<{ prop: string; role: EditableMapPaintRoleId }> | null {
  const sourceLayer = layer["source-layer"];

  if (layer.type === "fill" && sourceLayer === "water") {
    return [{ prop: "fill-color", role: "map.water.fill" }];
  }
  if (layer.type === "line" && sourceLayer === "waterway") {
    return [{ prop: "line-color", role: "map.water.fill" }];
  }
  if (layer.type === "fill" && sourceLayer === "building") {
    return [
      { prop: "fill-color", role: "map.building.fill" },
      { prop: "fill-outline-color", role: "map.building.outline" },
    ];
  }
  if (layer.type === "fill-extrusion" && sourceLayer === "building") {
    return [{ prop: "fill-extrusion-color", role: "map.building.fill" }];
  }
  if (layer.type === "line" && sourceLayer === "transportation" && !NOISE_ID.test(layer.id)) {
    // TG006D-016 root-cause fix retained: recolor each already-existing,
    // already-unique upstream layer by its own id rather than synthesizing
    // a new layer/width-expression — see the paired report's recovery
    // section for why the prior approach broke style loading entirely.
    return [{ prop: "line-color", role: /_casing$/.test(layer.id) ? "map.road.casing" : "map.road.fill" }];
  }
  if (layer.type === "symbol" && sourceLayer === "transportation_name" && !NOISE_ID.test(layer.id)) {
    return [
      { prop: "text-color", role: "map.road.label" },
      { prop: "text-halo-color", role: "map.road.labelHalo" },
    ];
  }

  return null;
}

// TG006F Scope A/C classifier: which semantic LOD role (if any) an upstream
// style layer belongs to — shares the same NOISE_ID/type/source-layer
// discovery as `styleLayerRoles` above (one discovery boundary, two
// independent concerns: color vs. zoom-band treatment) rather than a second,
// possibly-disagreeing classifier. Never returns a raw Liberty layer id to
// any caller — only the semantic `EditableLodRoleId`. See config/mapLod.ts
// for the full role inventory/rationale and which upstream evidence the
// canonical zoom-band thresholds were derived from.
const MAJOR_ROAD_CLASS = /motorway|trunk_primary/;

function classifySemanticLodRoles(layer: {
  type: string;
  id: string;
  "source-layer"?: string;
}): EditableLodRoleId | null {
  const sourceLayer = layer["source-layer"];

  if ((layer.type === "fill" || layer.type === "fill-extrusion") && sourceLayer === "building") {
    return "buildings.fill";
  }
  if (layer.type === "line" && sourceLayer === "transportation" && !NOISE_ID.test(layer.id)) {
    if (/_casing$/.test(layer.id)) return "roads.casing";
    return MAJOR_ROAD_CLASS.test(layer.id) ? "roads.major" : "roads.minor";
  }
  if (layer.type === "symbol" && sourceLayer === "transportation_name" && !NOISE_ID.test(layer.id)) {
    return "roads.labels";
  }

  return null;
}

// Which paint property a role's opacity override actually targets, given
// the concrete layer type it is currently classifying (buildings.fill
// spans both a "fill" and a "fill-extrusion" layer, each with its own
// opacity property name). Returns null for roles with no opacity
// capability (see LodRoleCapabilities in config/mapLod.ts) — those are
// never given a paint-property override here.
// ADGARC 030-S2: the exact subset of `AllPaintProperties` keys this function
// can actually return — MapLibre v6's setPaintProperty/getPaintProperty are
// generic on `keyof AllPaintProperties`, which rejects a widened `string`
// (see the two call sites below).
type LodOpacityProperty = "line-opacity" | "text-opacity" | "fill-opacity" | "fill-extrusion-opacity";

function lodOpacityProperty(role: EditableLodRoleId, layerType: string): LodOpacityProperty | null {
  switch (role) {
    case "roads.major":
    case "roads.minor":
    case "roads.casing":
      return "line-opacity";
    case "roads.labels":
      return "text-opacity";
    case "buildings.fill":
      return layerType === "fill-extrusion" ? "fill-extrusion-opacity" : "fill-opacity";
    default:
      return null;
  }
}

// TG006F Scope D: per-(layer,property) values captured once, immediately
// after the initial atlas style's layers are actually active on the map
// (inside the "load" handler, before any LOD override has ever been
// applied) — the real baseline every later "inherited/unmanaged" resolution
// reapplies, since MapLibre's own null/undefined paint-reset semantics are
// only documented for setPaintProperty and not for setLayerZoomRange, and
// because `building-3d`'s fill-extrusion-opacity is itself an ADG-ARC
// constant (0.75, set in buildAtlasStyle) rather than upstream's raw style
// value (0.8) — reverting to "whatever the style spec default would be"
// would silently diverge from that constant. Capturing the real in-place
// baseline once keeps every role's "opacity: null" / "minZoom: null"
// resolution exact, in both directions, without relying on undocumented
// reset behavior.
interface LodBaselines {
  zoomRange: Record<string, { min: number; max: number }>;
  opacity: Record<string, unknown>;
}

function captureLodBaselines(map: MapLibreMap): LodBaselines {
  const zoomRange: LodBaselines["zoomRange"] = {};
  const opacity: LodBaselines["opacity"] = {};

  for (const layer of map.getStyle()?.layers ?? []) {
    const l = layer as { type: string; id: string; "source-layer"?: string };
    const role = classifySemanticLodRoles(l);
    if (!role) continue;

    const styleLayer = map.getLayer(l.id);
    if (styleLayer) zoomRange[l.id] = { min: styleLayer.minzoom, max: styleLayer.maxzoom };

    const prop = lodOpacityProperty(role, l.type);
    if (prop) opacity[`${l.id}:${prop}`] = map.getPaintProperty(l.id, prop);
  }

  return { zoomRange, opacity };
}

// TG006F Scope D: safe live re-application of the LOD config onto an
// already-loaded style — every call is setLayoutProperty/setPaintProperty/
// setLayerZoomRange on an existing layer id, never addLayer/removeLayer or
// a map re-creation, mirroring applyPaintLive's contract exactly. Every
// role resolves to a *concrete* value every call (never a bare `null`
// handed to the MapLibre API) — inherited roles reapply their captured
// baseline, explicit overrides apply one valid top-level step(zoom)
// expression. Only runs when `lod` itself changes (threshold edit, role
// edit, Reset) — never on ordinary camera movement, since every zoom-band
// transition these properties need is expressed natively inside the
// step(zoom) expression itself and evaluated by MapLibre, not by this
// function (see the [lod, mapReady] effect below).
function applyLodLive(map: MapLibreMap, lod: EffectiveLodConfig, baselines: LodBaselines): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    const l = layer as { type: string; id: string; "source-layer"?: string };
    const role = classifySemanticLodRoles(l);
    if (!role) continue;
    const override = lod.roles[role];

    map.setLayoutProperty(l.id, "visibility", override.visible ? "visible" : "none");

    const range = baselines.zoomRange[l.id];
    if (range) {
      map.setLayerZoomRange(l.id, override.minZoom ?? range.min, range.max);
    }

    const prop = lodOpacityProperty(role, l.type);
    if (prop) {
      const key = `${l.id}:${prop}`;
      const value = override.opacity ? buildZoomStepExpression(lod.thresholds, override.opacity) : baselines.opacity[key];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.setPaintProperty(l.id, prop as any, value);
    }
  }

  applyMarkerLod(map, lod);
}

const SELECTED_STATE_EXPR: ExpressionSpecification = ["boolean", ["feature-state", "selected"], false];
const HOVER_STATE_EXPR: ExpressionSpecification = ["boolean", ["feature-state", "hover"], false];

// ADGARC 030-S3: `Array.prototype.map()`'s built-in type signature returns a
// variable-length `U[]` even when called on a fixed-length tuple (TypeScript
// does not special-case tuple receivers), so re-asserting arity afterward
// with `as [X, X, X]` is rejected (TS2352: "Target requires 3 element(s) but
// source may have fewer") once `X` is a concrete type rather than `unknown`.
// This helper preserves the 3-tuple structurally — by construction, never by
// assertion — so its result is a genuine `[U, U, U]` the compiler can verify
// on its own.
function mapTuple3<T, U>(values: readonly [T, T, T], fn: (value: T, index: 0 | 1 | 2) => U): [U, U, U] {
  return [fn(values[0], 0), fn(values[1], 1), fn(values[2], 2)];
}

// TG006F Scope B/E: case markers/halo own their radius+opacity expressions
// outright (no upstream expression to preserve), so — unlike roads/
// buildings — a per-band *scale* multiplier is safe here: each band's
// literal numbers are pre-multiplied in JS before being placed as a
// `step(["zoom"], ...)` branch value, so `["zoom"]` still only ever appears
// as that single top-level step's direct input (never re-nested inside a
// runtime arithmetic expression) — the exact pattern the Style Spec allows.
// Shared by the initial `addLayer` paint (buildMarkerPaint) and the live
// LOD-update path (applyMarkerLod) so the two can never disagree on shape.
function buildMarkerLodExpressions(lod: EffectiveLodConfig) {
  const markerScale = lod.roles["cases.markers"].scale ?? [1, 1, 1];
  const markerOpacity = lod.roles["cases.markers"].opacity ?? [1, 1, 1];
  const haloScale = lod.roles["cases.markerHalo"].scale ?? [1, 1, 1];
  const haloOpacity = lod.roles["cases.markerHalo"].opacity ?? [1, 1, 1];

  const dotRadius = buildZoomStepExpression(
    lod.thresholds,
    mapTuple3(markerScale, (m): ExpressionSpecification => [
      "case",
      SELECTED_STATE_EXPR,
      11 * m,
      HOVER_STATE_EXPR,
      9 * m,
      7 * m,
    ])
  );
  const dotOpacity = buildZoomStepExpression(lod.thresholds, markerOpacity);

  const haloRadius = buildZoomStepExpression(
    lod.thresholds,
    mapTuple3(haloScale, (m): ExpressionSpecification => ["case", SELECTED_STATE_EXPR, 22 * m, 0])
  );
  const haloOpacityExpr = buildZoomStepExpression(
    lod.thresholds,
    mapTuple3(haloOpacity, (o): ExpressionSpecification => ["case", SELECTED_STATE_EXPR, 0.22 * o, 0])
  );

  return { dotRadius, dotOpacity, haloRadius, haloOpacityExpr };
}

// TG006F: live re-application of marker radius/opacity only — colors stay
// exclusively owned by applyPaintLive (a different paint-property set on
// the same two layers, so the two live-update effects can never race or
// disagree; see the [paint, mapReady] and [lod, mapReady] effects below).
function applyMarkerLod(map: MapLibreMap, lod: EffectiveLodConfig): void {
  const { dotRadius, dotOpacity, haloRadius, haloOpacityExpr } = buildMarkerLodExpressions(lod);
  if (map.getLayer(LAYER_DOT_ID)) {
    map.setPaintProperty(LAYER_DOT_ID, "circle-radius", dotRadius);
    map.setPaintProperty(LAYER_DOT_ID, "circle-opacity", dotOpacity);
  }
  if (map.getLayer(LAYER_HALO_ID)) {
    map.setPaintProperty(LAYER_HALO_ID, "circle-radius", haloRadius);
    map.setPaintProperty(LAYER_HALO_ID, "circle-opacity", haloOpacityExpr);
  }
}

// Case-marker layers are expression-driven (feature-state selected/hover,
// TG006F: now also zoom-band), not a plain per-layer color — built once
// here so the initial `addLayer` calls and the live-update paths (color:
// applyPaintLive; radius/opacity: applyMarkerLod) can never disagree on
// shape.
function buildMarkerPaint(paint: EffectiveMapPaint, lod: EffectiveLodConfig): { halo: any; dot: any } {
  const color = buildMarkerColorPaint(paint);
  const { dotRadius, dotOpacity, haloRadius, haloOpacityExpr } = buildMarkerLodExpressions(lod);
  return {
    halo: {
      "circle-color": color.haloColor,
      "circle-radius": haloRadius,
      "circle-opacity": haloOpacityExpr,
    },
    dot: {
      "circle-color": color.dotColor,
      "circle-radius": dotRadius,
      "circle-opacity": dotOpacity,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": color.dotStrokeColor,
    },
  };
}

// Marker *color* values only (radius/opacity are TG006F's independent LOD
// concern — see buildMarkerLodExpressions/applyMarkerLod above). Kept
// separate from buildMarkerPaint so applyPaintLive never needs an
// EffectiveLodConfig in scope — the two live-update effects ([paint,
// mapReady] and [lod, mapReady]) stay fully independent and can never race.
function buildMarkerColorPaint(paint: EffectiveMapPaint): {
  haloColor: string;
  dotColor: ExpressionSpecification;
  dotStrokeColor: string;
} {
  return {
    haloColor: paintToCss(paint["map.caseMarker.selected"]),
    dotColor: [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      paintToCss(paint["map.caseMarker.selected"]),
      ["boolean", ["feature-state", "hover"], false],
      paintToCss(paint["map.caseMarker.hover"]),
      paintToCss(paint["map.caseMarker.default"]),
    ],
    dotStrokeColor: paintToCss(paint["map.caseMarker.default"]),
  };
}

// TG006E Scope D: safe live repaint of an already-loaded style — every call
// is `setPaintProperty` on an existing layer id, never `addLayer`/`removeLayer`
// or a map re-creation. Iterates the map's own current style layers (not the
// raw upstream fetch) so ids always match what is actually on the map.
function applyPaintLive(map: MapLibreMap, paint: EffectiveMapPaint): void {
  if (map.getLayer(BACKGROUND_LAYER_ID)) {
    map.setPaintProperty(BACKGROUND_LAYER_ID, "background-color", paintToCss(paint["map.background"]));
  }

  for (const layer of map.getStyle()?.layers ?? []) {
    const roles = styleLayerRoles(layer as { type: string; id: string; "source-layer"?: string });
    if (!roles) continue;
    for (const { prop, role } of roles) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.setPaintProperty(layer.id, prop as any, paintToCss(paint[role]));
    }
  }

  const markerColor = buildMarkerColorPaint(paint);
  if (map.getLayer(LAYER_HALO_ID)) {
    map.setPaintProperty(LAYER_HALO_ID, "circle-color", markerColor.haloColor);
  }
  if (map.getLayer(LAYER_DOT_ID)) {
    map.setPaintProperty(LAYER_DOT_ID, "circle-color", markerColor.dotColor);
    map.setPaintProperty(LAYER_DOT_ID, "circle-stroke-color", markerColor.dotStrokeColor);
  }
}

const BARCELONA_CENTER: [number, number] = [2.1734, 41.3851];
const DEFAULT_ZOOM = 12.3;
const FOCUS_EASE_MS = 700;
const RESET_EASE_MS = 600;

// TG006A-FB-001: a Barcelona-focused navigation envelope, not a world map.
// Bounds cover the municipality plus a useful visual margin (surrounding
// municipalities/coastline) so the city shape and edges stay legible —
// deliberately wider than the Eixample, deliberately not a whole-globe pan.
// Product-derived UI configuration, not source-case content; chosen by eye
// against the OpenFreeMap basemap, not geocoded from any case address.
const BARCELONA_BOUNDS: [[number, number], [number, number]] = [
  [1.95, 41.28], // southwest
  [2.38, 41.49], // northeast
];
const MIN_ZOOM = 10.5;
const MAX_ZOOM = 18;

// TG006A corrective pass (operator browser review): home/reset now anchors
// on DhUB rather than the whole-city overview — DhUB is both the map's
// flagship case and ADG's own HQ, so it is the more legible geographic
// anchor — at a closer zoom than the initial "whole Barcelona" camera,
// approximating the operator's preferred "screenshot B" framing. 11.2 is
// the corrective target given in the handoff (more zoomed-in than MIN_ZOOM
// 10.5, well short of DhUB's own focus zoom of 16.5).
const HOME_ZOOM = 11.2;
const ROTATE_STEP_DEG = 15;

// TG006A editorial bearing microcorrection (operator browser smoke #2):
// around DhUB/Eixample, Gran Via runs diagonally on a north-up map. -30 was
// the first product trial for a curated default orientation that brings
// Gran Via closer to horizontal — a restrained editorial rotation, not a
// geodetically exact bearing.
//
// Bearing microcorrection #2 (prompt 011, browser smoke #3): -30 was almost
// right but one counterclockwise rotation-control click (ROTATE_STEP_DEG,
// 15°) further matched the preferred orientation, giving -45. Product-
// derived UI configuration; browser/product acceptance of this value
// remains operator-owned.
const HOME_BEARING = -45;

// Reads DhUB's already-canonical coordinate from cases.ts rather than
// duplicating it as a literal here, so the home/reset target can never
// drift from the one accepted DhUB coordinate. Falls back to the Barcelona
// overview center only in the unreachable case DhUB is absent from the
// dataset.
function homeView(cases: CaseRecord[]) {
  const dhub = cases.find((c) => c.slug === "dhub");
  const center: [number, number] = dhub?.coordinates
    ? [dhub.coordinates.longitude, dhub.coordinates.latitude]
    : BARCELONA_CENTER;
  return { center, zoom: HOME_ZOOM, bearing: HOME_BEARING, pitch: 0 };
}

const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// Fetches OpenFreeMap's public "liberty" vector style and reduces it,
// layer-by-layer, to the minimal architectural/editorial atlas required by
// TG004-FB-01/02/10: land + water + buildings + roads + road names only,
// recolored via the effective TG006E paint config (`styleLayerRoles` above
// is the single classifier shared with `applyPaintLive`). This replaces the
// prior raster-OSM-plus-filters approach, which could not selectively
// remove POI/transit/admin/label clutter baked into pre-rendered tiles. No
// new npm dependency, no API key — OpenFreeMap is a zero-key public style
// source already compatible with the installed maplibre-gl runtime.
function buildAtlasStyle(raw: any, reducedMotion: boolean, paint: EffectiveMapPaint): any {
  const layers: any[] = [
    {
      id: BACKGROUND_LAYER_ID,
      type: "background",
      paint: { "background-color": paintToCss(paint["map.background"]) },
    },
  ];

  for (const layer of raw.layers ?? []) {
    if (layer.type === "background") {
      // Superseded by the synthesized atlas-background layer above.
      continue;
    }

    if (layer.type === "symbol" && layer["source-layer"] === "transportation_name" && !NOISE_ID.test(layer.id)) {
      const layout = { ...layer.layout };
      delete layout["icon-image"];
      const paintPatch: Record<string, string> = {};
      for (const { prop, role } of styleLayerRoles(layer) ?? []) paintPatch[prop] = paintToCss(paint[role]);
      layers.push({ ...layer, layout, paint: { ...layer.paint, ...paintPatch, "text-halo-width": 1 } });
      continue;
    }

    const roles = styleLayerRoles(layer);
    if (roles) {
      const paintPatch: Record<string, string | number> = {};
      for (const { prop, role } of roles) paintPatch[prop] = paintToCss(paint[role]);
      // fill-extrusion-opacity is a fixed layer-shape constant, not a color
      // role — it has no live-repaint counterpart in applyPaintLive because
      // it never varies with the palette.
      if (layer.type === "fill-extrusion" && layer["source-layer"] === "building") {
        paintPatch["fill-extrusion-opacity"] = 0.75;
      }
      layers.push({ ...layer, paint: { ...layer.paint, ...paintPatch } });
      continue;
    }

    // Everything else — POIs, transit, admin boundaries, place/neighbourhood
    // labels, landuse decoration, icons, house numbers — intentionally
    // dropped per TG004-FB-01.
  }

  return {
    version: 8,
    glyphs: raw.glyphs,
    sources: raw.sources,
    layers,
    // Governs paint-property transitions map-wide (incl. feature-state
    // driven taint/hover/selected changes below) — the style spec exposes
    // no per-property "-transition" paint key for circle layers, so this
    // top-level field is the only way to gate that duration.
    transition: { duration: reducedMotion ? 0 : 250, delay: 0 },
  };
}

// Only cases with a known map coordinate are plottable. As of TG006D all 10
// canonical cases carry a coordinate (9 externally-sourced + DHub's existing
// product coordinate — see data/cases.ts and the TG006D coordinate evidence
// pack), so this filter is now effectively a no-op over the full set; it
// stays in place as the honest guard for any future case a coordinate pack
// doesn't yet cover, which would still be reachable via `?case=<slug>`.
function mappableCases(cases: CaseRecord[]): Array<CaseRecord & { coordinates: NonNullable<CaseRecord["coordinates"]> }> {
  return cases.filter(
    (c): c is CaseRecord & { coordinates: NonNullable<CaseRecord["coordinates"]> } => c.coordinates !== null
  );
}

function toFeatureCollection(cases: CaseRecord[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: mappableCases(cases).map((c, i) => ({
      type: "Feature",
      id: i,
      geometry: { type: "Point", coordinates: [c.coordinates.longitude, c.coordinates.latitude] },
      properties: { slug: c.slug, title: c.identity.name },
    })),
  };
}

// Single persistent map instance for the app's lifetime. Mounted once at the
// top of App and never unmounted/remounted by editorial state changes.
//
// DhUB (and any future case) is rendered as a small map-native circle marker
// with a rust/brick taint, not a conventional pin+popup. The current source
// truth has no real building-footprint geometry for DhUB, so this is
// deliberately the smallest map-native tainted feature rather than a
// fabricated footprint polygon — see the TG004 execution report.
//
// TG006D: exposes a small imperative handle (reset / north-up / editorial
// orientation) so App's Settings destination can trigger real camera
// actions without duplicating MapView's private HOME_BEARING/homeView
// constants — those stay the single source of truth for the editorial home.
export interface MapViewHandle {
  reset: () => void;
  setNorthUp: () => void;
  setEditorialOrientation: () => void;
}

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    cases,
    selectedSlug,
    onSelectCase,
    panelAnchor,
    paint,
    lod,
    onMapReady,
    onReadinessMilestone,
    onReadinessError,
    onMapWarning,
    onCameraChange,
    onUserInteraction,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const lastFocusedRef = useRef<string | null>(null);
  // TG006F: captured once per map instance, immediately after the initial
  // atlas style's layers are active — see captureLodBaselines' comment.
  const lodBaselinesRef = useRef<LodBaselines>({ zoomRange: {}, opacity: {} });
  const reducedMotion = usePrefersReducedMotion();
  const deviceClass = useViewportClass();
  const t = useT();
  // TG006I Scope E: the mount effect below intentionally closes over `[]`
  // (captures state once at mount, like `paint`/`reducedMotion` already
  // did pre-TG006I) — a ref keeps its error strings live across re-renders
  // without needing to add `t` to that effect's deps, since only `es` is
  // ever actually active/selectable this milestone (ca/en can't be
  // activated — see i18n/locales.ts), so this ref is a hygiene guard
  // against staleness rather than a fix for an observable bug today.
  const errorMessagesRef = useRef({ timeout: t("mapView.errorTimeout"), load: t("mapView.errorLoad") });
  errorMessagesRef.current = { timeout: t("mapView.errorTimeout"), load: t("mapView.errorLoad") };
  const [mapReady, setMapReady] = useState(false);
  const [tetherPoint, setTetherPoint] = useState<{ x: number; y: number } | null>(null);
  // Hover/focus case-name label — desktop-pointer only (see supportsHover
  // below), screen-space positioned like the tether. Identifies the hovered
  // case without a conventional pin+popup.
  const [hoverLabel, setHoverLabel] = useState<{ x: number; y: number; title: string } | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    // Hoisted so the effect's own cleanup (defined below, before the fetch
    // resolves) can clear it — see the guarded failure-detector comment
    // further down for what this actually guards against.
    let initTimeoutId: number | undefined;

    const initialMappable = mappableCases(cases)[0];
    const initialCenter = initialMappable
      ? ([initialMappable.coordinates.longitude, initialMappable.coordinates.latitude] as [number, number])
      : BARCELONA_CENTER;

    // TG006A editorial bearing microcorrection: with no deep-linked case,
    // the default initial camera is now the same curated home view used by
    // reset, so a fresh visit and an explicit reset always land on one
    // ADG-ARC composition. A deep-linked case keeps its own center/zoom
    // (refined by the case-focus effect once the map loads) but still
    // starts at the editorial HOME_BEARING rather than north-up, per the
    // handoff's "preserve the current editorial bearing when focusing a
    // case unless existing logic explicitly requires otherwise."
    const initialView = selectedSlug
      ? { center: initialCenter, zoom: DEFAULT_ZOOM, bearing: HOME_BEARING, pitch: 0 }
      : homeView(cases);

    const data = toFeatureCollection(cases);

    fetch(OPENFREEMAP_STYLE_URL)
      .then((res) => res.json())
      .then((raw) => {
        if (cancelled || !containerRef.current) return;
        const container = containerRef.current;
        // Captures whatever `paint` this effect closed over at mount time —
        // intentional, matching the rest of this effect's deliberate `[]`
        // dependency array (see the eslint-disable below). Any later
        // devtools edit repaints via the separate live-update effect, never
        // by rebuilding/remounting this style.
        const style = buildAtlasStyle(raw, reducedMotion, paint);

        const map = new maplibregl.Map({
          container,
          style,
          center: initialView.center,
          zoom: initialView.zoom,
          bearing: initialView.bearing,
          pitch: initialView.pitch,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          maxBounds: BARCELONA_BOUNDS,
          // Disabled here and re-added explicitly below at "bottom-left" —
          // MapLibre's public control-position API, not a DOM hack — so it
          // no longer competes with the custom navigation dock or the
          // top-right space the corrective pass needed clear.
          attributionControl: false,
        });

        mapRef.current = map;
        onMapReady?.(map);
        onReadinessMilestone?.("mapCreated");

        // TG006F Scope F: fail-visible runtime diagnostics. The historical
        // TG006D regression (an invalid nested zoom expression in a
        // synthesized layer) left `mapCreated` completed but MapLibre's
        // "load" event permanently unfired, with no thrown exception the
        // outer fetch/.then/.catch chain below could observe — LoadingScreen
        // froze silently at 50%. MapLibre's own ErrorEvent (see
        // node_modules/maplibre-gl/src/util/evented.ts) fires one generic
        // "error" for both blocking and recoverable failures — the event
        // shape alone cannot distinguish them. This app treats the
        // distinction by timing instead: an error observed before
        // styleLoaded is captured as the best available evidence but does
        // not fail readiness by itself (some pre-load errors — e.g. one bad
        // sprite/glyph fetch — are recoverable and "load" still fires); an
        // error observed after styleLoaded is, by definition, nonfatal to
        // *initial* readiness and is routed to Developer Tools review only.
        let styleHasLoaded = false;
        let lastPreLoadError: string | null = null;

        const handleMapError = (e: { error?: { message?: string } }) => {
          const message = e?.error?.message || "Unknown MapLibre error";
          if (!styleHasLoaded) {
            lastPreLoadError = message;
          } else {
            onMapWarning?.(message);
          }
        };
        map.on("error", handleMapError);

        // Guarded failure-detector, not a fake-success timer: this branch
        // can only ever call onReadinessError, never a readiness milestone.
        // It exists purely as a backstop for the rare case no "error" event
        // fires at all (e.g. a pure network hang on tile/style resources)
        // — prefers the real captured MapLibre error text when available,
        // per the handoff's "prefer event/state evidence" guidance; the
        // fixed duration is a deliberately generous upper bound on normal
        // style-load time, not a tuned performance target.
        const STYLE_INIT_TIMEOUT_MS = 20000;
        initTimeoutId = window.setTimeout(() => {
          if (!styleHasLoaded) {
            onReadinessError?.(lastPreLoadError ?? errorMessagesRef.current.timeout);
          }
        }, STYLE_INIT_TIMEOUT_MS);

        // TG006A corrective pass: the native top-right NavigationControl was
        // removed entirely (not merely hidden) because that corner competes
        // with the open desktop CaseSheet. Zoom and rotation are now covered
        // by the custom MapControls dock (bottom-left) instead.
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

        map.once("load", () => {
          // MapLibre's "load" fires once the style and its initial
          // resources have loaded — the real "map style loaded" milestone.
          styleHasLoaded = true;
          window.clearTimeout(initTimeoutId);
          onReadinessMilestone?.("styleLoaded");

          map.addSource(SOURCE_ID, { type: "geojson", data });

          const markerPaint = buildMarkerPaint(paint, lod);

          // Halo: only visible while a case is selected — the spatial anchor.
          map.addLayer({
            id: LAYER_HALO_ID,
            type: "circle",
            source: SOURCE_ID,
            paint: markerPaint.halo,
          });

          // Marker: map-native circle, not a tourist pin. Unselected = ink,
          // hover = white (inverted highlight), selected = yellow by default
          // — the exact literal comes from the effective paint config, kept
          // live in sync by the applyPaintLive effect below.
          map.addLayer({
            id: LAYER_DOT_ID,
            type: "circle",
            source: SOURCE_ID,
            paint: markerPaint.dot,
          });

          // Both ADG case layers are added synchronously above — the real
          // "initial ADG layers/data ready" milestone.
          onReadinessMilestone?.("layersReady");

          // TG006F: capture the real in-place baseline for every LOD-managed
          // layer now that the atlas style's layers (and the two marker
          // layers just above) are all active — see captureLodBaselines'
          // comment for why this must happen exactly once, here, before any
          // LOD override is ever applied. Applied synchronously right here
          // (in addition to the [lod, mapReady] effect below, which then
          // only matters for *later* live edits) so a persisted non-canonical
          // road/building override is already in effect on the very first
          // rendered frame — road/building color already avoids this via
          // buildAtlasStyle closing over `paint` at mount; this mirrors that
          // for LOD without duplicating buildAtlasStyle's whole layer loop.
          lodBaselinesRef.current = captureLodBaselines(map);
          applyLodLive(map, lod, lodBaselinesRef.current);

          // MapLibre's "idle" fires once the map has finished rendering
          // with no further pending style/tile work — the real
          // "application ready / idle" milestone, distinct from merely
          // having added the layers a moment earlier.
          map.once("idle", () => onReadinessMilestone?.("ready"));

          // Hover intensification is desktop-pointer only — never required
          // for touch, which relies solely on the click/tap handler below.
          const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
          let hoveredId: number | string | undefined;

          if (supportsHover) {
            map.on("mousemove", LAYER_DOT_ID, (e) => {
              const feature = e.features?.[0];
              if (!feature) return;
              if (hoveredId !== undefined && hoveredId !== feature.id) {
                map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false });
              }
              hoveredId = feature.id;
              map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: true });
              map.getCanvas().style.cursor = "pointer";
              const title = feature.properties?.title;
              if (typeof title === "string") {
                setHoverLabel({ x: e.point.x, y: e.point.y, title });
              }
            });

            map.on("mouseleave", LAYER_DOT_ID, () => {
              if (hoveredId !== undefined) {
                map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false });
              }
              hoveredId = undefined;
              map.getCanvas().style.cursor = "";
              setHoverLabel(null);
            });
          }

          map.on("click", LAYER_DOT_ID, (e) => {
            const slug = e.features?.[0]?.properties?.slug;
            if (typeof slug === "string") onSelectCase(slug);
          });

          // TG006I Scope A: one-shot-per-mount user-interaction signal for
          // the gesture coachmark (App/useGestureCoachmark). Only events
          // carrying a real `originalEvent` are user-originated — every
          // programmatic camera move this app makes (case-focus easeTo,
          // reset, north-up) passes no `originalEvent`, so it can never
          // falsely dismiss the coachmark.
          const reportUserInteraction = (e: { originalEvent?: unknown }) => {
            if (e.originalEvent) onUserInteraction?.();
          };
          map.on("dragstart", reportUserInteraction);
          map.on("zoomstart", reportUserInteraction);
          map.on("rotatestart", reportUserInteraction);
          map.on("pitchstart", reportUserInteraction);

          setMapReady(true);
        });
      })
      .catch((err) => {
        console.error("ADG-ARC: failed to load atlas basemap style", err);
        onReadinessError?.(errorMessagesRef.current.load);
      });

    return () => {
      cancelled = true;
      if (initTimeoutId !== undefined) window.clearTimeout(initTimeoutId);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TG006F Scope D: live devtools LOD edits repaint the already-loaded style
  // in place — no re-fetch, no style rebuild, no map re-creation. Mirrors
  // the [paint, mapReady] effect above exactly; the two never touch the same
  // paint property (see applyLodLive/applyMarkerLod's comments) so they
  // cannot race regardless of effect ordering.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    applyLodLive(map, lod, lodBaselinesRef.current);
  }, [lod, mapReady]);

  // Cases source stays in sync if the case list itself changes (it is a
  // static import today, so in practice this fires at most once more than
  // the initial load() setup above).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(cases));
  }, [cases, mapReady]);

  // TG006E Scope D: live devtools palette edits repaint the already-loaded
  // style in place — no re-fetch, no style rebuild, no map re-creation.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    applyPaintLive(map, paint);
  }, [paint, mapReady]);

  // TG006E Scope G: smallest possible camera-observation surface for the
  // Developer Tools debug-state pane. Only attached while `onCameraChange`
  // is actually supplied (App only supplies it while that pane is visible —
  // see App.tsx), so ordinary map panning never drives a render loop this
  // milestone doesn't need. Observation only — no second map authority, no
  // LOD editing (TG006F).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !onCameraChange) return;
    const report = () => onCameraChange({ zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() });
    report();
    map.on("move", report);
    return () => {
      map.off("move", report);
    };
  }, [mapReady, onCameraChange]);

  // Selection: feature-state (drives taint/halo intensity) + a moderate,
  // one-time focus per newly selected case — never re-triggered by unrelated
  // re-renders, and never on deselect (no forced zoom-out).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const mappable = mappableCases(cases);
    mappable.forEach((c, i) => {
      map.setFeatureState({ source: SOURCE_ID, id: i }, { selected: c.slug === selectedSlug });
    });

    if (selectedSlug && selectedSlug !== lastFocusedRef.current) {
      const target = mappable.find((c) => c.slug === selectedSlug);
      if (target) {
        map.easeTo({
          center: [target.coordinates.longitude, target.coordinates.latitude],
          zoom: target.coordinates.zoom,
          duration: reducedMotion ? 0 : FOCUS_EASE_MS,
        });
      }
    }
    lastFocusedRef.current = selectedSlug;
  }, [selectedSlug, cases, reducedMotion, mapReady]);

  // Tether: screen-space line from the selected feature to the CaseSheet's
  // actual rendered edge (panelAnchor, reported by CaseSheet), recomputed as
  // the map moves. Desktop-anchored-sheet only — the mobile bottom sheet is
  // left as-is (out of scope for TG004).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const target = mappableCases(cases).find((c) => c.slug === selectedSlug);
    // TG006I Scope B: tether is a desktop-floating-panel-only affordance —
    // raised from the pre-TG006I 768px check to DESKTOP_MIN (1024px) now
    // that 768-1023px is its own tablet adaptive-sheet geometry (see
    // global.css), which the tether line would misalign against.
    const isDesktop = () => window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`).matches;

    if (!target || !isDesktop()) {
      setTetherPoint(null);
      return;
    }

    const update = () => {
      const p = map.project([target.coordinates.longitude, target.coordinates.latitude]);
      setTetherPoint({ x: p.x, y: p.y });
    };

    update();
    map.on("move", update);
    window.addEventListener("resize", update);

    return () => {
      map.off("move", update);
      window.removeEventListener("resize", update);
    };
  }, [selectedSlug, cases, mapReady]);

  // Deterministic reset: recenter/re-zoom/re-bearing/un-pitch to the curated
  // DhUB home view (HOME_BEARING, not north-up) regardless of current
  // pan/zoom/bearing/selection.
  const handleReset = () => {
    mapRef.current?.easeTo({ ...homeView(cases), duration: reducedMotion ? 0 : RESET_EASE_MS });
  };

  const handlePan = (dx: number, dy: number) => {
    mapRef.current?.panBy([dx, dy], { duration: reducedMotion ? 0 : 300 });
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: reducedMotion ? 0 : 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: reducedMotion ? 0 : 300 });
  };

  // Explicit, discoverable rotation: a restrained fixed step rather than a
  // continuous drag gesture, since the removed NavigationControl's compass
  // drag-to-rotate is gone along with it.
  const handleRotate = (direction: 1 | -1) => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      bearing: map.getBearing() + direction * ROTATE_STEP_DEG,
      duration: reducedMotion ? 0 : 300,
    });
  };

  // TG006D Settings actions — real camera behaviors only, no persisted
  // preferences. North-up/editorial orientation change bearing alone
  // (center/zoom/pitch untouched); reset is the existing full home view.
  useImperativeHandle(
    ref,
    () => ({
      reset: handleReset,
      setNorthUp: () => {
        mapRef.current?.easeTo({ bearing: 0, duration: reducedMotion ? 0 : RESET_EASE_MS });
      },
      setEditorialOrientation: () => {
        mapRef.current?.easeTo({ bearing: HOME_BEARING, duration: reducedMotion ? 0 : RESET_EASE_MS });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reducedMotion, cases]
  );

  // Explicit reset shortcut ("0"), scoped to when the map canvas itself is
  // focused — never fires while focus is on a button/link/dialog, so it
  // can't fight CaseSheet or MapControls keyboard use. Arrow-key pan and
  // +/- zoom are MapLibre's native keyboard handler (enabled by default,
  // same focus scoping) and need no custom binding here.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const canvas = map.getCanvas();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "0" || document.activeElement !== canvas) return;
      e.preventDefault();
      handleReset();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, reducedMotion]);

  return (
    <div ref={containerRef} role="application" aria-label="Map" className="map-view">
      <MapControls
        mode={deviceClass}
        disabled={!mapReady}
        onPan={handlePan}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onReset={handleReset}
      />
      {tetherPoint && panelAnchor && (
        <svg className="map-tether" aria-hidden="true">
          <line
            className="map-tether__line"
            x1={tetherPoint.x}
            y1={tetherPoint.y}
            x2={panelAnchor.x}
            y2={panelAnchor.y}
          />
          <circle className="map-tether__joint" cx={tetherPoint.x} cy={tetherPoint.y} r={4} />
          <rect
            className="map-tether__joint"
            x={panelAnchor.x - 3}
            y={panelAnchor.y - 3}
            width={6}
            height={6}
          />
        </svg>
      )}
      {hoverLabel && (
        <div
          className="map-hover-label"
          style={{ left: hoverLabel.x, top: hoverLabel.y }}
          aria-hidden="true"
        >
          {hoverLabel.title}
        </div>
      )}
    </div>
  );
});

export default MapView;
