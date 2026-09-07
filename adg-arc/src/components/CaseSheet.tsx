import { useEffect, useRef, useState } from "react";
import type { CaseRecord } from "../data/cases";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useT } from "../i18n/context";
import DhubSpecimen from "./DhubSpecimen";
import { CloseIcon } from "./icons";

export interface PanelAnchor {
  x: number;
  y: number;
}

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
}

const ENTER_DELAY_MS = 120;

// Floating, modular CaseSheet — museum technical ficha, not a blog article
// or dashboard. Identity and Typography are shown for every case from
// verified source data. Architecture shows the single verified movement
// fact (or an honest TBD) for every case. Architecture/Correlation/
// Specimen only become a full editorial ficha for `editorial` cases (DhUB
// in TG005) — the other 9 cases are real, source-backed entries whose
// editorial modules are honestly "not developed yet", never fabricated and
// never confused with "no verified content" — see TG005 handoff §16.
export default function CaseSheet({
  activeCase,
  onClose,
  onAnchorChange,
  cases,
  onSelectCase,
}: CaseSheetProps) {
  const [entered, setEntered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const t = useT();
  const panelRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

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

  return (
    <section
      ref={panelRef}
      className={`case-sheet${entered ? " case-sheet--visible" : ""}`}
      role="dialog"
      aria-modal="false"
      aria-label={identity.name}
    >
      <header ref={headerRef} className="case-sheet__header">
        <h2>{identity.name}</h2>
        <button
          type="button"
          className="case-sheet__close"
          onClick={onClose}
          aria-label={t("caseSheet.returnToMap")}
        >
          <CloseIcon />
          <span className="case-sheet__close-label">{t("caseSheet.returnToMap")}</span>
        </button>
      </header>
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
          {editorial && correlation.rationale ? (
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
