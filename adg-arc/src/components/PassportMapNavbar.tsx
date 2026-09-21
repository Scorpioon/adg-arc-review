import { useEffect, useState } from "react";
import type { CaseRecord } from "../data/cases";
import type { PassportState } from "../hooks/usePassport";
import { useWindowedIndex } from "../hooks/useWindowedIndex";
import { useT } from "../i18n/context";
import { PanLeftIcon, PanRightIcon } from "./icons";
import PassportStopCircle from "./PassportStopCircle";

interface PassportMapNavbarProps {
  passport: PassportState;
  cases: CaseRecord[];
  selectedSlug: string | null;
  onSelectCase: (slug: string) => void;
}

// ADGARC-FB-046 / ADGARC-DEC-010 §11.2, §11.6: replaces the dropped S5B
// `PassportMapOverlay` rectangular rail with a windowed circle-navigation
// control. Same catalog shape as PassportPane's own PassportStopRail — the
// full ordered case set, physical then digital, every ordinal resolving to
// a real case (TG020: no more fixed 1-20 / reserved-position split) — but
// this surface paginates a fixed-size visible window instead of scrolling
// the full rail, per §11.6.

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
  // TG020: total rail positions is the full ordered case set — never a
  // hard-coded 20/30, so Phase 2 additions/removals resize this rail for
  // free.
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

  return (
    <nav className="passport-map-navbar" aria-label={t("passport.mapNavLabel")}>
      <button
        type="button"
        className="passport-map-navbar__arrow"
        onClick={goPrevious}
        disabled={atStart}
        aria-label={t("passport.mapNavPrevious")}
      >
        <PanLeftIcon />
      </button>
      <div
        className="passport-map-navbar__window"
        role="group"
        aria-label={t("passport.railGroupLabel", { total: totalPositions })}
      >
        {Array.from({ length: visibleCount }, (_, i) => {
          const index = windowStart + i;
          const ordinal = index + 1;
          const stop = cases[index];
          const isVisited = passport.visited.has(stop.slug);
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
      <button
        type="button"
        className="passport-map-navbar__arrow"
        onClick={goNext}
        disabled={atEnd}
        aria-label={t("passport.mapNavNext")}
      >
        <PanRightIcon />
      </button>
    </nav>
  );
}
