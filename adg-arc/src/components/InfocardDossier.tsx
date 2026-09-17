import { useEffect, useRef } from "react";
import { cases, type CaseRecord } from "../data/cases";
import { useT } from "../i18n/context";
import EditorialShell from "./EditorialShell";
import {
  InfocardCoverPage,
  InfocardFactsPage,
  InfocardHighlightedPhrasePage,
  InfocardProsePage,
  InfocardSpecimenPage,
} from "./InfocardPages";
import {
  useInfocardPagination,
  type InfocardChapter,
  type InfocardPageId,
} from "../hooks/useInfocardPagination";

// TG012 Pass C — final selected-case dossier. Composes the validated Pass A
// data (cases.ts) through the validated Pass B primitives (InfocardPages)
// and pagination hook (useInfocardPagination) inside the shared
// EditorialShell chrome. Not mounted into App.tsx by this pass (DEC-010 §7
// step 3/4 remains a separate, later-authorized cutover).

// Matches CaseSheet's existing exported `PanelAnchor` shape exactly, kept as
// a local declaration rather than an import: CaseSheet is a read-only
// surface this pass may not depend on for its own type contract.
export interface InfocardDossierAnchor {
  x: number;
  y: number;
}

export interface InfocardDossierProps {
  activeCase: CaseRecord | undefined;
  onClose: () => void;
  onAnchorChange?: (anchor: InfocardDossierAnchor | null) => void;
  stampFeedback?: string | null;
}

// DEC-010 §D2 / TG012 handoff §5: the five canonical chapter section
// labels, plus the QUOTE visual-category label for the highlighted-phrase
// sub-page. All three chapter-1 sub-pages (facts / highlight / prose) keep
// chapter 1 active; only the highlight sub-page's own row label differs.
const SECTION_LABEL: Record<Exclude<InfocardPageId, "cover">, string> = {
  "building-facts": "L'edifici",
  "building-highlight": "QUOTE",
  "building-prose": "L'edifici",
  architecture: "Arquitectura",
  typography: "Tipografia",
  dialogue: "Diàleg",
  specimen: "Especimen",
};

const CHAPTERS: InfocardChapter[] = [1, 2, 3, 4, 5];

export default function InfocardDossier({
  activeCase,
  onClose,
  onAnchorChange,
  stampFeedback,
}: InfocardDossierProps) {
  const t = useT();
  const { currentPage, pageIndex, canGoPrevious, canGoNext, goPrevious, goNext, jumpToChapter } =
    useInfocardPagination(activeCase);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Anchor reporting — same live-rect/ResizeObserver pattern as CaseSheet's
  // existing implementation, scoped to this component's own outer panel.
  useEffect(() => {
    const panel = panelRef.current;
    if (!activeCase || !panel || !onAnchorChange) {
      onAnchorChange?.(null);
      return;
    }

    const report = () => {
      const rect = panel.getBoundingClientRect();
      onAnchorChange({ x: rect.left, y: rect.top + rect.height / 2 });
    };

    report();
    const observer = new ResizeObserver(report);
    observer.observe(panel);
    window.addEventListener("resize", report);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", report);
      onAnchorChange(null);
    };
  }, [activeCase, onAnchorChange]);

  // Scroll/focus reset on page change — local to the dossier's own content
  // region, never a global listener or focus trap.
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    content.scrollTo({ top: 0 });
    content.focus({ preventScroll: true });
  }, [pageIndex]);

  if (!activeCase) return null;

  const ordinal = cases.findIndex((c) => c.slug === activeCase.slug) + 1;
  const ordinalLabel = String(Math.max(ordinal, 0)).padStart(2, "0");
  const isCover = currentPage?.id === "cover";
  // Narrowed inline (`currentPage.id !== "cover"`, not the derived `isCover`
  // boolean) so TypeScript can discriminate `currentPage.id` down to
  // `Exclude<InfocardPageId, "cover">` before indexing the content-only
  // `SECTION_LABEL` record — TS7053 fix, no `any`/unsafe assertion.
  const sectionLabel =
    currentPage && currentPage.id !== "cover" ? SECTION_LABEL[currentPage.id] : null;
  const resolvedMovement =
    activeCase.architecture.movementStatus === "verified" && activeCase.architecture.movement
      ? activeCase.architecture.movement
      : null;

  const renderPage = () => {
    if (!currentPage) return null;

    switch (currentPage.id) {
      case "cover":
        return (
          <InfocardCoverPage
            caseName={activeCase.identity.name}
            typefaceName={activeCase.typography.primaryFamily}
          />
        );
      case "building-facts":
        return (
          <InfocardFactsPage
            year={activeCase.identity.year}
            architect={activeCase.identity.architect}
            address={activeCase.identity.address ?? null}
            movement={activeCase.architecture.movement ?? null}
            movementStatus={activeCase.architecture.movementStatus}
            labels={{
              year: t("caseSheet.fact.year"),
              architect: t("caseSheet.fact.architect"),
              address: t("caseSheet.fact.address"),
              movement: t("caseSheet.movementPrefix"),
              movementTbd: t("caseSheet.movementTbdInline"),
            }}
          />
        );
      case "building-highlight":
        return activeCase.infocard.highlightedPhrase ? (
          <InfocardHighlightedPhrasePage phrase={activeCase.infocard.highlightedPhrase} />
        ) : null;
      case "building-prose":
        return (
          <InfocardProsePage
            heading={SECTION_LABEL["building-prose"]}
            copy={activeCase.infocard.buildingProse}
          />
        );
      case "architecture":
        return (
          <InfocardProsePage
            heading={SECTION_LABEL.architecture}
            copy={activeCase.infocard.architectureCopy}
            meta={
              <p className="infocard-page__meta-line">
                <span className="infocard-page__meta-label">{t("caseSheet.movementPrefix")}</span>{" "}
                <strong>{resolvedMovement ?? t("caseSheet.movementTbdInline")}</strong>
              </p>
            }
          />
        );
      case "typography":
        return (
          <InfocardProsePage
            heading={SECTION_LABEL.typography}
            copy={activeCase.infocard.typographyCopy}
            meta={
              <p className="infocard-page__meta-typeface">{activeCase.typography.primaryFamily}</p>
            }
          />
        );
      case "dialogue":
        return (
          <InfocardProsePage
            heading={SECTION_LABEL.dialogue}
            copy={activeCase.infocard.dialogueCopy}
          />
        );
      case "specimen":
        return (
          <InfocardSpecimenPage
            specimenMode={activeCase.specimenMode}
            emptyLabel={t("caseSheet.specimenEmpty")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={panelRef}
      className="infocard-dossier"
      role="dialog"
      aria-modal="false"
      aria-label={activeCase.identity.name}
    >
      <EditorialShell
        title={t("menu.rootTitle")}
        onClose={onClose}
        closeLabel={t("caseSheet.returnToMap")}
        closeButtonRef={closeButtonRef}
      >
        <div className="infocard-dossier__panel">
          <div className="infocard-dossier__row">
            <div className="infocard-dossier__row-left">
              <span className="infocard-dossier__ordinal">{ordinalLabel}</span>
              <span className="infocard-dossier__case-name">{activeCase.identity.name}</span>
            </div>
            {sectionLabel && (
              <span className="infocard-dossier__section-label">{sectionLabel}</span>
            )}
          </div>

          {stampFeedback && (
            <p className="infocard-dossier__stamp-feedback" role="status">
              {stampFeedback}
            </p>
          )}

          <div
            ref={contentRef}
            className={`infocard-dossier__content${
              isCover ? " infocard-dossier__content--cover" : " infocard-dossier__content--page"
            }`}
            tabIndex={-1}
            aria-label={sectionLabel ?? activeCase.identity.name}
          >
            {renderPage()}
            {isCover && (
              <button type="button" className="infocard-dossier__explore" onClick={goNext}>
                Explora →
              </button>
            )}
          </div>

          {currentPage && !isCover && (
            <nav className="infocard-dossier__nav" aria-label={t("caseSheet.navLabel")}>
              <button
                type="button"
                className="infocard-dossier__nav-arrow"
                onClick={goPrevious}
                disabled={!canGoPrevious}
                aria-label={t("caseSheet.previous")}
              >
                <span aria-hidden="true">&#8592;</span>
              </button>
              <div className="infocard-dossier__chapters" role="group" aria-label={t("caseSheet.navLabel")}>
                {CHAPTERS.map((chapter) => {
                  const active = currentPage.chapter === chapter;
                  return (
                    <button
                      key={chapter}
                      type="button"
                      className="infocard-dossier__chapter-pip"
                      data-active={active ? "true" : "false"}
                      aria-current={active ? "true" : undefined}
                      aria-label={`${chapter} — ${
                        chapter === 1
                          ? SECTION_LABEL["building-facts"]
                          : chapter === 2
                            ? SECTION_LABEL.architecture
                            : chapter === 3
                              ? SECTION_LABEL.typography
                              : chapter === 4
                                ? SECTION_LABEL.dialogue
                                : SECTION_LABEL.specimen
                      }`}
                      onClick={() => jumpToChapter(chapter)}
                    >
                      {chapter}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="infocard-dossier__nav-arrow"
                onClick={goNext}
                disabled={!canGoNext}
                aria-label={t("caseSheet.next")}
              >
                <span aria-hidden="true">&#8594;</span>
              </button>
            </nav>
          )}
        </div>
      </EditorialShell>
    </div>
  );
}
