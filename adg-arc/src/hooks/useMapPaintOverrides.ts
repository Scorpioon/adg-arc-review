import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EDITABLE_MAP_PAINT_ROLES,
  MAP_PAINT_DEFAULTS,
  isEditableRoleId,
  normalizeAlpha,
  normalizeHex,
  paintToCss,
  type EditableMapPaintRoleId,
  type EffectiveMapPaint,
  type MapPaintColor,
} from "../config/mapPaint";

// TG006E Scope F: local-development palette persistence only — never a
// product-content store.
//
// TG006E corrective pass: bumped to schema v2 to add per-role alpha. v1 only
// ever stored opaque hex strings; v2 stores full {hex, alpha} objects. A v1
// payload is migrated in place (alpha defaults to 1, matching the handoff's
// "migrate cleanly to alpha=1 where possible") and the old key is removed so
// a stale v1 record can never be re-read or misinterpreted later.
const STORAGE_KEY_V1 = "adgarc.devtools.mapPaint.v1";
const STORAGE_KEY = "adgarc.devtools.mapPaint.v2";
const SCHEMA_VERSION = 2;

export type StoredOverrides = Partial<Record<EditableMapPaintRoleId, MapPaintColor>>;

interface StoredPayload {
  schemaVersion: number;
  overrides: StoredOverrides;
}

interface LegacyStoredPayload {
  schemaVersion: number;
  overrides: Partial<Record<string, string>>;
}

// Validates one candidate override value against the current schema — every
// unknown role id, non-hex value, or out-of-range alpha is dropped
// per-field, never partially trusted.
function cleanOverrides(candidate: Record<string, unknown>): StoredOverrides {
  const clean: StoredOverrides = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (!isEditableRoleId(key) || typeof value !== "object" || value === null) continue;
    const { hex: rawHex, alpha: rawAlpha } = value as Record<string, unknown>;
    if (typeof rawHex !== "string") continue;
    const hex = normalizeHex(rawHex);
    if (!hex) continue;
    const alpha = normalizeAlpha(typeof rawAlpha === "number" ? rawAlpha : 1);
    if (alpha === null) continue;
    clean[key] = { hex, alpha };
  }
  return clean;
}

// Migrates a v1 payload (hex-only overrides) into v2 shape, alpha=1 for
// every role that had a valid stored hex. Any role whose stored value fails
// hex validation is dropped rather than migrated as a corrupt entry.
function migrateLegacyOverrides(candidate: Record<string, unknown>): StoredOverrides {
  const clean: StoredOverrides = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (!isEditableRoleId(key) || typeof value !== "string") continue;
    const hex = normalizeHex(value);
    if (hex) clean[key] = { hex, alpha: 1 };
  }
  return clean;
}

// Fails closed to canonical defaults (empty overrides) on any malformed,
// unknown-schema, or unknown-role payload — never throws, never partially
// trusts an invalid record. Reads v2 first; if absent, attempts a one-time
// migration from a legacy v1 record and removes the v1 key either way so it
// is never re-read.
function readStoredOverrides(): StoredOverrides {
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<StoredPayload> | null;
      if (
        parsed &&
        parsed.schemaVersion === SCHEMA_VERSION &&
        typeof parsed.overrides === "object" &&
        parsed.overrides !== null
      ) {
        return cleanOverrides(parsed.overrides as Record<string, unknown>);
      }
      return {};
    }

    const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (!rawV1) return {};

    let migrated: StoredOverrides = {};
    try {
      const legacy = JSON.parse(rawV1) as Partial<LegacyStoredPayload> | null;
      if (legacy && legacy.schemaVersion === 1 && typeof legacy.overrides === "object" && legacy.overrides !== null) {
        migrated = migrateLegacyOverrides(legacy.overrides as Record<string, unknown>);
      }
    } catch {
      migrated = {};
    }

    window.localStorage.removeItem(STORAGE_KEY_V1);
    if (Object.keys(migrated).length > 0) persistOverrides(migrated);
    return migrated;
  } catch {
    return {};
  }
}

function persistOverrides(overrides: StoredOverrides): void {
  try {
    if (Object.keys(overrides).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload: StoredPayload = { schemaVersion: SCHEMA_VERSION, overrides };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Local-dev convenience only — a storage failure (quota, private mode)
    // is silently non-fatal; the effective config still resolves from
    // canonical defaults for any role that failed to persist.
  }
}

// TG006E Scope D: single runtime paint-config authority. Canonical defaults
// merge with validated persisted overrides into one `effective` object;
// MapView reads only this, never a second competing palette source. CSS
// map-overlay roles (tether, hover-label border, map-controls chrome) stay
// in sync by mirroring the three marker roles onto the same custom
// properties global.css already declares in :root — no second color
// pipeline for the CSS side.
export function useMapPaintOverrides() {
  const [overrides, setOverridesState] = useState<StoredOverrides>(() => readStoredOverrides());

  const effective: EffectiveMapPaint = useMemo(() => {
    const merged = {} as EffectiveMapPaint;
    for (const role of EDITABLE_MAP_PAINT_ROLES) {
      merged[role.id] = { ...MAP_PAINT_DEFAULTS[role.id], ...overrides[role.id] };
    }
    return merged;
  }, [overrides]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--map-ink", paintToCss(effective["map.caseMarker.default"]));
    root.setProperty("--map-white", paintToCss(effective["map.caseMarker.hover"]));
    root.setProperty("--map-accent", paintToCss(effective["map.caseMarker.selected"]));
  }, [effective]);

  // Rejects (returns false) rather than throwing or writing a corrupt
  // value — callers surface the rejection inline without disturbing the
  // rest of the effective config. `patch` merges onto the role's current
  // effective value so a hex edit doesn't clobber an already-set alpha (or
  // vice versa).
  const setOverride = useCallback(
    (role: EditableMapPaintRoleId, patch: { hex?: string; alpha?: number | string }): boolean => {
      const current = effective[role];
      let nextHex = current.hex;
      let nextAlpha = current.alpha;

      if (patch.hex !== undefined) {
        const hex = normalizeHex(patch.hex);
        if (!hex) return false;
        nextHex = hex;
      }
      if (patch.alpha !== undefined) {
        const alpha = normalizeAlpha(patch.alpha);
        if (alpha === null) return false;
        nextAlpha = alpha;
      }

      setOverridesState((prev) => {
        const next = { ...prev, [role]: { hex: nextHex, alpha: nextAlpha } };
        persistOverrides(next);
        return next;
      });
      return true;
    },
    [effective]
  );

  const reset = useCallback(() => {
    setOverridesState({});
    persistOverrides({});
  }, []);

  return { effective, overrides, setOverride, reset, roles: EDITABLE_MAP_PAINT_ROLES };
}
