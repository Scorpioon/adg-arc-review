import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CaseRecord } from "../data/cases";
import type { PassportState } from "../hooks/usePassport";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useT } from "../i18n/context";
import PassportStopCircle from "./PassportStopCircle";

interface PassportPaneProps {
  passport: PassportState;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
}

// TG011 Pass C (ADGARC-FB-043 / DEC-010 §D4): the Passport rail is literally
// 1-20. Positions 1-10 are the physical+digital stops in the order
// data/cases.ts already gives them; 11-20 are the digital-only positions
// whose source identities do not exist yet. Both numbers are rail geometry
// only — the passport *denominator* stays derived from the real physical set
// inside usePassport, never from either of these constants.
const RAIL_POSITIONS = 20;
const PHYSICAL_RAIL_POSITIONS = 10;

// How long a circle-initiated smooth scroll is allowed to own the focus
// indicator. Without it the carousel scroll handler below would recompute the
// current stop on every intermediate frame of the animation, walking the
// stroke across the rail before it settled. It locks nothing else: manual
// scrolling after the window immediately resumes driving the indicator.
const PROGRAMMATIC_SCROLL_MS = 700;

// TG010 S4/S5B (ADGARC-FB-023 / DEC-007 §13-14, ADGARC-FB-029 / DEC-008
// §3.2): the horizontal ordinal+tick progress rail, rendered both at the top
// of the Pasaporte pane and — since S5B — as the map's top-center overlay
// chrome (see PassportMapOverlay.tsx) — one component, two variants, never
// two drifting implementations of the same progress read.
//
// DEC-007 §14 / DEC-006 §5: the cells are deliberately NOT interactive.
// They are a progress display whose numbers are stop identifiers, not a
// route order, a required sequence, or a first/last-stop semantic — the
// accessible per-case navigation stays the real button list below, so this
// rail never becomes a second case-selection authority either. The physical
// collection is derived here the same way usePassport derives it: from
// `experienceType`, never a second hardcoded list or count.
export function PassportRail({
  passport,
  cases,
  variant,
}: {
  passport: PassportState;
  cases: CaseRecord[];
  variant: "pane" | "overlay";
}) {
  const t = useT();
  const physicalCases = cases.filter((c) => c.experienceType === "physical_digital");

  return (
    <div className={`passport-rail passport-rail--${variant}`}>
      <p className="passport-rail__head">
        <span className="passport-rail__label">{t("passport.railLabel")}</span>
        <span className="passport-rail__count">
          {t("passport.progress", { count: passport.count, total: passport.total })}
        </span>
      </p>
      <ol className="passport-rail__track">
        {physicalCases.map((c, i) => {
          const isVisited = passport.visited.has(c.slug);
          return (
            <li
              key={c.slug}
              className="passport-rail__cell"
              data-visited={isVisited ? "true" : "false"}
            >
              {/* Status is never carried by color alone: the tick glyph
                  differs, and the full name+status text below is available
                  to assistive technology. */}
              <span className="passport-rail__ordinal">{String(i + 1).padStart(2, "0")}</span>
              <span className="passport-rail__tick" aria-hidden="true">
                {isVisited ? "✓" : "·"}
              </span>
              <span className="visually-hidden">
                {t("passport.railCellStatus", {
                  name: c.identity.name,
                  status: isVisited ? t("passport.stampObtained") : t("passport.stampPending"),
                })}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="passport-rail__note">{t("passport.railOrdinalNote")}</p>
    </div>
  );
}

// TG011 Pass C (ADGARC-FB-043 / DEC-010 §11.3): the Pasaporte pane's own
// 1-20 circle rail, replacing the S4 ordinal+tick cell rail above for this
// surface only. PassportRail itself is untouched and still serves the map
// overlay, whose redesign is separately allocated (ADGARC-FB-046) — this
// pass deliberately does not reach into that surface.
//
// The rail is pure presentation over two authorities it never writes: the
// visit fill reads `passport.visited` (usePassport / localStorage), and the
// selection stroke reads the pane-local `focusedOrdinal` below. DEC-010
// §11.3: neither is derived from the other. Activating a circle scrolls the
// carousel and nothing else — it is not a second case-selection authority,
// and it can never stamp.
function PassportStopRail({
  passport,
  physicalCases,
  focusedOrdinal,
  onFocusStop,
}: {
  passport: PassportState;
  physicalCases: CaseRecord[];
  focusedOrdinal: number;
  onFocusStop: (ordinal: number) => void;
}) {
  const t = useT();

  return (
    <div className="passport-stop-rail">
      <p className="passport-stop-rail__count">
        {t("passport.progress", { count: passport.count, total: passport.total })}
      </p>
      <div
        className="passport-stop-rail__track"
        role="group"
        aria-label={t("passport.railGroupLabel")}
      >
        {Array.from({ length: RAIL_POSITIONS }, (_, i) => {
          const ordinal = i + 1;
          // Positions past the real physical set have no resolved identity:
          // no case, no name, no image, no slug, no coordinate. FB-043's
          // source discipline and DEC-010 §D4 forbid inventing one, so the
          // slot is rendered honestly as reserved rather than filled.
          const stop = ordinal <= PHYSICAL_RAIL_POSITIONS ? physicalCases[i] : undefined;
          const isVisited = stop ? passport.visited.has(stop.slug) : false;

          return (
            <Fragment key={ordinal}>
              {/* FB-043: the catalog boundary after 10. Presentation only —
                  it separates physical stops from digital-only positions and
                  has no bearing on the stamping denominator. */}
              {ordinal === PHYSICAL_RAIL_POSITIONS + 1 && (
                <span className="passport-stop-rail__divider" aria-hidden="true" />
              )}
              <PassportStopCircle
                ordinal={ordinal}
                visited={isVisited}
                current={focusedOrdinal === ordinal}
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
                onActivate={stop ? onFocusStop : undefined}
              />
            </Fragment>
          );
        })}
      </div>
      {/* The product's own statement that the ordinals identify stops rather
          than a route order. The final composition (mockup 02) has no room
          for it as a printed line and the OPERATOR struck the S4 note out of
          this surface, so it is kept for assistive technology rather than
          dropped outright — the same existing string, no new copy. */}
      <span className="visually-hidden">{t("passport.railOrdinalNote")}</span>
    </div>
  );
}

// TG010 (DEC-006); S5B card carousel (DEC-008 §4/§5.2): Pasaporte
// destination pane — reuses .settings-actions / .settings-actions__btn for
// its reset action rather than inventing a parallel visual language; its own
// stop-browsing surface is the .passport-carousel 9:16 content-card
// carousel below. Opening a case from here goes through the same App-owned
// `onSelectCase` the map already uses — never a second selection authority,
// never a stamp (only the dossier's own Touch to Check control stamps, and
// only once the QR Contract v1 gate — TG014 — allows it for that case).
export default function PassportPane({ passport, cases, onSelectCase }: PassportPaneProps) {
  const t = useT();
  const reducedMotion = usePrefersReducedMotion();
  const [confirmingReset, setConfirmingReset] = useState(false);

  // TG011 Pass C (ADGARC-FB-043): which card the carousel is currently
  // looking at. This is pane-local *presentation* state and nothing else —
  // it never writes `caseSlug`, the URL/history or localStorage, and it never
  // stamps. Opening a case is still only ever `onSelectCase` from a card
  // below, so the three concepts FB-043 warned about (visit/stamp, carousel
  // focus, global case selection) stay separate. Deterministic initial
  // focus: position 1.
  const [focusedOrdinal, setFocusedOrdinal] = useState(1);
  const carouselRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef(new Map<number, HTMLLIElement>());
  const rafRef = useRef<number | null>(null);
  const programmaticUntilRef = useRef(0);

  const physicalCases = cases.filter((c) => c.experienceType === "physical_digital");
  const completed = passport.total > 0 && passport.count === passport.total;

  // Circle -> carousel. Measured off live rects rather than `offsetLeft`,
  // which resolves against whichever ancestor happens to be positioned, and
  // applied as a horizontal scroll on the track itself rather than
  // `scrollIntoView`, which would also scroll the shell body vertically.
  const focusStop = useCallback(
    (ordinal: number) => {
      setFocusedOrdinal(ordinal);
      const track = carouselRef.current;
      const item = itemRefs.current.get(ordinal);
      if (!track || !item) return;
      const delta = item.getBoundingClientRect().left - track.getBoundingClientRect().left;
      const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
      programmaticUntilRef.current = reducedMotion ? 0 : Date.now() + PROGRAMMATIC_SCROLL_MS;
      track.scrollTo({ left: track.scrollLeft + delta, behavior });
    },
    [reducedMotion]
  );

  // Carousel -> circle. The indicator must follow the card the visitor is
  // actually looking at after a native swipe/scroll, so the card nearest the
  // track's leading edge wins. rAF-throttled, no new dependency, no window
  // global; it only ever calls setFocusedOrdinal, so it cannot feed back into
  // the scroll position it is reading.
  const syncFocusFromScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      if (Date.now() < programmaticUntilRef.current) return;
      const track = carouselRef.current;
      if (!track) return;
      const trackLeft = track.getBoundingClientRect().left;
      // 0 is the "no card measured" sentinel rather than null: rail ordinals
      // are 1-based, so it can never collide with a real one.
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      itemRefs.current.forEach((el, ordinal) => {
        const distance = Math.abs(el.getBoundingClientRect().left - trackLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = ordinal;
        }
      });
      if (nearest > 0) setFocusedOrdinal((prev) => (prev === nearest ? prev : nearest));
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const handleResetConfirmed = () => {
    passport.reset();
    setConfirmingReset(false);
  };

  return (
    <div className="passport-pane">
      <PassportStopRail
        passport={passport}
        physicalCases={physicalCases}
        focusedOrdinal={focusedOrdinal}
        onFocusStop={focusStop}
      />
      {completed && (
        <p className="passport-pane__status passport-pane__status--visited">{t("passport.completed")}</p>
      )}

      {/* TG010 S5B (ADGARC-FB-030 / DEC-008 §4): the Pasaporte destination's
          own stop-browsing surface — a horizontal scroll-snap carousel of
          9:16 editorial cards (full card ratio, media + info together),
          replacing the former plain row list now that Casos no longer exists
          as a separate destination. Content-card visual class (DEC-008 §5.2):
          white fill, thin black stroke, square corners — explicitly exempt
          from the window/panel yellow title-bar treatment. Every card is a
          real button going through the same App-owned `onSelectCase` the
          map/menu already use — never a second selection authority, never a
          stamp (only the dossier's own Touch to Check control stamps, and
          only once the QR Contract v1 gate — TG014 — allows it for that case).

          TG011 Pass C (ADGARC-FB-044): the 9:16 ratio, the scroll-snap track
          and the per-card `onSelectCase` are all unchanged. The cards now
          take their size from the pane's flex composition instead of a fixed
          width, which is what stops the card block from overflowing the fixed
          shell — see .passport-carousel__card in global.css. */}
      <ul
        className="passport-carousel"
        aria-label={t("passport.carouselLabel")}
        ref={carouselRef}
        onScroll={syncFocusFromScroll}
      >
        {physicalCases.map((c, i) => {
          const isVisited = passport.visited.has(c.slug);
          const ordinal = i + 1;
          return (
            <li
              key={c.slug}
              className="passport-carousel__item"
              ref={(el) => {
                if (el) itemRefs.current.set(ordinal, el);
                else itemRefs.current.delete(ordinal);
              }}
            >
              <button
                type="button"
                className="passport-carousel__card"
                onClick={() => onSelectCase(c.slug)}
              >
                <span className="passport-carousel__media">
                  {c.heroMedia ? (
                    <img
                      className="passport-carousel__img"
                      src={c.heroMedia.src}
                      alt={c.heroMedia.alt}
                    />
                  ) : (
                    <span className="passport-carousel__media-empty">
                      {t("cases.mediaPending")}
                    </span>
                  )}
                </span>
                <span className="passport-carousel__body">
                  <span className="passport-carousel__ordinal">
                    {String(ordinal).padStart(2, "0")}
                  </span>
                  <span className="passport-carousel__name">{c.identity.name}</span>
                  <span
                    className={`passport-pane__status${isVisited ? " passport-pane__status--visited" : ""}`}
                  >
                    {isVisited ? t("passport.stampObtained") : t("passport.stampPending")}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="settings-actions">
        {confirmingReset ? (
          <div className="passport-pane__reset-confirm">
            <p className="app-modal__note">{t("passport.resetConfirm")}</p>
            <button type="button" className="settings-actions__btn" onClick={handleResetConfirmed}>
              {t("passport.resetConfirmYes")}
            </button>
            <button type="button" className="settings-actions__btn" onClick={() => setConfirmingReset(false)}>
              {t("passport.resetConfirmCancel")}
            </button>
          </div>
        ) : (
          <button type="button" className="settings-actions__btn" onClick={() => setConfirmingReset(true)}>
            {t("passport.reset")}
          </button>
        )}
      </div>
    </div>
  );
}
