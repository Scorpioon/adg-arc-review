import { useEffect, useState, type CSSProperties } from "react";
import type { CaseRecord } from "../data/cases";
import type { PassportState } from "../hooks/usePassport";
import { useWindowedIndex } from "../hooks/useWindowedIndex";
import { useT } from "../i18n/context";
import NavArrowGlyph from "./NavArrowGlyph";
import PassportStopCircle from "./PassportStopCircle";

interface PassportMapNavbarProps {
  passport: PassportState;
  cases: CaseRecord[];
  selectedSlug: string | null;
  onSelectCase: (slug: string) => void;
}

// ADGARC-FB-046 / ADGARC-DEC-010 §11.2, §11.6: replaces the dropped S5B
// `PassportMapOverlay` rectangular rail with a windowed circle-navigation
// control. Same catalog shape as PassportPane's own PassportStopRail — every
// ordinal resolving to a real case (TG020: no more fixed 1-20 / reserved-
// position split) — but this surface paginates a fixed-size visible window
// instead of scrolling the full rail, per §11.6. TG020-R1: the case list
// this receives is App's public/active set (`activeCases`), not the full
// authored dataset, so this window's own total is always the public count.

// TG018 correction matrix §A: compact Passport-scale chrome, so the visible
// window still tops out at 5 — kept as a sibling constant here rather than
// imported since CSS cannot read a TS value (same split as
// config/breakpoints.ts). Mirrored by the matching CSS
// (.passport-map-navbar / __window rules in global.css) at each breakpoint.
const MAX_VISIBLE = 5;

// Mirrors config/breakpoints.ts's TABLET_MIN (768) plus the file's existing
// 480px coarse-pointer tier (global.css) — deliberately not a new value
// invented for this control. Below 768px the bar's own padding/gap (see
// global.css) are what yield first; the compacted circle/arrow diameter
// itself does not shrink further at these two tiers.
const NARROW_MAX = 767;
const COMPACT_MAX = 480;

function computeVisibleCount(): number {
  if (typeof window === "undefined") return MAX_VISIBLE;
  const width = window.innerWidth;
  if (width <= COMPACT_MAX) return 2;
  if (width <= NARROW_MAX) return 3;
  return MAX_VISIBLE;
}

export default function PassportMapNavbar({
  passport,
  cases,
  selectedSlug,
  onSelectCase,
}: PassportMapNavbarProps) {
  const t = useT();
  // TG020: total rail positions is derived from whatever `cases` this is
  // handed — never a hard-coded 20/30, so Phase 2 additions/removals resize
  // this rail for free. TG020-R1: that's now App's public/active case list.
  const totalPositions = cases.length;

  const [visibleCount, setVisibleCount] = useState(computeVisibleCount);

  useEffect(() => {
    const onResize = () => setVisibleCount(computeVisibleCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // TG018 correction matrix §A/§J: arrows shift the visible window by
  // exactly one position (`1 2 3 4 5` -> `2 3 4 5 6`), never a
  // `visibleCount`-sized jump — shared windowing primitive with the
  // dossier's own internal page nav. No `follow` index: this window never
  // auto-tracks the current selection (DEC-010 §11 — pagination only,
  // never touches `onSelectCase`, passport stamping, or visited state).
  const { windowStart, atStart, atEnd, goPrevious, goNext } = useWindowedIndex(
    totalPositions,
    visibleCount
  );

  // TG020-R3 (FB-063): every stop renders once, in one continuous flex
  // track — never a windowed slice that remounts fresh elements (and a
  // fresh per-circle mount animation) on every arrow click. The viewport
  // clips to exactly `visibleCount` circles and the track slides under it
  // via `transform: translateX(...)`, so `windowStart` moving up or down
  // produces one continuous horizontal slide in the matching direction —
  // "positions on a rail," not freshly-mounted elements. Both custom
  // properties are read by the CSS transform/width formulas in global.css
  // (`.passport-map-navbar__track`/`__viewport`, built from the same
  // `--circle-map-diameter`/`--map-nav-gap` tokens), so the step size can
  // never drift from the circle's own rendered size.
  const trackStyle = { "--window-start": windowStart } as CSSProperties;
  const viewportStyle = { "--visible-count": visibleCount } as CSSProperties;

  return (
    <nav className="passport-map-navbar" aria-label={t("passport.mapNavLabel")}>
      <button
        type="button"
        className="passport-map-navbar__arrow"
        onClick={goPrevious}
        disabled={atStart}
        aria-label={t("passport.mapNavPrevious")}
      >
        <NavArrowGlyph direction="previous" />
      </button>
      <div className="passport-map-navbar__viewport" style={viewportStyle}>
        <div
          className="passport-map-navbar__track"
          style={trackStyle}
          role="group"
          aria-label={t("passport.railGroupLabel", { total: totalPositions })}
        >
          {cases.map((stop, index) => {
            const ordinal = index + 1;
            const isVisited = passport.visited.has(stop.slug);
            const isInWindow = index >= windowStart && index < windowStart + visibleCount;
            // "Current selection" here is the map's actual selected case
            // (App-owned `selectedSlug`), not a local carousel-focus value —
            // this control is map navigation/status chrome, not a second
            // focus authority (DEC-010 §11.3: stroke carries selection only).
            const isCurrent = stop.slug === selectedSlug;

            return (
              <PassportStopCircle
                key={stop.slug}
                ordinal={ordinal}
                visited={isVisited}
                current={isCurrent}
                disabled={false}
                bold={stop.experienceType === "physical_digital"}
                inWindow={isInWindow}
                accessibleLabel={t("passport.stopStatus", {
                  ordinal,
                  name: stop.identity.name,
                  status: isVisited ? t("passport.stampObtained") : t("passport.stampPending"),
                })}
                onActivate={() => onSelectCase(stop.slug)}
              />
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="passport-map-navbar__arrow"
        onClick={goNext}
        disabled={atEnd}
        aria-label={t("passport.mapNavNext")}
      >
        <NavArrowGlyph direction="next" />
      </button>
    </nav>
  );
}
