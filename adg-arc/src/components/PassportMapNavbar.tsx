import { useEffect, useRef, useState, type CSSProperties } from "react";
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

// TG018 correction matrix §A: compact Passport-scale chrome caps the
// tablet/desktop pill at 5 — that tier is self-sizing (width: fit-content,
// centered pill; see global.css), so its own count still drives its width
// rather than the reverse. Kept as a sibling constant here rather than
// imported since CSS cannot read a TS value (same split as
// config/breakpoints.ts).
const DESKTOP_VISIBLE = 5;

// Mirrors config/breakpoints.ts's TABLET_MIN (768) — below it the bar is no
// longer a self-sizing pill (TG042/FB-116: it spans the available top
// width instead, arrows pinned to its true left/right edges), so unlike the
// pill tier above, real on-screen space exists there to measure.
const NARROW_MAX = 767;

// TG042 Prompt 087 corrective (FB-116): below NARROW_MAX, `visibleCount`
// must track how many whole circles the bar's now-real available width can
// hold — a fixed 2/3-by-breakpoint guess left a near-full-width bar mostly
// empty once the bar itself was widened to fill the screen. This reads the
// bar's actual rendered width plus its own live `--circle-map-diameter`/
// `--map-nav-gap`/padding/gap custom properties (never a value re-typed by
// hand here), so it can never drift from whatever global.css currently says
// at this breakpoint, and recomputes correctly if those tokens ever change.
// The arrow's own width is never measured separately — `.passport-map-
// navbar__arrow` is declared `width: var(--circle-map-diameter)` (global.css),
// so it is exactly the circle diameter by construction.
function computeNarrowVisibleCount(nav: HTMLElement, totalPositions: number): number {
  const style = getComputedStyle(nav);
  const diameter = parseFloat(style.getPropertyValue("--circle-map-diameter")) || 28;
  const circleGap = parseFloat(style.getPropertyValue("--map-nav-gap")) || 6;
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const outerGapRaw = style.columnGap && style.columnGap !== "normal" ? style.columnGap : style.gap;
  const outerGap = parseFloat(outerGapRaw) || 0;

  const available =
    nav.getBoundingClientRect().width - paddingLeft - paddingRight - 2 * diameter - 2 * outerGap;
  const step = diameter + circleGap;
  const fit = step > 0 ? Math.floor((available + circleGap) / step) : 1;

  return Math.max(1, Math.min(fit, Math.max(1, totalPositions)));
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

  const navRef = useRef<HTMLElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(DESKTOP_VISIBLE);

  // TG042 Prompt 087 corrective (FB-116): a ResizeObserver on the bar itself
  // (not `window`'s "resize") — below NARROW_MAX the bar's own box changes
  // size with safe-area-inset/viewport changes that do not always fire a
  // plain window resize (e.g. mobile browser chrome show/hide), and this
  // also catches the one breakpoint-crossing case that matters here: tablet/
  // desktop keeps the fixed self-sizing pill count (that tier's width is
  // *derived from* the count, so measuring it back would be circular — see
  // computeNarrowVisibleCount's doc comment), so only the narrow branch ever
  // measures. Re-running on `totalPositions` change too (TG020: a Phase 2
  // catalog resize), not just on layout size changes.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const recompute = () => {
      if (window.innerWidth > NARROW_MAX) {
        setVisibleCount(Math.min(DESKTOP_VISIBLE, Math.max(1, totalPositions)));
        return;
      }
      setVisibleCount(computeNarrowVisibleCount(nav, totalPositions));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [totalPositions]);

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
    <nav ref={navRef} className="passport-map-navbar" aria-label={t("passport.mapNavLabel")}>
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
