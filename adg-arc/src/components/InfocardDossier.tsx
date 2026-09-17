import { useEffect, useRef, useState } from "react";
import { cases, type CaseRecord } from "../data/cases";
import { useT } from "../i18n/context";
import type { TranslationKey } from "../i18n/es";
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

// Pass F1 (Prompt 045 §6) — structurally equivalent to usePassport's own
// StampResult, declared locally rather than imported: InfocardDossier must
// never import/call usePassport directly, only receive its result through
// the App-owned callback below.
export interface InfocardStampResult {
  stamped: boolean;
  count: number;
  total: number;
}

export interface InfocardDossierProps {
  activeCase: CaseRecord | undefined;
  onClose: () => void;
  onAnchorChange?: (anchor: InfocardDossierAnchor | null) => void;
  stampFeedback?: string | null;
  // Pass F1: App already owns `passport.stamp` — this callback is the sole
  // stamp trigger InfocardDossier ever calls, so canonical passport state
  // never gains a second/parallel writer.
  onStampCurrentCase?: () => InfocardStampResult | null;
}

// Pass F1 (Prompt 045 §8): the five canonical chapter section labels plus
// the highlighted-phrase ("Quote") label now resolve through i18n rather
// than a hardcoded mixed-language map, so the bottom footer pill this pass
// introduces never perpetuates that drift.
const SECTION_LABEL_KEY: Record<Exclude<InfocardPageId, "cover">, TranslationKey> = {
  "building-facts": "caseSheet.section.facts",
  "building-highlight": "caseSheet.section.quote",
  "building-prose": "caseSheet.section.building",
  // Pass F1C: both Arquitectura internal steps carry the same footer-pill
  // label — the split is a step-model change, not a second chapter.
  "architecture-movement": "caseSheet.section.architecture",
  "architecture-prose": "caseSheet.section.architecture",
  typography: "caseSheet.section.typography",
  dialogue: "caseSheet.section.dialogue",
  specimen: "caseSheet.section.specimen",
};

const CHAPTERS: InfocardChapter[] = [1, 2, 3, 4, 5];

const CHAPTER_LABEL_KEY: Record<InfocardChapter, TranslationKey> = {
  1: "caseSheet.section.building",
  2: "caseSheet.section.architecture",
  3: "caseSheet.section.typography",
  4: "caseSheet.section.dialogue",
  5: "caseSheet.section.specimen",
};

// Pass F1 §3: the specimen page is the terminal numbered-chapter page. Past
// it, the dossier moves through two post-chapter steps that live outside
// `useInfocardPagination`'s own chapter/page index entirely (Prompt 044
// preflight Question A, option 2) — kept local here so the validated
// pagination hook stays byte-identical.
type DossierStep = "pages" | "passport-stamp" | "finish";

export default function InfocardDossier({
  activeCase,
  onClose,
  onAnchorChange,
  stampFeedback,
  onStampCurrentCase,
}: InfocardDossierProps) {
  const t = useT();
  const { currentPage, pageIndex, canGoPrevious, canGoNext, goPrevious, goNext, jumpToChapter } =
    useInfocardPagination(activeCase);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Pass F1 §3/§6: local post-chapter step state, reset to "pages" whenever
  // the active case changes — never persisted to URL/storage, mirroring how
  // `useInfocardPagination` itself resets `pageIndex` on the same dependency.
  const [step, setStep] = useState<DossierStep>("pages");
  useEffect(() => {
    setStep("pages");
  }, [activeCase?.slug]);
  // Guards against a double-fire of the stamp target between the click and
  // the resulting `setStep("finish")` re-render actually unmounting it.
  const stampingRef = useRef(false);
  const handleStampActivate = () => {
    if (stampingRef.current) return;
    stampingRef.current = true;
    const result = onStampCurrentCase ? onStampCurrentCase() : null;
    if (result) {
      setStep("finish");
    } else {
      stampingRef.current = false;
    }
  };

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
  // Pass F1B (prompt 046 §4A): the top-row marker is a circled digit, not a
  // zero-padded ordinal — the leading zero read as an artifact once the
  // number sits inside a small circle rather than as loose bold text.
  const ordinalLabel = String(Math.max(ordinal, 0));
  const isCover = currentPage?.id === "cover";
  const isSpecimen = currentPage?.id === "specimen";
  // Narrowed inline (`currentPage.id !== "cover"`, not the derived `isCover`
  // boolean) so TypeScript can discriminate `currentPage.id` down to
  // `Exclude<InfocardPageId, "cover">` before indexing the content-only
  // `SECTION_LABEL_KEY` record — TS7053 fix, no `any`/unsafe assertion.
  const sectionLabel =
    currentPage && currentPage.id !== "cover" ? t(SECTION_LABEL_KEY[currentPage.id]) : null;
  const resolvedMovement =
    activeCase.architecture.movementStatus === "verified" && activeCase.architecture.movement
      ? activeCase.architecture.movement
      : null;

  const renderPage = () => {
    if (!currentPage) return null;

    switch (currentPage.id) {
      case "cover":
        return (
          <InfocardCoverPage caseName={activeCase.identity.name} heroMedia={activeCase.heroMedia} />
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
        // No in-body heading — the footer pill already carries the section label.
        return <InfocardProsePage copy={activeCase.infocard.buildingProse} />;
      case "architecture-movement":
        // Pass F1C §F: movement-only composition — no heading (the footer
        // pill already reads "Arquitectura") and no running text, so this
        // step never merges the movement block with the prose block.
        return (
          <InfocardProsePage
            className="infocard-page--architecture infocard-page--architecture-movement"
            meta={
              <div className="infocard-page__meta-line">
                <span className="infocard-page__meta-label">{t("caseSheet.movementPrefix")}</span>
                <strong className="infocard-page__meta-value">
                  {resolvedMovement ?? t("caseSheet.movementTbdInline")}
                </strong>
              </div>
            }
          />
        );
      case "architecture-prose":
        // Pass F1C §F: running-text-only composition — same footer pill,
        // same chapter dot, no meta block, no heading.
        return (
          <InfocardProsePage
            className="infocard-page--architecture infocard-page--architecture-prose"
            copy={activeCase.infocard.architectureCopy}
          />
        );
      case "typography":
        // No in-body heading — the large typeface treatment carries the page.
        return (
          <InfocardProsePage
            className="infocard-page--typography"
            copy={activeCase.infocard.typographyCopy}
            meta={
              <p className="infocard-page__meta-typeface">{activeCase.typography.primaryFamily}</p>
            }
          />
        );
      case "dialogue":
        // No in-body heading — the footer pill already carries the section
        // label. Pass F1C §H: a page-specific class carries the "more
        // contained" measure correction in CSS.
        return (
          <InfocardProsePage
            className="infocard-page--dialogue"
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
            {/* Pass F1B (prompt 046 §4A): the row's third slot — structurally
                present per the target's three-slot identity row, but never a
                reintroduced text section label (that stays in the footer
                pill, §5C). A bare hairline, not a control. */}
            <span className="infocard-dossier__row-right" aria-hidden="true" />
          </div>

          {stampFeedback && (
            <p className="infocard-dossier__stamp-feedback" role="status">
              {stampFeedback}
            </p>
          )}

          {step === "pages" && (
            <>
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
                  <span className="infocard-dossier__nav-pill">{sectionLabel}</span>
                  <div className="infocard-dossier__nav-controls">
                    <button
                      type="button"
                      className="infocard-dossier__nav-arrow"
                      onClick={goPrevious}
                      disabled={!canGoPrevious}
                      aria-label={t("caseSheet.previous")}
                    >
                      <span aria-hidden="true">&#8592;</span>
                    </button>
                    <div
                      className="infocard-dossier__chapters"
                      role="group"
                      aria-label={t("caseSheet.navLabel")}
                    >
                      {CHAPTERS.map((chapter) => {
                        const active = currentPage.chapter === chapter;
                        return (
                          <button
                            key={chapter}
                            type="button"
                            className="infocard-dossier__chapter-pip"
                            data-active={active ? "true" : "false"}
                            aria-current={active ? "true" : undefined}
                            aria-label={`${chapter} — ${t(CHAPTER_LABEL_KEY[chapter])}`}
                            onClick={() => jumpToChapter(chapter)}
                          >
                            {chapter}
                          </button>
                        );
                      })}
                    </div>
                    {isSpecimen ? (
                      <button
                        type="button"
                        className="infocard-dossier__nav-arrow"
                        onClick={() => setStep("passport-stamp")}
                        aria-label={t("caseSheet.next")}
                      >
                        <span aria-hidden="true">&#10003;</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="infocard-dossier__nav-arrow"
                        onClick={goNext}
                        disabled={!canGoNext}
                        aria-label={t("caseSheet.next")}
                      >
                        <span aria-hidden="true">&#8594;</span>
                      </button>
                    )}
                  </div>
                </nav>
              )}
            </>
          )}

          {step === "passport-stamp" && (
            <>
              <div className="infocard-dossier__content infocard-dossier__content--page infocard-dossier__content--stamp">
                <button
                  type="button"
                  className="infocard-dossier__stamp-target"
                  onClick={handleStampActivate}
                  aria-label={t("passport.stampInstruction")}
                >
                  <span className="infocard-dossier__stamp-tick" aria-hidden="true">
                    &#10003;
                  </span>
                </button>
                <p className="infocard-dossier__stamp-instruction">{t("passport.stampInstruction")}</p>
              </div>
              <nav className="infocard-dossier__nav" aria-label={t("caseSheet.navLabel")}>
                <span className="infocard-dossier__nav-pill">{t("passport.railLabel")}</span>
                <div className="infocard-dossier__nav-controls">
                  <button
                    type="button"
                    className="infocard-dossier__nav-arrow"
                    onClick={() => setStep("pages")}
                    aria-label={t("caseSheet.previous")}
                  >
                    <span aria-hidden="true">&#8592;</span>
                  </button>
                  <button
                    type="button"
                    className="infocard-dossier__nav-arrow"
                    disabled
                    aria-label={t("caseSheet.next")}
                  >
                    <span aria-hidden="true">&#8594;</span>
                  </button>
                </div>
              </nav>
            </>
          )}

          {step === "finish" && (
            <div className="infocard-dossier__content infocard-dossier__content--page infocard-dossier__content--finish">
              <span className="infocard-dossier__finish-check" aria-hidden="true">
                &#10003;
              </span>
              <p className="infocard-dossier__finish-heading">{t("caseSheet.finishHeading")}</p>
              <button type="button" className="infocard-dossier__finish-return" onClick={onClose}>
                {t("caseSheet.returnToMap")}
              </button>
            </div>
          )}
        </div>
      </EditorialShell>
    </div>
  );
}
