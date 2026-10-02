import { Fragment, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { CaseRecord } from "../data/cases";
import { useDialogA11y } from "../hooks/useDialogA11y";
import type { PassportState } from "../hooks/usePassport";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useT } from "../i18n/context";
import { RotateCcwIcon } from "./icons";
import PassportStopCircle from "./PassportStopCircle";

interface PassportPaneProps {
  passport: PassportState;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
  // TG022 P1 (ADGARC-FB-097): the `header` prop TG019 Pass D added is gone.
  // The destination header is no longer Passport's to hold — EditorialShell
  // owns that band for every destination alike, above the scrollable body.
  // This pane renders its own rail and nothing else.
}

// How long a circle-initiated smooth scroll is allowed to own the focus
// indicator. Without it the carousel scroll handler below would recompute the
// current stop on every intermediate frame of the animation, walking the
// stroke across the rail before it settled. It locks nothing else: manual
// scrolling after the window immediately resumes driving the indicator.
const PROGRAMMATIC_SCROLL_MS = 700;

// TG011 Pass C (ADGARC-FB-043 / DEC-010 §11.3): the Pasaporte pane's own
// 1-20 circle rail. The S4 ordinal+tick cell rail this replaced (`.passport-
// rail*`, once shared with the map's top-center overlay chrome) was removed
// in TG016/TG017 once the map surface got its own FB-046 circle navbar.
//
// The rail is pure presentation over two authorities it never writes: the
// visit fill reads `passport.visited` (usePassport / localStorage), and the
// selection stroke reads the pane-local `focusedOrdinal` below. DEC-010
// §11.3: neither is derived from the other. Activating a circle scrolls the
// carousel and nothing else — it is not a second case-selection authority,
// and it can never stamp.
function PassportStopRail({
  passport,
  cases,
  physicalCount,
  focusedOrdinal,
  onFocusStop,
  onReload,
  reloadButtonRef,
}: {
  passport: PassportState;
  // TG020: no longer a fixed 1-20 shape or reserved positions past the
  // physical set — every ordinal 1..cases.length resolves to a real case.
  // TG020-R1: the caller now hands this the public/active case list (App's
  // `activeCases`, currently 20), not the full authored dataset — the rail
  // itself stays total-agnostic and simply renders whatever it is given.
  cases: CaseRecord[];
  physicalCount: number;
  focusedOrdinal: number;
  onFocusStop: (ordinal: number) => void;
  onReload: () => void;
  // TG019 Pass D: so the reset dialog's `useDialogA11y` can return focus to
  // the exact control that opened it, the same contract AppModal/AppMenuDialog
  // already use with their own trigger buttons.
  reloadButtonRef: RefObject<HTMLButtonElement>;
}) {
  const t = useT();
  // TG022 Session 45 (FB-098 topology fix / P4f superseded): the stops-only
  // scroll owner. Reset used to be a `position: sticky` descendant of this
  // same box (P4f R1-R3), which made "no stop renders past Reset" a
  // paint-coverage claim that three tuning passes each re-broke at a
  // different sub-pixel. Reset now lives outside this element entirely (see
  // `.passport-stop-rail__row` below) — a stop circle has no legal layout
  // position past it any more, so containment stops depending on paint.
  const trackRef = useRef<HTMLDivElement | null>(null);
  // TG022 Session 45 (F-3 / FB-103): whether stop content remains hidden
  // toward Reset at the current scroll position. The sole input to the
  // trailing-edge mask fade below (`data-scroll-more`) — derived from the
  // track's real scroll geometry, never from viewport width, so it stays
  // correct across pointer tiers, breakpoints and resize.
  const [canScrollMore, setCanScrollMore] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    // A <=1px tolerance absorbs sub-pixel rounding at the terminal scroll
    // position only — it is not containment tuning.
    const next = maxScrollLeft > 1 && track.scrollLeft < maxScrollLeft - 1;
    setCanScrollMore((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    updateScrollState();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updateScrollState, cases.length]);

  return (
    <div className="passport-stop-rail">
      {/* TG022 Session 45 (FB-098 topology fix): the row is the one new
          layout owner, splitting the stops-only scroller from Reset as true
          flex siblings instead of scroll-owner + sticky descendant. Reset's
          terminal position now arises from ordinary flex layout (it is
          `flex: none`, the track is the only item that grows/shrinks) —
          see global.css for both selectors. */}
      <div className="passport-stop-rail__row">
        {/* TG018 Pass B (operator decision, correction matrix §B): `1 de 10
            paradas` is removed with no replacement — visit progress is still
            announced in words via each circle's own accessible name. */}
        <div
          className="passport-stop-rail__track"
          role="group"
          aria-label={t("passport.railGroupLabel", { total: cases.length })}
          ref={trackRef}
          onScroll={updateScrollState}
          data-scroll-more={canScrollMore ? "true" : "false"}
        >
          {cases.map((stop, i) => {
            const ordinal = i + 1;
            const isVisited = passport.visited.has(stop.slug);
            const isPhysical = stop.experienceType === "physical_digital";

            return (
              <Fragment key={stop.slug}>
                {/* FB-043: the catalog boundary after the physical set.
                    Presentation only — it separates physical stops from
                    digital-only positions and has no bearing on the stamping
                    denominator. */}
                {ordinal === physicalCount + 1 && (
                  <span className="passport-stop-rail__divider" aria-hidden="true" />
                )}
                <PassportStopCircle
                  ordinal={ordinal}
                  visited={isVisited}
                  current={focusedOrdinal === ordinal}
                  disabled={false}
                  bold={isPhysical}
                  accessibleLabel={t("passport.stopStatus", {
                    ordinal,
                    name: stop.identity.name,
                    status: isVisited ? t("passport.stampObtained") : t("passport.stampPending"),
                  })}
                  onActivate={onFocusStop}
                />
              </Fragment>
            );
          })}
        </div>
        {/* TG018 Pass B (operator decision, correction matrix §B / evidence
            13_passaport_reset_circle_reference.png): reset is its own
            separated action after the building positions, never the final
            ordinal — its own divider, then a circle-scale control reusing
            the existing settings-actions reset/confirm flow below rather
            than duplicating it.
            TG022 Session 45 (FB-098 / D1): same divider, same button, same
            class, same ref, same onClick, same accessible name as P4f — only
            its DOM position moved, from the scroller's last child to a
            sibling outside it. Reset is still not position 21 and still not
            a second selection authority; Tab order and the reset-dialog
            focus return are unchanged. */}
        <span className="passport-stop-rail__reset-zone">
          <span className="passport-stop-rail__divider" aria-hidden="true" />
          <button
            type="button"
            ref={reloadButtonRef}
            className="passport-stop-rail__reload"
            onClick={onReload}
            aria-label={t("passport.reset")}
          >
            <RotateCcwIcon />
          </button>
        </span>
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

// TG019 Pass D (operator feedback §12): the reset confirmation as a real
// small dialog/popup inside the Passport surface, replacing the former
// bottom-of-flow confirm block. Reuses `useDialogA11y` — the same focus-in/
// Tab-trap/Escape/focus-return primitive AppModal and the menu dialog
// already use — rather than a third, parallel modal implementation.
function PassportResetDialog({
  triggerRef,
  onConfirm,
  onCancel,
}: {
  triggerRef: RefObject<HTMLButtonElement>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  const dialogRef = useDialogA11y({ onClose: onCancel, triggerRef });

  return (
    <div
      className="passport-reset-dialog__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="passport-reset-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("passport.resetConfirm")}
      >
        <p className="passport-reset-dialog__message">{t("passport.resetConfirm")}</p>
        <div className="passport-reset-dialog__actions">
          <button type="button" className="passport-reset-dialog__confirm" onClick={onConfirm}>
            {t("passport.resetConfirmYes")}
          </button>
          <button type="button" className="passport-reset-dialog__cancel" onClick={onCancel}>
            {t("passport.resetConfirmCancel")}
          </button>
        </div>
      </div>
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
  // TG019 Pass D: the reset dialog's focus-return target.
  const reloadButtonRef = useRef<HTMLButtonElement | null>(null);

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
  // TG022 P4b (ADGARC-FB-084): the actual vertical content-scroll owner at
  // the desktop grid tier — the carousel track only ever owns the inline
  // (horizontal) axis, and stops owning even that once the grid takes over
  // above 1024px. Read live so the landing inset never copies a CSS value.
  const viewportRef = useRef<HTMLDivElement | null>(null);

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
      const viewport = viewportRef.current;
      const itemRect = item.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      // TG022 P4b: read the viewport's own row-top authority before either
      // scroll starts — its live padding-top, not a copied CSS constant, is
      // what "content-start edge" means at the grid tier.
      let viewportTargetTop: number | null = null;
      if (viewport) {
        const viewportRect = viewport.getBoundingClientRect();
        const paddingTop = parseFloat(getComputedStyle(viewport).paddingTop) || 0;
        const deltaY = itemRect.top - viewportRect.top - paddingTop;
        viewportTargetTop = viewport.scrollTop + deltaY;
      }
      const delta = itemRect.left - trackRect.left;
      const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
      programmaticUntilRef.current = reducedMotion ? 0 : Date.now() + PROGRAMMATIC_SCROLL_MS;
      track.scrollTo({ left: track.scrollLeft + delta, behavior });
      if (viewport && viewportTargetTop !== null) {
        viewport.scrollTo({ top: viewportTargetTop, behavior });
      }
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
      {/* TG019 Pass D (operator feedback §13): the wrapper around the numbered
          rail — see `.passport-pane__band` in global.css.
          TG022 P1: the destination header no longer sits inside it (it is an
          EditorialShell sibling now).
          TG022 P4-OWN (FB-080 / D-6): was `.passport-pane__sticky`. This box
          is the Passport *control band*, and it is no longer sticky and no
          longer carries a z-index — so the old name claimed an ownership it
          does not have. It is an ordinary in-flow `flex: none` sibling of
          the content viewport below, and what keeps card pixels out of this
          band is that viewport's own clip, never paint order. The band still
          owns the white control field, the full-width filet and the rail. */}
      <div className="passport-pane__band">
        <PassportStopRail
          passport={passport}
          cases={cases}
          physicalCount={physicalCases.length}
          focusedOrdinal={focusedOrdinal}
          onFocusStop={focusStop}
          onReload={() => setConfirmingReset(true)}
          reloadButtonRef={reloadButtonRef}
        />
      </div>
      {completed && (
        <p className="passport-pane__status passport-pane__status--visited">{t("passport.completed")}</p>
      )}

      {/* TG022 P4-OWN (FB-080 / Session 7 owner re-anchor): the Passport
          content viewport — the ONLY box in this subtree that changes
          scrollTop, and the clip owner whose top edge is the control band's
          bottom edge. It is the whole of this patch: the invariant "cards
          never paint above or behind the control band" stops being a paint
          -order arrangement (opaque fill + z-index on a sticky band, which
          three passes strengthened and which still leaked) and becomes
          topology — a card has no legal layout position up there to be hidden
          from. Its geometry lives in `.passport-pane__viewport` in global.css.
          It wraps the carousel and nothing else: the rail stays in the band
          above, and the optional completed-status line stays a sibling. */}
      <div className="passport-pane__viewport" ref={viewportRef}>
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
            shell — see .passport-carousel__card in global.css.
            TG022 P4-OWN: that composition is now one box deeper — the viewport
            above is the flexible row of the pane, and this track is the
            flexible row of the viewport — so the card still takes its height
            from the composition rather than from its own content.

            TG020: every position resolves to a real case (no reserved 11-20
            placeholders remain, and the total is never hard-coded — see the
            passport-stop-rail divider comment above and the desktop 5-column/
            auto-row CSS in global.css, which grows past any fixed row count).
            TG020-R1: the track now renders the public/active case list (App's
            `activeCases`, currently 20 — 5 columns x 4 rows at desktop, no
            horizontal overflow), never the full 31-record authored dataset. */}
        <ul
          className="passport-carousel"
          aria-label={t("passport.carouselLabel")}
          ref={carouselRef}
          onScroll={syncFocusFromScroll}
        >
          {cases.map((c, i) => {
            const ordinal = i + 1;
            const isVisited = passport.visited.has(c.slug);
            return (
              <li
                key={c.slug}
                className="passport-carousel__item"
                ref={(el) => {
                  if (el) itemRefs.current.set(ordinal, el);
                  else itemRefs.current.delete(ordinal);
                }}
              >
                {/* TG023 corrective (ADGARC-FB-105, prompt 057): reverted to
                    a single <button> card. The prompt-056 split
                    (`.passport-carousel__hit` stretched button + a sibling
                    credit strip) existed only to keep a credit <a> out of a
                    <button>'s forbidden content model; FB-105 moves all
                    photo-credit presentation off Passport entirely (see the
                    `Crèdits` root-menu destination in AppMenuModal.tsx), so
                    that constraint no longer applies and the simpler
                    pre-056 structure is restored — same selection authority
                    (`onSelectCase`), same visible text content naming the
                    button (no separate aria-label needed). */}
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
                  {/* TG020-R1 (FB-057): the text/status region itself carries
                      the grey-unvisited/yellow-visited state (not just the
                      status line's own weight/opacity below) — the same
                      visited-fill vocabulary PassportStopCircle already uses,
                      generalized to this card's metadata block. Selection has
                      no equivalent here; this pane never carries a second
                      selection authority (see the header comment above). */}
                  <span
                    className="passport-carousel__body"
                    data-visited={isVisited ? "true" : "false"}
                  >
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
      </div>

      {/* TG018 Pass B (operator decision): the full-width "Reiniciar
          progreso" trigger is gone — reset now starts from the reload circle
          in the rail above (`onReload`).
          TG019 Pass D (operator feedback §12): the confirm/cancel step is now
          a centered dialog/popup rather than a block appended to the flow. */}
      {confirmingReset && (
        <PassportResetDialog
          triggerRef={reloadButtonRef}
          onConfirm={handleResetConfirmed}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  );
}
