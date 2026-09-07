import { Fragment, useState } from "react";
import {
  DERIVED_MAP_PAINT_ROLES,
  paintToCss,
  type EditableMapPaintRoleId,
  type EditableMapPaintRoleMeta,
  type EffectiveMapPaint,
} from "../config/mapPaint";
import {
  DERIVED_LOD_ROLES,
  deriveBand,
  type EditableLodRoleId,
  type EditableLodRoleMeta,
  type LodRoleOverride,
  type ZoomBandThresholds,
} from "../config/mapLod";
import { PRODUCT_VERSION } from "../config/devtools";
import type { CameraState } from "./MapView";
import type { Milestone, ReadinessFailure, ReadinessStatus, ReadinessWarning } from "../hooks/useReadiness";
import type { PhysicalEntryManifest } from "../lib/deepLink";

const EXPORT_SCHEMA = "adgarc.devtools.mapPaint.v2";
const LOD_EXPORT_SCHEMA = "adgarc.devtools.mapLod.v1";

const MILESTONE_LABELS: Record<Milestone, string> = {
  boot: "Boot",
  reactMounted: "React mounted",
  mapCreated: "Map created",
  styleLoaded: "Style loaded",
  layersReady: "Layers ready",
  ready: "Ready / idle",
};

export interface DevToolsLodProps {
  roleMeta: EditableLodRoleMeta[];
  roles: Record<EditableLodRoleId, LodRoleOverride>;
  thresholds: ZoomBandThresholds;
  onSetRoleOverride: (role: EditableLodRoleId, patch: Partial<LodRoleOverride>) => boolean;
  onSetThresholds: (thresholds: ZoomBandThresholds) => boolean;
  onReset: () => void;
}

export interface DevToolsPhysicalEntryProps {
  origin: string;
  baseUrl: string;
  hostingMode: "root" | "subpath";
  manifest: PhysicalEntryManifest;
  selectedCaseSlug: string | null;
}

export interface DevToolsProps {
  roles: EditableMapPaintRoleMeta[];
  effective: EffectiveMapPaint;
  onSetOverride: (role: EditableMapPaintRoleId, patch: { hex?: string; alpha?: number | string }) => boolean;
  onReset: () => void;
  cameraState: CameraState | null;
  selectedCaseLabel: string | null;
  readinessProgress: number;
  readinessReady: boolean;
  // TG006F Scope F/G additions — see useReadiness.ts.
  readinessStatus: ReadinessStatus;
  readinessFailure: ReadinessFailure | null;
  readinessWarnings: ReadinessWarning[];
  readinessTimings: Partial<Record<Milestone, number>>;
  // TG006F Scope C: semantic LOD registry, parallel to the paint props above.
  lod: DevToolsLodProps;
  // TG006H Scope G: physical-totem / QR entry-point registry, parallel to
  // the paint/LOD props above.
  physicalEntry: DevToolsPhysicalEntryProps;
}

function buildExportConfig(effective: EffectiveMapPaint) {
  return { schema: EXPORT_SCHEMA, productVersion: PRODUCT_VERSION, roles: effective };
}

function buildLodExportConfig(lod: DevToolsLodProps) {
  return { schema: LOD_EXPORT_SCHEMA, productVersion: PRODUCT_VERSION, thresholds: lod.thresholds, roles: lod.roles };
}

// TG006E Scope B/E/F/G, corrective pass §4/§5; TG006F adds a fifth section
// (Zoom / LOD): internal-only surface (visibility gated by DEVTOOLS_ENABLED,
// checked in App.tsx/AppMenuModal.tsx — re-checking here is unnecessary
// since this component is never mounted when disabled). No backend, no
// auth, no persisted product-content state.
export default function DevTools({
  roles,
  effective,
  onSetOverride,
  onReset,
  cameraState,
  selectedCaseLabel,
  readinessProgress,
  readinessReady,
  readinessStatus,
  readinessFailure,
  readinessWarnings,
  readinessTimings,
  lod,
  physicalEntry,
}: DevToolsProps) {
  // Per-role invalid-input flag only — valid edits flow straight through
  // `effective` (the controlled input value), so there is no separate
  // "draft" text state to keep in sync.
  const [invalidHex, setInvalidHex] = useState<ReadonlySet<EditableMapPaintRoleId>>(new Set());
  const [invalidAlpha, setInvalidAlpha] = useState<ReadonlySet<EditableMapPaintRoleId>>(new Set());
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [lodCopyStatus, setLodCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [invalidThresholds, setInvalidThresholds] = useState(false);
  const [copiedEntrySlug, setCopiedEntrySlug] = useState<string | null>(null);
  const [manifestCopyStatus, setManifestCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const handleHexInput = (role: EditableMapPaintRoleId, value: string) => {
    const ok = onSetOverride(role, { hex: value });
    setInvalidHex((prev) => {
      const next = new Set(prev);
      if (ok) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleAlphaInput = (role: EditableMapPaintRoleId, value: string) => {
    const ok = onSetOverride(role, { alpha: value });
    setInvalidAlpha((prev) => {
      const next = new Set(prev);
      if (ok) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleReset = () => {
    onReset();
    setInvalidHex(new Set());
    setInvalidAlpha(new Set());
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildExportConfig(effective), null, 2));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(buildExportConfig(effective), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adgarc-map-paint.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleThresholdInput = (field: keyof ZoomBandThresholds, raw: string) => {
    const value = Number(raw);
    const ok = onSetThresholdsField(field, value);
    setInvalidThresholds(!ok);
  };

  const onSetThresholdsField = (field: keyof ZoomBandThresholds, value: number): boolean =>
    lod.onSetThresholds({ ...lod.thresholds, [field]: value });

  const handleLodReset = () => {
    lod.onReset();
    setInvalidThresholds(false);
  };

  const handleLodCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildLodExportConfig(lod), null, 2));
      setLodCopyStatus("copied");
    } catch {
      setLodCopyStatus("failed");
    }
  };

  const handleLodExport = () => {
    const blob = new Blob([JSON.stringify(buildLodExportConfig(lod), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adgarc-map-lod.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyEntryUrl = async (slug: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedEntrySlug(slug);
      window.setTimeout(() => setCopiedEntrySlug((cur) => (cur === slug ? null : cur)), 1500);
    } catch {
      setCopiedEntrySlug(null);
    }
  };

  const handleCopyManifest = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(physicalEntry.manifest, null, 2));
      setManifestCopyStatus("copied");
    } catch {
      setManifestCopyStatus("failed");
    }
  };

  const handleExportManifest = () => {
    const blob = new Blob([JSON.stringify(physicalEntry.manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adgarc-physical-entry-manifest.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const selectedEntry = physicalEntry.selectedCaseSlug
    ? physicalEntry.manifest.entries.find((e) => e.slug === physicalEntry.selectedCaseSlug) ?? null
    : null;

  const cartographyRoles = roles.filter((r) => r.group === "cartography");
  const markerRoles = roles.filter((r) => r.group === "markers");

  const currentBand = cameraState ? deriveBand(cameraState.zoom, lod.thresholds) : null;

  const renderRole = (role: EditableMapPaintRoleMeta) => {
    const value = effective[role.id];
    const hexInvalid = invalidHex.has(role.id);
    const alphaInvalid = invalidAlpha.has(role.id);
    return (
      <div className="dev-tools__role" key={role.id}>
        <div
          className="dev-tools__swatch"
          style={{ background: paintToCss(value) }}
          aria-hidden="true"
        />
        <div className="dev-tools__role-meta">
          <span className="dev-tools__role-label">{role.label}</span>
          <span className="dev-tools__role-id">{role.id}</span>
        </div>
        <input
          type="color"
          className="dev-tools__color-input"
          value={value.hex}
          aria-label={`${role.label} color picker`}
          onChange={(e) => handleHexInput(role.id, e.target.value)}
        />
        <input
          type="text"
          className="dev-tools__hex-input"
          defaultValue={value.hex}
          key={`${role.id}-hex-${value.hex}`}
          aria-label={`${role.label} hex value`}
          aria-invalid={hexInvalid}
          onChange={(e) => handleHexInput(role.id, e.target.value)}
        />
        <div className="dev-tools__alpha">
          <input
            type="range"
            className="dev-tools__alpha-slider"
            min={0}
            max={1}
            step={0.01}
            value={value.alpha}
            aria-label={`${role.label} alpha`}
            onChange={(e) => handleAlphaInput(role.id, e.target.value)}
          />
          <input
            type="number"
            className="dev-tools__alpha-input"
            min={0}
            max={1}
            step={0.01}
            defaultValue={value.alpha}
            key={`${role.id}-alpha-${value.alpha}`}
            aria-label={`${role.label} alpha value`}
            aria-invalid={alphaInvalid}
            onChange={(e) => handleAlphaInput(role.id, e.target.value)}
          />
        </div>
        {(hexInvalid || alphaInvalid) && (
          <span className="dev-tools__error" role="alert">
            {hexInvalid && alphaInvalid ? "Invalid hex and alpha" : hexInvalid ? "Invalid hex" : "Invalid alpha"}
          </span>
        )}
      </div>
    );
  };

  const renderLodRole = (role: EditableLodRoleMeta) => {
    const value = lod.roles[role.id];
    const { capabilities } = role;

    const handleOpacityToggle = (checked: boolean) => {
      lod.onSetRoleOverride(role.id, { opacity: checked ? [1, 1, 1] : null });
    };
    const handleOpacityBand = (index: 0 | 1 | 2, raw: string) => {
      if (!value.opacity) return;
      const next: [number, number, number] = [...value.opacity];
      next[index] = Number(raw);
      lod.onSetRoleOverride(role.id, { opacity: next });
    };

    const handleScaleToggle = (checked: boolean) => {
      lod.onSetRoleOverride(role.id, { scale: checked ? [1, 1, 1] : null });
    };
    const handleScaleBand = (index: 0 | 1 | 2, raw: string) => {
      if (!value.scale) return;
      const next: [number, number, number] = [...value.scale];
      next[index] = Number(raw);
      lod.onSetRoleOverride(role.id, { scale: next });
    };

    return (
      <div className="dev-tools__lod-role" key={role.id}>
        <div className="dev-tools__role-meta">
          <span className="dev-tools__role-label">{role.label}</span>
          <span className="dev-tools__role-id">{role.id}</span>
        </div>

        {capabilities.visible && (
          <label className="dev-tools__lod-field">
            <input
              type="checkbox"
              checked={value.visible}
              onChange={(e) => lod.onSetRoleOverride(role.id, { visible: e.target.checked })}
            />
            Visible
          </label>
        )}

        {capabilities.minZoom && (
          <label className="dev-tools__lod-field">
            Min zoom
            <input
              type="number"
              className="dev-tools__lod-number"
              placeholder="inherited"
              defaultValue={value.minZoom ?? ""}
              key={`${role.id}-minzoom-${value.minZoom ?? "inherited"}`}
              min={0}
              max={24}
              step={0.1}
              onChange={(e) =>
                lod.onSetRoleOverride(role.id, { minZoom: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </label>
        )}

        {capabilities.opacity && (
          <div className="dev-tools__lod-triplet">
            <label className="dev-tools__lod-field">
              <input type="checkbox" checked={value.opacity !== null} onChange={(e) => handleOpacityToggle(e.target.checked)} />
              Opacity by band
            </label>
            {value.opacity && (
              <span className="dev-tools__lod-bands">
                {(["CITY", "DISTRICT", "BUILDING"] as const).map((band, i) => (
                  <input
                    key={`${band}-${value.opacity![i]}`}
                    type="number"
                    className="dev-tools__lod-number"
                    aria-label={`${role.label} ${band} opacity`}
                    title={band}
                    min={0}
                    max={1}
                    step={0.05}
                    defaultValue={value.opacity![i]}
                    onChange={(e) => handleOpacityBand(i as 0 | 1 | 2, e.target.value)}
                  />
                ))}
              </span>
            )}
          </div>
        )}

        {capabilities.scale && (
          <div className="dev-tools__lod-triplet">
            <label className="dev-tools__lod-field">
              <input type="checkbox" checked={value.scale !== null} onChange={(e) => handleScaleToggle(e.target.checked)} />
              Scale by band
            </label>
            {value.scale && (
              <span className="dev-tools__lod-bands">
                {(["CITY", "DISTRICT", "BUILDING"] as const).map((band, i) => (
                  <input
                    key={`${band}-${value.scale![i]}`}
                    type="number"
                    className="dev-tools__lod-number"
                    aria-label={`${role.label} ${band} scale`}
                    title={band}
                    min={0.1}
                    max={4}
                    step={0.05}
                    defaultValue={value.scale![i]}
                    onChange={(e) => handleScaleBand(i as 0 | 1 | 2, e.target.value)}
                  />
                ))}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dev-tools">
      <section className="app-modal__section">
        <h3>Map palette</h3>
        <p className="dev-tools__section-note">Land, water, buildings, and road styling.</p>
        <div className="dev-tools__roles">{cartographyRoles.map(renderRole)}</div>
      </section>

      <section className="app-modal__section">
        <h3>Map overlays / markers</h3>
        <p className="dev-tools__section-note">Case marker states rendered on the map.</p>
        <div className="dev-tools__roles">{markerRoles.map(renderRole)}</div>
        <p className="dev-tools__derived">
          Derived (not independently editable — mirrors the role in parentheses):{" "}
          {DERIVED_MAP_PAINT_ROLES.map((d) => `${d.label} (${d.derivedFrom})`).join(", ")}.
        </p>
      </section>

      <section className="app-modal__section">
        <h3>Zoom / LOD</h3>
        <p className="dev-tools__section-note">
          Semantic zoom-band density (FB031) — CITY / DISTRICT / BUILDING. Controls the ADG-ARC
          treatment layered on top of the upstream basemap; roles left "inherited" leave the
          upstream layer's own zoom behavior untouched.
        </p>

        <dl className="dev-tools__debug">
          <dt>Current zoom</dt>
          <dd>{cameraState ? cameraState.zoom.toFixed(2) : "—"}</dd>
          <dt>Current band</dt>
          <dd>{currentBand ?? "—"}</dd>
        </dl>

        <div className="dev-tools__lod-thresholds">
          <label className="dev-tools__lod-field">
            DISTRICT starts at zoom
            <input
              type="number"
              className="dev-tools__lod-number"
              min={0}
              max={24}
              step={0.1}
              defaultValue={lod.thresholds.districtMin}
              key={`districtMin-${lod.thresholds.districtMin}`}
              aria-invalid={invalidThresholds}
              onChange={(e) => handleThresholdInput("districtMin", e.target.value)}
            />
          </label>
          <label className="dev-tools__lod-field">
            BUILDING starts at zoom
            <input
              type="number"
              className="dev-tools__lod-number"
              min={0}
              max={24}
              step={0.1}
              defaultValue={lod.thresholds.buildingMin}
              key={`buildingMin-${lod.thresholds.buildingMin}`}
              aria-invalid={invalidThresholds}
              onChange={(e) => handleThresholdInput("buildingMin", e.target.value)}
            />
          </label>
          {invalidThresholds && (
            <span className="dev-tools__error" role="alert">
              Thresholds must be ordered (0 ≤ DISTRICT &lt; BUILDING ≤ 24) — rejected, previous
              value kept.
            </span>
          )}
        </div>

        <div className="dev-tools__lod-roles">{lod.roleMeta.map(renderLodRole)}</div>
        <p className="dev-tools__derived">
          Derived (not independently editable — mirrors the role in parentheses):{" "}
          {DERIVED_LOD_ROLES.map((d) => `${d.label} (${d.derivedFrom})`).join(", ")}. Place/POI
          labels are not modeled — the atlas classifier already drops them entirely. The optional
          case hover label is a DOM overlay, not a MapLibre layer, so it has no LOD role either.
        </p>

        <div className="dev-tools__actions">
          <button type="button" className="settings-actions__btn" onClick={handleLodReset}>
            Reset LOD
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleLodCopy}>
            Copy LOD config
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleLodExport}>
            Export LOD JSON
          </button>
        </div>
        {lodCopyStatus === "copied" && <p className="app-modal__note">Copied to clipboard.</p>}
        {lodCopyStatus === "failed" && <p className="dev-tools__error">Copy failed — clipboard unavailable.</p>}
      </section>

      <section className="app-modal__section">
        <h3>Runtime / Map state</h3>
        <p className="dev-tools__section-note">Read-only values captured live for review.</p>
        <dl className="dev-tools__debug">
          <dt>Zoom</dt>
          <dd>{cameraState ? cameraState.zoom.toFixed(2) : "—"}</dd>
          <dt>Bearing</dt>
          <dd>{cameraState ? `${cameraState.bearing.toFixed(1)}°` : "—"}</dd>
          <dt>Pitch</dt>
          <dd>{cameraState ? `${cameraState.pitch.toFixed(1)}°` : "—"}</dd>
          <dt>Selected case</dt>
          <dd>{selectedCaseLabel ?? "None"}</dd>
          <dt>Readiness</dt>
          <dd>{readinessReady ? "Ready" : `${readinessProgress}%`}</dd>
          <dt>Readiness status</dt>
          <dd>{readinessStatus}</dd>
          <dt>Product version</dt>
          <dd>{PRODUCT_VERSION}</dd>
        </dl>

        {readinessFailure && (
          <p className="dev-tools__error" role="alert">
            Fatal: {readinessFailure.message} (last completed milestone: {readinessFailure.lastMilestone})
          </p>
        )}

        <p className="dev-tools__section-note" style={{ marginTop: "0.75rem" }}>
          Lifecycle timings (ms since boot):
        </p>
        <dl className="dev-tools__debug">
          {(Object.keys(MILESTONE_LABELS) as Milestone[]).map((m) => (
            <Fragment key={m}>
              <dt>{MILESTONE_LABELS[m]}</dt>
              <dd>{readinessTimings[m] !== undefined ? `${readinessTimings[m]}ms` : "—"}</dd>
            </Fragment>
          ))}
        </dl>

        {readinessWarnings.length > 0 && (
          <>
            <p className="dev-tools__section-note" style={{ marginTop: "0.75rem" }}>
              Recent nonfatal map warnings (most recent first):
            </p>
            <ul className="dev-tools__derived">
              {readinessWarnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="app-modal__section">
        <h3>Persistence / Config actions</h3>
        <p className="dev-tools__section-note">Save, reset, or export the working palette.</p>
        <div className="dev-tools__actions">
          <button type="button" className="settings-actions__btn" onClick={handleReset}>
            Reset to defaults
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleCopy}>
            Copy config
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleExport}>
            Export JSON
          </button>
        </div>
        {copyStatus === "copied" && <p className="app-modal__note">Copied to clipboard.</p>}
        {copyStatus === "failed" && <p className="dev-tools__error">Copy failed — clipboard unavailable.</p>}
      </section>

      <section className="app-modal__section">
        <h3>Physical entry / QR targets</h3>
        <p className="dev-tools__section-note">
          Canonical physical-totem → QR → digital-case entry points, derived from the case
          dataset's physical/digital classification. No QR artwork is generated here.
        </p>

        <dl className="dev-tools__debug">
          <dt>Origin</dt>
          <dd>{physicalEntry.origin}</dd>
          <dt>BASE_URL</dt>
          <dd>{physicalEntry.baseUrl}</dd>
          <dt>Hosting mode</dt>
          <dd>{physicalEntry.hostingMode}</dd>
          <dt>Physical+digital cases</dt>
          <dd>{physicalEntry.manifest.entries.length}</dd>
        </dl>

        {selectedEntry && (
          <p className="dev-tools__section-note" style={{ marginTop: "0.6rem" }}>
            Selected case URL: <span className="dev-tools__physical-url">{selectedEntry.url}</span>{" "}
            <button
              type="button"
              className="settings-actions__btn"
              onClick={() => handleCopyEntryUrl(selectedEntry.slug, selectedEntry.url)}
            >
              {copiedEntrySlug === selectedEntry.slug ? "Copied" : "Copy URL"}
            </button>
          </p>
        )}

        <ol className="dev-tools__physical-list">
          {physicalEntry.manifest.entries.map((entry) => (
            <li className="dev-tools__physical-row" key={entry.slug}>
              <span className="dev-tools__physical-name">{entry.title}</span>
              <span className="dev-tools__physical-url">{entry.url}</span>
              <button
                type="button"
                className="settings-actions__btn"
                onClick={() => handleCopyEntryUrl(entry.slug, entry.url)}
              >
                {copiedEntrySlug === entry.slug ? "Copied" : "Copy URL"}
              </button>
            </li>
          ))}
        </ol>

        <div className="dev-tools__actions">
          <button type="button" className="settings-actions__btn" onClick={handleCopyManifest}>
            Copy manifest
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleExportManifest}>
            Export manifest JSON
          </button>
        </div>
        {manifestCopyStatus === "copied" && <p className="app-modal__note">Manifest copied to clipboard.</p>}
        {manifestCopyStatus === "failed" && (
          <p className="dev-tools__error">Copy failed — clipboard unavailable.</p>
        )}
      </section>
    </div>
  );
}
