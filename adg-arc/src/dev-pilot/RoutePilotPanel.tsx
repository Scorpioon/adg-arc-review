// ADG-ARC TG045 / FB-113 — Gate B1 local-only pilot panel.
//
// LOCAL DEVELOPMENT ONLY — see routePilotRegistry.ts's header for the full
// authority chain. This component is reached only via the `import.meta.env.
// DEV`-gated dynamic import in App.tsx; it is never statically imported by
// any always-bundled module. Plain English copy, deliberately outside the
// i18n catalog — this is a throwaway OPERATOR-review prototype, not
// product-facing content, and the original TG045 handoff explicitly
// excludes "fresh typography/visual design scope" and localization from
// this gate.
import { useMemo, useState } from "react";
import type { CaseRecord } from "../data/cases";
import { findRoutePilotDirection, PROVISIONAL_ENDPOINT_SLUGS } from "./routePilotRegistry";
// Prompt 095 correction: styles live here (not src/styles/global.css) so
// they are only ever pulled into the bundle through this module's own
// DEV-gated dynamic import (see App.tsx) — global.css ships in every build
// regardless of `import.meta.env.DEV`, which is exactly how `.route-pilot`
// selectors leaked into the production CSS (`npm run build`'s isolation
// scan hit on `assets/index-*.css`). See RoutePilotPanel.css's own header
// comment for the full mechanism.
import "./RoutePilotPanel.css";

export interface RoutePilotPanelProps {
  cases: CaseRecord[];
  onRouteChange: (feature: GeoJSON.Feature<GeoJSON.LineString> | null) => void;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export default function RoutePilotPanel({ cases, onRouteChange }: RoutePilotPanelProps) {
  const [originSlug, setOriginSlug] = useState("");
  const [destinationSlug, setDestinationSlug] = useState("");

  const direction = useMemo(
    () => findRoutePilotDirection(originSlug, destinationSlug),
    [originSlug, destinationSlug]
  );

  // Switching either selection must clear the previous line before (or
  // instead of) drawing a new one — never leave a stale route visible for
  // a pair that no longer matches the current selection (Gate B1 addendum
  // §2). Identical origin/destination always resolves to `null` via
  // findRoutePilotDirection, which also clears the route.
  const handleOrigin = (slug: string) => {
    setOriginSlug(slug);
    onRouteChange(findRoutePilotDirection(slug, destinationSlug)?.feature ?? null);
  };

  const handleDestination = (slug: string) => {
    setDestinationSlug(slug);
    onRouteChange(findRoutePilotDirection(originSlug, slug)?.feature ?? null);
  };

  const hasBothSelections = originSlug !== "" && destinationSlug !== "";
  const sameSelection = hasBothSelections && originSlug === destinationSlug;
  const endpointIsProvisional =
    PROVISIONAL_ENDPOINT_SLUGS.has(originSlug) || PROVISIONAL_ENDPOINT_SLUGS.has(destinationSlug);

  return (
    <div className="route-pilot" role="group" aria-label="Local route pilot (development only)">
      <p className="route-pilot__badge">LOCAL PILOT — prototype, not for production</p>

      <label className="route-pilot__field">
        <span>Origin</span>
        <select value={originSlug} onChange={(e) => handleOrigin(e.target.value)}>
          <option value="">Select a building…</option>
          {cases.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.identity.name}
            </option>
          ))}
        </select>
      </label>

      <label className="route-pilot__field">
        <span>Destination</span>
        <select value={destinationSlug} onChange={(e) => handleDestination(e.target.value)}>
          <option value="">Select a building…</option>
          {cases.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.identity.name}
            </option>
          ))}
        </select>
      </label>

      <div className="route-pilot__status" role="status">
        {!hasBothSelections && <span>Choose an origin and a destination.</span>}
        {sameSelection && <span>Origin and destination are the same — no route to show.</span>}
        {hasBothSelections && !sameSelection && direction && (
          <span>
            Estimated route itinerary: {formatDistance(direction.distanceM)} / {formatDuration(direction.durationS)}
            {endpointIsProvisional
              ? " — one endpoint's exact location is provisional and not independently verified."
              : ""}
          </span>
        )}
        {hasBothSelections && !sameSelection && !direction && (
          <span>Route not available for this pair — this prototype covers only three verified pairs.</span>
        )}
      </div>
    </div>
  );
}
