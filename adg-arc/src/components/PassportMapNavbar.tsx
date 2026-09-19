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
// control. Same catalog shape as PassportPane's own PassportStopRail
// (`RAIL_POSITIONS`/`PHYSICAL_RAIL_POSITIONS` = 1-20 with 1-10 resolved),
// but this surface paginates a fixed-size visible window instead of
// scrolling the full rail, per §11.6.
const RAIL_POSITIONS = 20;
const PHYSICAL_RAIL_POSITIONS = 10;

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
  const physicalCases = cases.filter((c) => c.experienceType === "physical_digital");

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
    RAIL_POSITIONS,
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
        aria-label={t("passport.railGroupLabel")}
      >
        {Array.from({ length: visibleCount }, (_, i) => {
          const ordinal = windowStart + i + 1;
          // Positions past the real physical set have no resolved identity
          // (FB-043 source discipline / DEC-010 §D4) — same reserved-slot
          // honesty as PassportStopRail, never an invented case.
          const stop = ordinal <= PHYSICAL_RAIL_POSITIONS ? physicalCases[ordinal - 1] : undefined;
          const isVisited = stop ? passport.visited.has(stop.slug) : false;
          // "Current selection" here is the map's actual selected case
          // (App-owned `selectedSlug`), not a local carousel-focus value —
          // this control is map navigation/status chrome, not a second
          // focus authority (DEC-010 §11.3: stroke carries selection only).
          const isCurrent = stop ? stop.slug === selectedSlug : false;

          return (
            <PassportStopCircle
              key={ordinal}
              ordinal={ordinal}
              visited={isVisited}
              current={isCurrent}
              disabled={!stop}
              bold={ordinal <= PHYSICAL_RAIL_POSITIONS}
              accessibleLabel={
                stop
                  ? t("passport.stopStatus", {
                      ordinal,
                      name: stop.identity.name,
                      status: isVisited ? t("passport.stampObtained") : t("passport.stampPending"),
                    })
                  : t("passport.stopReserved", { ordinal })
              }
              onActivate={stop ? () => onSelectCase(stop.slug) : undefined}
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
