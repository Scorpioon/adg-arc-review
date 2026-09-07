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
import { useT } from "../i18n/context";
import type { CameraState } from "./MapView";
import type { Milestone, ReadinessFailure, ReadinessStatus, ReadinessWarning } from "../hooks/useReadiness";
import type { PhysicalEntryManifest } from "../lib/deepLink";

const EXPORT_SCHEMA = "adgarc.devtools.mapPaint.v2";
const LOD_EXPORT_SCHEMA = "adgarc.devtools.mapLod.v1";

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
//
// TG006I Scope E: section titles/notes, action buttons, status/debug labels
// and milestone names route through the i18n catalog (ADGARC-FB-010 "...at
// minimum include: Developer Tools UI/actions/status labels"). Per-role
// technical labels (EDITABLE_MAP_PAINT_ROLES/EDITABLE_LOD_ROLES `.label`,
// e.g. "Background / land") are a deliberate exception — see es.ts's header
// comment for the scoping rationale.
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
  const t = useT();
  const MILESTONE_LABELS: Record<Milestone, string> = {
    boot: t("devtools.milestone.boot"),
    reactMounted: t("devtools.milestone.reactMounted"),
    mapCreated: t("devtools.milestone.mapCreated"),
    styleLoaded: t("devtools.milestone.styleLoaded"),
    layersReady: t("devtools.milestone.layersReady"),
    ready: t("devtools.milestone.ready"),
  };

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
            {hexInvalid && alphaInvalid
              ? t("devtools.error.invalidHexAndAlpha")
              : hexInvalid
                ? t("devtools.error.invalidHex")
                : t("devtools.error.invalidAlpha")}
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
            {t("devtools.lod.visible")}
          </label>
        )}

        {capabilities.minZoom && (
          <label className="dev-tools__lod-field">
            {t("devtools.lod.minZoom")}
            <input
              type="number"
              className="dev-tools__lod-number"
              placeholder={t("devtools.lod.minZoomPlaceholder")}
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
              {t("devtools.lod.opacityByBand")}
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
              {t("devtools.lod.scaleByBand")}
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
        <h3>{t("devtools.mapPalette.title")}</h3>
        <p className="dev-tools__section-note">{t("devtools.mapPalette.note")}</p>
        <div className="dev-tools__roles">{cartographyRoles.map(renderRole)}</div>
      </section>

      <section className="app-modal__section">
        <h3>{t("devtools.mapOverlays.title")}</h3>
        <p className="dev-tools__section-note">{t("devtools.mapOverlays.note")}</p>
        <div className="dev-tools__roles">{markerRoles.map(renderRole)}</div>
        <p className="dev-tools__derived">
          {t("devtools.derivedPrefix")}{" "}
          {DERIVED_MAP_PAINT_ROLES.map((d) => `${d.label} (${d.derivedFrom})`).join(", ")}.
        </p>
      </section>

      <section className="app-modal__section">
        <h3>{t("devtools.zoomLod.title")}</h3>
        <p className="dev-tools__section-note">{t("devtools.zoomLod.note")}</p>

        <dl className="dev-tools__debug">
          <dt>{t("devtools.debug.currentZoom")}</dt>
          <dd>{cameraState ? cameraState.zoom.toFixed(2) : "—"}</dd>
          <dt>{t("devtools.debug.currentBand")}</dt>
          <dd>{currentBand ?? "—"}</dd>
        </dl>

        <div className="dev-tools__lod-thresholds">
          <label className="dev-tools__lod-field">
            {t("devtools.lod.districtLabel")}
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
            {t("devtools.lod.buildingLabel")}
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
              {t("devtools.lod.thresholdError")}
            </span>
          )}
        </div>

        <div className="dev-tools__lod-roles">{lod.roleMeta.map(renderLodRole)}</div>
        <p className="dev-tools__derived">
          {t("devtools.derivedPrefix")}{" "}
          {DERIVED_LOD_ROLES.map((d) => `${d.label} (${d.derivedFrom})`).join(", ")}. {t("devtools.lod.placesNote")}
        </p>

        <div className="dev-tools__actions">
          <button type="button" className="settings-actions__btn" onClick={handleLodReset}>
            {t("devtools.lod.reset")}
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleLodCopy}>
            {t("devtools.lod.copy")}
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleLodExport}>
            {t("devtools.lod.export")}
          </button>
        </div>
        {lodCopyStatus === "copied" && <p className="app-modal__note">{t("devtools.copiedGeneric")}</p>}
        {lodCopyStatus === "failed" && <p className="dev-tools__error">{t("devtools.copyFailed")}</p>}
      </section>

      <section className="app-modal__section">
        <h3>{t("devtools.runtime.title")}</h3>
        <p className="dev-tools__section-note">{t("devtools.runtime.note")}</p>
        <dl className="dev-tools__debug">
          <dt>{t("devtools.runtime.zoom")}</dt>
          <dd>{cameraState ? cameraState.zoom.toFixed(2) : "—"}</dd>
          <dt>{t("devtools.runtime.bearing")}</dt>
          <dd>{cameraState ? `${cameraState.bearing.toFixed(1)}°` : "—"}</dd>
          <dt>{t("devtools.runtime.pitch")}</dt>
          <dd>{cameraState ? `${cameraState.pitch.toFixed(1)}°` : "—"}</dd>
          <dt>{t("devtools.runtime.selectedCase")}</dt>
          <dd>{selectedCaseLabel ?? t("devtools.runtime.selectedCaseNone")}</dd>
          <dt>{t("devtools.runtime.readiness")}</dt>
          <dd>{readinessReady ? t("devtools.runtime.readinessReady") : `${readinessProgress}%`}</dd>
          <dt>{t("devtools.runtime.readinessStatus")}</dt>
          <dd>{readinessStatus}</dd>
          <dt>{t("devtools.runtime.productVersion")}</dt>
          <dd>{PRODUCT_VERSION}</dd>
        </dl>

        {readinessFailure && (
          <p className="dev-tools__error" role="alert">
            {t("devtools.runtime.fatal", {
              message: readinessFailure.message,
              milestone: readinessFailure.lastMilestone,
            })}
          </p>
        )}

        <p className="dev-tools__section-note" style={{ marginTop: "0.75rem" }}>
          {t("devtools.runtime.timingsLabel")}
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
              {t("devtools.runtime.warningsLabel")}
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
        <h3>{t("devtools.persistence.title")}</h3>
        <p className="dev-tools__section-note">{t("devtools.persistence.note")}</p>
        <div className="dev-tools__actions">
          <button type="button" className="settings-actions__btn" onClick={handleReset}>
            {t("devtools.persistence.resetDefaults")}
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleCopy}>
            {t("devtools.persistence.copyConfig")}
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleExport}>
            {t("devtools.persistence.exportJson")}
          </button>
        </div>
        {copyStatus === "copied" && <p className="app-modal__note">{t("devtools.copiedGeneric")}</p>}
        {copyStatus === "failed" && <p className="dev-tools__error">{t("devtools.copyFailed")}</p>}
      </section>

      <section className="app-modal__section">
        <h3>{t("devtools.physicalEntry.title")}</h3>
        <p className="dev-tools__section-note">{t("devtools.physicalEntry.note")}</p>

        <dl className="dev-tools__debug">
          <dt>{t("devtools.physicalEntry.origin")}</dt>
          <dd>{physicalEntry.origin}</dd>
          <dt>{t("devtools.physicalEntry.baseUrl")}</dt>
          <dd>{physicalEntry.baseUrl}</dd>
          <dt>{t("devtools.physicalEntry.hostingMode")}</dt>
          <dd>{physicalEntry.hostingMode}</dd>
          <dt>{t("devtools.physicalEntry.caseCount")}</dt>
          <dd>{physicalEntry.manifest.entries.length}</dd>
        </dl>

        {selectedEntry && (
          <p className="dev-tools__section-note" style={{ marginTop: "0.6rem" }}>
            {t("devtools.physicalEntry.selectedUrlLabel")}{" "}
            <span className="dev-tools__physical-url">{selectedEntry.url}</span>{" "}
            <button
              type="button"
              className="settings-actions__btn"
              onClick={() => handleCopyEntryUrl(selectedEntry.slug, selectedEntry.url)}
            >
              {copiedEntrySlug === selectedEntry.slug
                ? t("devtools.physicalEntry.copied")
                : t("devtools.physicalEntry.copyUrl")}
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
                {copiedEntrySlug === entry.slug
                  ? t("devtools.physicalEntry.copied")
                  : t("devtools.physicalEntry.copyUrl")}
              </button>
            </li>
          ))}
        </ol>

        <div className="dev-tools__actions">
          <button type="button" className="settings-actions__btn" onClick={handleCopyManifest}>
            {t("devtools.physicalEntry.copyManifest")}
          </button>
          <button type="button" className="settings-actions__btn" onClick={handleExportManifest}>
            {t("devtools.physicalEntry.exportManifest")}
          </button>
        </div>
        {manifestCopyStatus === "copied" && (
          <p className="app-modal__note">{t("devtools.physicalEntry.manifestCopied")}</p>
        )}
        {manifestCopyStatus === "failed" && <p className="dev-tools__error">{t("devtools.copyFailed")}</p>}
      </section>
    </div>
  );
}
