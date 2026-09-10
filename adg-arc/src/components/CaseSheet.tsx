import { useEffect, useRef, useState } from "react";
import type { CaseRecord } from "../data/cases";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useT } from "../i18n/context";
import DhubSpecimen from "./DhubSpecimen";
import { CloseIcon, PanDownIcon, PanUpIcon } from "./icons";

export interface PanelAnchor {
  x: number;
  y: number;
}

// TG010 S4 (ADGARC-DEC-007 §1, ADGARC-FB-014): the compact/tablet-portrait
// adaptive bottom-sheet states, ordered smallest → largest so the sizing
// controls below can step through them by index. This is presentation
// state only — it never participates in case selection, which stays
// App-owned (see `onSelectCase`/`onClose`).
const SHEET_STATES = ["peek", "reading", "expanded"] as const;
type SheetState = (typeof SHEET_STATES)[number];

// Opening state: enough of the dossier to read without any interaction,
// with a deliberate sliver of map context still visible above it.
const DEFAULT_SHEET_STATE: SheetState = "reading";

interface CaseSheetProps {
  activeCase: CaseRecord | undefined;
  onClose: () => void;
  onAnchorChange: (anchor: PanelAnchor | null) => void;
  // TG006D previous/next traversal. `cases` is the canonical ordered array
  // and `onSelectCase` is the same App-owned selection/deep-link setter
  // used by the map and the Cases index — CaseSheet never owns its own
  // selected-case state.
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
  // TG010 (DEC-006): set only while the just-stamped physical case is the
  // one currently open — App clears it once `activeCase` changes away. A
  // single `role="status"` text line is the entire feedback mechanism; no
  // confetti/points/sound/timers.
  stampFeedback: { count: number; total: number } | null;
}

const ENTER_DELAY_MS = 120;

// Floating, modular CaseSheet — museum technical ficha, not a blog article
// or dashboard. Identity and Typography are shown for every case from
// verified source data. Architecture shows the single verified movement
// fact (or an honest TBD) for every case. El diálogo renders
// `correlation.rationale` whenever it is populated — as of TG007 that is
// all 10 cases. Architecture `traits` and Specimen stay gated behind
// `editorial`, which remains scoped to the fuller TG005 DhUB ficha per
// ADGARC-DEC-001 (case-specific specimen expansion stays parked) — see
// TG007 handoff.
export default function CaseSheet({
  activeCase,
  onClose,
  onAnchorChange,
  cases,
  onSelectCase,
  stampFeedback,
}: CaseSheetProps) {
  const [entered, setEntered] = useState(false);
  // TG010 S4: adaptive-sheet size state. Desktop and tablet-landscape
  // ignore it entirely — global.css only reads `data-sheet-state` inside
  // the compact and tablet-portrait media queries, so the desktop floating
  // dossier's geometry is materially unchanged (DEC-007 §6).
  const [sheetState, setSheetState] = useState<SheetState>(DEFAULT_SHEET_STATE);
  const reducedMotion = usePrefersReducedMotion();
  const t = useT();
  const panelRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // Every newly opened case starts at the same reading state — a size the
  // user chose for one case is not silently carried into the next.
  useEffect(() => {
    setSheetState(DEFAULT_SHEET_STATE);
  }, [activeCase?.slug]);

  useEffect(() => {
    if (!activeCase) {
      setEntered(false);
      return;
    }
    const id = window.setTimeout(
      () => setEntered(true),
      reducedMotion ? 0 : ENTER_DELAY_MS
    );
    return () => window.clearTimeout(id);
  }, [activeCase, reducedMotion]);

  // Reports the panel's actual rendered edge (not a hand-duplicated CSS
  // constant) so MapView's tether always terminates on the real floating
  // panel, including once its slide-in transition settles.
  useEffect(() => {
    const panel = panelRef.current;
    const header = headerRef.current;
    if (!activeCase || !panel || !header) {
      onAnchorChange(null);
      return;
    }

    const report = () => {
      const panelRect = panel.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      onAnchorChange({ x: panelRect.left, y: headerRect.top + headerRect.height / 2 });
    };

    report();
    panel.addEventListener("transitionend", report);
    const observer = new ResizeObserver(report);
    observer.observe(panel);
    window.addEventListener("resize", report);

    return () => {
      panel.removeEventListener("transitionend", report);
      observer.disconnect();
      window.removeEventListener("resize", report);
    };
  }, [activeCase, onAnchorChange]);

  if (!activeCase) return null;

  const { identity, architecture, typography, correlation, editorial, specimenMode, heroMedia } =
    activeCase;
  const verifiedMovement =
    architecture.movementStatus === "verified" && architecture.movement ? architecture.movement : null;

  // TG006D previous/next: canonical array order, disabled at the ends
  // rather than wrapping (handoff §C). Goes through the same App-owned
  // `onSelectCase` as marker/index selection — no duplicate selection state.
  const currentIndex = cases.findIndex((c) => c.slug === activeCase.slug);
  const previousCase = currentIndex > 0 ? cases[currentIndex - 1] : null;
  const nextCase =
    currentIndex >= 0 && currentIndex < cases.length - 1 ? cases[currentIndex + 1] : null;

  // DEC-007 §2: drag is deliberately not implemented at all this pass, so
  // these explicit buttons are the whole expand/collapse mechanism — there
  // is no gesture-only path a real thumb can fail to discover, and no new
  // gesture dependency. Dismiss stays the separate "Volver al mapa" control
  // beside them, never folded into this stepper.
  const stateIndex = SHEET_STATES.indexOf(sheetState);
  const canExpand = stateIndex < SHEET_STATES.length - 1;
  const canCollapse = stateIndex > 0;

  return (
    <section
      ref={panelRef}
      className={`case-sheet${entered ? " case-sheet--visible" : ""}`}
      data-sheet-state={sheetState}
      role="dialog"
      aria-modal="false"
      aria-label={identity.name}
    >
      <header ref={headerRef} className="case-sheet__header">
        <h2>{identity.name}</h2>
        {/* FB-012: the title above and both controls in this group stay in
            the sheet's own non-scrolling header at every state, so neither
            can be scrolled or clipped out of reach on a real phone. */}
        <div className="case-sheet__header-controls">
          <div
            className="case-sheet__sizing"
            role="group"
            aria-label={t("caseSheet.sizingLabel")}
          >
            <button
              type="button"
              className="case-sheet__size-btn"
              onClick={() => setSheetState(SHEET_STATES[stateIndex + 1])}
              disabled={!canExpand}
              aria-label={t("caseSheet.expand")}
              title={t("caseSheet.expand")}
            >
              <PanUpIcon />
            </button>
            <button
              type="button"
              className="case-sheet__size-btn"
              onClick={() => setSheetState(SHEET_STATES[stateIndex - 1])}
              disabled={!canCollapse}
              aria-label={t("caseSheet.collapse")}
              title={t("caseSheet.collapse")}
            >
              <PanDownIcon />
            </button>
          </div>
          <button
            type="button"
            className="case-sheet__close"
            onClick={onClose}
            aria-label={t("caseSheet.returnToMap")}
          >
            <CloseIcon />
            <span className="case-sheet__close-label">{t("caseSheet.returnToMap")}</span>
          </button>
        </div>
      </header>
      {stampFeedback && (
        <p className="case-sheet__stamp-feedback" role="status">
          {t("passport.stampFeedback", { count: stampFeedback.count, total: stampFeedback.total })}
        </p>
      )}
      {currentIndex >= 0 && (
        <nav className="case-sheet__traverse" aria-label={t("caseSheet.navLabel")}>
          <button
            type="button"
            className="case-sheet__traverse-btn"
            disabled={!previousCase}
            onClick={() => previousCase && onSelectCase(previousCase.slug)}
          >
            &#8592; {t("caseSheet.previous")}
          </button>
          <span className="case-sheet__traverse-position">
            {String(currentIndex + 1).padStart(2, "0")} / {String(cases.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="case-sheet__traverse-btn"
            disabled={!nextCase}
            onClick={() => nextCase && onSelectCase(nextCase.slug)}
          >
            {t("caseSheet.next")} &#8594;
          </button>
        </nav>
      )}
      <div className="case-sheet__body">
        <section className="case-sheet__hero" aria-label={t("caseSheet.heroLabel")}>
          {heroMedia ? (
            <>
              <img className="case-sheet__hero-media" src={heroMedia.src} alt={heroMedia.alt} />
              {(heroMedia.credit || heroMedia.provenance) && (
                <p className="case-sheet__hero-credit">
                  {[heroMedia.credit, heroMedia.provenance].filter(Boolean).join(" — ")}
                </p>
              )}
            </>
          ) : (
            <div className="case-sheet__hero-empty">{t("caseSheet.heroEmpty")}</div>
          )}
        </section>

        <section className="case-sheet__module">
          <h3>{t("caseSheet.section.building")}</h3>
          <dl className="case-sheet__facts">
            <div className="case-sheet__fact">
              <dt>{t("caseSheet.fact.year")}</dt>
              <dd>{identity.year}</dd>
            </div>
            <div className="case-sheet__fact">
              <dt>{t("caseSheet.fact.architect")}</dt>
              <dd>{identity.architect}</dd>
            </div>
            {identity.address && (
              <div className="case-sheet__fact">
                <dt>{t("caseSheet.fact.address")}</dt>
                <dd>{identity.address}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="case-sheet__module">
          <h3>{t("caseSheet.section.architecture")}</h3>
          {editorial ? (
            <>
              <p className="case-sheet__note">
                {t("caseSheet.movementPrefix")} {verifiedMovement ?? t("caseSheet.movementTbdInline")}
              </p>
              {architecture.traits && architecture.traits.length > 0 && (
                <ul className="case-sheet__traits">
                  {architecture.traits.map((trait) => (
                    <li key={trait}>{trait}</li>
                  ))}
                </ul>
              )}
            </>
          ) : verifiedMovement ? (
            <p>{verifiedMovement}</p>
          ) : (
            <p className="case-sheet__module-empty">{t("caseSheet.movementTbdBlock")}</p>
          )}
        </section>

        <section className="case-sheet__module">
          <h3>{t("caseSheet.section.typography")}</h3>
          <dl className="case-sheet__facts">
            <div className="case-sheet__fact">
              <dt>{t("caseSheet.fact.primaryTypeface")}</dt>
              <dd>{typography.primaryFamily}</dd>
            </div>
            <div className="case-sheet__fact">
              <dt>{t("caseSheet.fact.designer")}</dt>
              <dd>{typography.designer}</dd>
            </div>
          </dl>
          {typography.sourceUrl && (
            <p className="case-sheet__link">
              <a href={typography.sourceUrl} target="_blank" rel="noreferrer">
                {t("caseSheet.typefaceSourceLink")}
              </a>
            </p>
          )}
        </section>

        <section className="case-sheet__module case-sheet__module--dialogue">
          <h3>{t("caseSheet.section.dialogue")}</h3>
          {correlation.rationale ? (
            <p>{correlation.rationale}</p>
          ) : (
            <p className="case-sheet__module-empty">{t("caseSheet.correlationEmpty")}</p>
          )}
        </section>

        <section className="case-sheet__module">
          <h3>{t("caseSheet.section.specimen")}</h3>
          {editorial && specimenMode === "dhub" ? (
            <DhubSpecimen />
          ) : (
            <p className="case-sheet__module-empty">{t("caseSheet.specimenEmpty")}</p>
          )}
        </section>
      </div>
    </section>
  );
}
