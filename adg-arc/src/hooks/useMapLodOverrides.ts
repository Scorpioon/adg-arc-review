import { useCallback, useMemo, useState } from "react";
import {
  CANONICAL_LOD_DEFAULTS,
  CANONICAL_ZOOM_THRESHOLDS,
  EDITABLE_LOD_ROLES,
  isEditableLodRoleId,
  normalizeLodRoleOverride,
  normalizeZoomThresholds,
  type EditableLodRoleId,
  type LodRoleOverride,
  type ZoomBandThresholds,
} from "../config/mapLod";

// TG006F Scope C: local-development LOD persistence only — never a
// product-content store, same contract as useMapPaintOverrides.ts.
const STORAGE_KEY = "adgarc.devtools.mapLod.v1";
const SCHEMA_VERSION = 1;

interface StoredLodPayload {
  schemaVersion: number;
  thresholds: ZoomBandThresholds;
  roles: Partial<Record<EditableLodRoleId, LodRoleOverride>>;
}

// Fails closed to canonical defaults on any malformed, unknown-schema,
// unknown-role, or partially-corrupt payload — never throws, never
// partially trusts a bad threshold pair (an invalid pair drops the whole
// thresholds field back to canonical; each role is validated/dropped
// independently, same fail-safe contract as the paint-override reader).
function readStoredLod(): { thresholds: ZoomBandThresholds; roles: Partial<Record<EditableLodRoleId, LodRoleOverride>> } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { thresholds: CANONICAL_ZOOM_THRESHOLDS, roles: {} };

    const parsed = JSON.parse(raw) as Partial<StoredLodPayload> | null;
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
      return { thresholds: CANONICAL_ZOOM_THRESHOLDS, roles: {} };
    }

    const thresholds = normalizeZoomThresholds(parsed.thresholds) ?? CANONICAL_ZOOM_THRESHOLDS;

    const roles: Partial<Record<EditableLodRoleId, LodRoleOverride>> = {};
    if (typeof parsed.roles === "object" && parsed.roles !== null) {
      for (const [key, value] of Object.entries(parsed.roles)) {
        if (!isEditableLodRoleId(key)) continue;
        const normalized = normalizeLodRoleOverride(value);
        if (normalized) roles[key] = normalized;
      }
    }

    return { thresholds, roles };
  } catch {
    return { thresholds: CANONICAL_ZOOM_THRESHOLDS, roles: {} };
  }
}

function persistLod(thresholds: ZoomBandThresholds, roles: Partial<Record<EditableLodRoleId, LodRoleOverride>>): void {
  try {
    const isCanonicalThresholds =
      thresholds.districtMin === CANONICAL_ZOOM_THRESHOLDS.districtMin &&
      thresholds.buildingMin === CANONICAL_ZOOM_THRESHOLDS.buildingMin;
    if (isCanonicalThresholds && Object.keys(roles).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload: StoredLodPayload = { schemaVersion: SCHEMA_VERSION, thresholds, roles };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Local-dev convenience only — see useMapPaintOverrides.ts's identical
    // comment: a storage failure is silently non-fatal here too.
  }
}

// TG006F Scope C/D: single runtime LOD-config authority, parallel to
// useMapPaintOverrides.ts's paint authority. MapView reads only the
// `effective` config this hook produces — it holds no independent LOD
// state of its own.
export function useMapLodOverrides() {
  const [stored, setStored] = useState(() => readStoredLod());

  const effectiveRoles = useMemo(() => {
    const merged = {} as Record<EditableLodRoleId, LodRoleOverride>;
    for (const role of EDITABLE_LOD_ROLES) {
      merged[role.id] = stored.roles[role.id] ?? CANONICAL_LOD_DEFAULTS[role.id];
    }
    return merged;
  }, [stored.roles]);

  const setRoleOverride = useCallback((role: EditableLodRoleId, patch: Partial<LodRoleOverride>): boolean => {
    const current = effectiveRoles[role];
    const candidate: LodRoleOverride = { ...current, ...patch };
    const normalized = normalizeLodRoleOverride(candidate);
    if (!normalized) return false;

    setStored((prev) => {
      const nextRoles = { ...prev.roles, [role]: normalized };
      persistLod(prev.thresholds, nextRoles);
      return { thresholds: prev.thresholds, roles: nextRoles };
    });
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRoles]);

  const setThresholds = useCallback((candidate: ZoomBandThresholds): boolean => {
    const normalized = normalizeZoomThresholds(candidate);
    if (!normalized) return false;

    setStored((prev) => {
      persistLod(normalized, prev.roles);
      return { thresholds: normalized, roles: prev.roles };
    });
    return true;
  }, []);

  const reset = useCallback(() => {
    setStored({ thresholds: CANONICAL_ZOOM_THRESHOLDS, roles: {} });
    persistLod(CANONICAL_ZOOM_THRESHOLDS, {});
  }, []);

  return {
    thresholds: stored.thresholds,
    roles: effectiveRoles,
    setRoleOverride,
    setThresholds,
    reset,
    roleMeta: EDITABLE_LOD_ROLES,
  };
}
