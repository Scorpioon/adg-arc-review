import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapView, { type CameraState, type MapViewHandle } from "./components/MapView";
import CaseSheet, { type PanelAnchor } from "./components/CaseSheet";
import AppMenuModal, { type MenuDestination } from "./components/AppMenuModal";
import LoadingScreen from "./components/LoadingScreen";
import { cases, findCaseBySlug } from "./data/cases";
import { useCaseParam } from "./hooks/useCaseParam";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useReadiness } from "./hooks/useReadiness";
import { useMapPaintOverrides } from "./hooks/useMapPaintOverrides";
import { useMapLodOverrides } from "./hooks/useMapLodOverrides";
import { DEVTOOLS_ENABLED } from "./config/devtools";
import type { EffectiveLodConfig } from "./config/mapLod";
import { buildPhysicalEntryManifest } from "./lib/deepLink";

// Purely cosmetic post-ready fade duration for LoadingScreen — see its
// comment for why this doesn't count as fake progress.
const LOADING_EXIT_MS = 400;

// App owns all editorial/application state. The map is mounted once by
// MapView and persists across state changes; no React Router is used —
// ?case=<slug> deep links are read/written directly via the History API.
export default function App() {
  const [caseSlug, setCaseSlug] = useCaseParam();
  const activeCase = useMemo(() => findCaseBySlug(caseSlug), [caseSlug]);
  const reducedMotion = usePrefersReducedMotion();
  const [panelAnchor, setPanelAnchor] = useState<PanelAnchor | null>(null);

  const readiness = useReadiness();
  useEffect(() => {
    // Fires only after React's first commit — a distinct real lifecycle
    // event from the hook's own initialization ("boot"; see useReadiness.ts).
    readiness.complete("reactMounted");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loadingVisible, setLoadingVisible] = useState(true);
  useEffect(() => {
    if (!readiness.ready) return;
    if (reducedMotion) {
      setLoadingVisible(false);
      return;
    }
    const id = window.setTimeout(() => setLoadingVisible(false), LOADING_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [readiness.ready, reducedMotion]);

  // TG006E Scope A / corrective-pass §2: application-menu open/active-pane
  // state lives here (App/application-shell state), per the handoff —
  // AppMenuModal is presentational.
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuActive, setMenuActive] = useState<MenuDestination | null>(null);
  const mapViewRef = useRef<MapViewHandle | null>(null);

  // TG006E corrective pass §3 — overlay exclusivity rule: opening the
  // application menu always clears the canonical case selection first, so
  // an open CaseSheet closes through the same App-owned setter the map and
  // Cases pane use — never a second, duplicate "close the sheet" path.
  // Closing/toggling the menu closed does not touch case selection.
  const handleToggleMenu = () => {
    if (!menuOpen) setCaseSlug(null);
    setMenuOpen((open) => !open);
  };

  // Cases-pane selection: same App-owned setCaseSlug as map/prev-next
  // selection. Closes the menu afterward — cleanest map-focused review per
  // the handoff's stated preference — CaseSheet opens and the map focuses
  // on the newly selected case via the existing selection effects. This is
  // also half of the overlay-exclusivity rule: menu and CaseSheet are never
  // simultaneously open (see handleToggleMenu for the other half).
  const handleCaseSelect = (slug: string) => {
    setCaseSlug(slug);
    setMenuOpen(false);
  };

  // TG006E Scope C/D: single runtime paint-config authority, owned here and
  // passed to MapView as a prop — MapView holds no independent palette
  // state (see useMapPaintOverrides.ts).
  const paintOverrides = useMapPaintOverrides();

  // TG006F Scope C/D: single runtime LOD-config authority, parallel to
  // paintOverrides above — MapView holds no independent LOD state either
  // (see useMapLodOverrides.ts). `lodEffective` is memoized so MapView's
  // [lod, mapReady] live-update effect only fires when the LOD config
  // itself actually changes, not on every unrelated App render.
  const lodOverrides = useMapLodOverrides();
  const lodEffective: EffectiveLodConfig = useMemo(
    () => ({ roles: lodOverrides.roles, thresholds: lodOverrides.thresholds }),
    [lodOverrides.roles, lodOverrides.thresholds]
  );

  // TG006H Scope G: Physical entry / QR targets debug-state, parallel to
  // paintOverrides/lodOverrides above — App is the single place that builds
  // the manifest (from the canonical case dataset, not a second slug list)
  // and passes it down to the presentational DevTools component.
  const physicalEntry = useMemo(
    () => ({
      origin: window.location.origin,
      baseUrl: import.meta.env.BASE_URL,
      hostingMode: (import.meta.env.BASE_URL === "/" ? "root" : "subpath") as "root" | "subpath",
      manifest: buildPhysicalEntryManifest(),
    }),
    []
  );

  // TG006E Scope G: camera observation is only wired up while the
  // Developer Tools debug-state pane is actually visible, so ordinary map
  // panning never drives a render loop this milestone doesn't need.
  const [cameraState, setCameraState] = useState<CameraState | null>(null);
  const handleCameraChange = useCallback((state: CameraState) => setCameraState(state), []);
  const devToolsPaneVisible = menuOpen && menuActive === "devtools";

  // TG006F Scope I / FB033: safe development hotkey — opens the application
  // menu directly on Developer Tools. Uses the same App-owned menu state as
  // the trigger button (handleToggleMenu's overlay-exclusivity rule), never
  // a second/duplicate menu-open path. Statically gated by DEVTOOLS_ENABLED
  // (inlined at build time, same flag AppMenuModal/DevTools already gate
  // on) so a normal production build attaches no listener at all — "D" is
  // simply inert, not merely hidden behind a runtime check.
  useEffect(() => {
    if (!DEVTOOLS_ENABLED) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "d" && e.key !== "D") return;
      // Never fire alongside a modifier chord (Ctrl/Meta/Alt) — those are
      // reserved for browser/OS shortcuts, not this app's.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      // Never fire while the user is typing/editing — editable targets and
      // contenteditable regions keep ordinary "d"/"D" character input.
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (target?.isContentEditable) return;

      e.preventDefault();

      if (menuOpen && menuActive === "devtools") {
        // Developer Tools is already the active open pane — toggle-close,
        // the cleaner of the two documented options (handoff Scope I):
        // pressing "D" again dismisses the exact panel it opened.
        setMenuOpen(false);
        return;
      }

      // Same overlay-exclusivity rule as handleToggleMenu: only clear the
      // case selection when actually transitioning the menu from closed to
      // open, never when merely switching the already-open menu's pane.
      if (!menuOpen) setCaseSlug(null);
      setMenuActive("devtools");
      setMenuOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, menuActive, setCaseSlug]);

  return (
    <div className="app" data-reduced-motion={reducedMotion}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <main id="main">
        <AppMenuModal
          open={menuOpen}
          active={menuActive}
          onToggle={handleToggleMenu}
          onClose={() => setMenuOpen(false)}
          onSelectDestination={setMenuActive}
          cases={cases}
          onSelectCase={handleCaseSelect}
          onResetMap={() => mapViewRef.current?.reset()}
          onNorthUp={() => mapViewRef.current?.setNorthUp()}
          onEditorialOrientation={() => mapViewRef.current?.setEditorialOrientation()}
          devTools={{
            roles: paintOverrides.roles,
            effective: paintOverrides.effective,
            onSetOverride: paintOverrides.setOverride,
            onReset: paintOverrides.reset,
            cameraState,
            selectedCaseLabel: activeCase?.identity.name ?? null,
            readinessProgress: readiness.progress,
            readinessReady: readiness.ready,
            readinessStatus: readiness.status,
            readinessFailure: readiness.failure,
            readinessWarnings: readiness.warnings,
            readinessTimings: readiness.timings,
            lod: {
              roleMeta: lodOverrides.roleMeta,
              roles: lodOverrides.roles,
              thresholds: lodOverrides.thresholds,
              onSetRoleOverride: lodOverrides.setRoleOverride,
              onSetThresholds: lodOverrides.setThresholds,
              onReset: lodOverrides.reset,
            },
            physicalEntry: {
              ...physicalEntry,
              selectedCaseSlug: activeCase?.slug ?? null,
            },
          }}
        />
        <MapView
          ref={mapViewRef}
          cases={cases}
          selectedSlug={activeCase?.slug ?? null}
          onSelectCase={setCaseSlug}
          panelAnchor={panelAnchor}
          paint={paintOverrides.effective}
          lod={lodEffective}
          onReadinessMilestone={readiness.complete}
          onReadinessError={readiness.fail}
          onMapWarning={readiness.warn}
          onCameraChange={devToolsPaneVisible ? handleCameraChange : undefined}
        />
        <CaseSheet
          activeCase={activeCase}
          onClose={() => setCaseSlug(null)}
          onAnchorChange={setPanelAnchor}
          cases={cases}
          onSelectCase={setCaseSlug}
        />
      </main>
      {loadingVisible && (
        <LoadingScreen progress={readiness.progress} error={readiness.error} exiting={readiness.ready} />
      )}
    </div>
  );
}
