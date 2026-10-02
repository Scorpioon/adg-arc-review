import { useEffect, useMemo, useRef, useState } from "react";
import { activeCases, SPECIMEN_MEDIA, type CaseRecord } from "../data/cases";
import { useT } from "../i18n/context";
import type { TranslationKey } from "../i18n/es";
import type { PanelAnchor } from "../types/panelAnchor";
import EditorialShell from "./EditorialShell";
import {
  InfocardCoverPage,
  InfocardFactsPage,
  InfocardHeroCredit,
  InfocardHighlightedPhrasePage,
  InfocardProsePage,
  InfocardSpecimenPage,
} from "./InfocardPages";
import NavArrowGlyph from "./NavArrowGlyph";
import { useInfocardPagination, type InfocardPageId } from "../hooks/useInfocardPagination";

// TG012 Pass C — final selected-case dossier. Composes the validated Pass A
// data (cases.ts) through the validated Pass B primitives (InfocardPages)
// and pagination hook (useInfocardPagination) inside the shared
// EditorialShell chrome. Mounted into App.tsx as the live case-detail
// surface since TG012 Pass D.

// TG017: backed by the shared `PanelAnchor` type (extracted from the
// retired CaseSheet.tsx) rather than a locally-duplicated shape, so this
// and MapView's tether-target prop can never structurally diverge.
export type InfocardDossierAnchor = PanelAnchor;

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
  // TG014 (QR Contract v1): App-resolved gate for the Touch to Check control
  // — false for a physical case with no locally-proven visit, true for a
  // proven physical case or any digital case. Defaults to true so existing
  // callers/tests that omit it keep the pre-TG014 always-enabled behavior.
  stampEnabled?: boolean;
  // Pre-resolved (via i18n) explanatory copy shown in place of the ordinary
  // stamp instruction while `stampEnabled` is false.
  stampDisabledReason?: string | null;
  // Pre-resolved restrained status text for an invalid/mismatched physical
  // proof token — never blocks reading, never stamps, never persists proof.
  proofStatus?: string | null;
}

// Pass F1 (Prompt 045 §8): the five canonical chapter section labels plus
// the highlighted-phrase ("Quote") label now resolve through i18n rather
// than a hardcoded mixed-language map, so the bottom footer pill this pass
// introduces never perpetuates that drift.
const SECTION_LABEL_KEY: Record<Exclude<InfocardPageId, "cover">, TranslationKey> = {
  "building-facts": "caseSheet.section.facts",
  "building-highlight": "caseSheet.section.quote",
  "building-prose": "caseSheet.section.building",
  // TG028 (ADGARC-FB-110 page grammar): the movement-only step is its own
  // "Moviment" page, not a second "Arquitectura" — the running-text step
  // below keeps the Arquitectura label.
  "architecture-movement": "caseSheet.section.movement",
  "architecture-prose": "caseSheet.section.architecture",
  typography: "caseSheet.section.typography",
  dialogue: "caseSheet.section.dialogue",
  specimen: "caseSheet.section.specimen",
};

// TG020-R3 (FB-065/FB-066): the lower navbar's five numbered circles are
// canonical *chapters*, not a moving window over the real page/subpage list
// useInfocardPagination.ts builds (cover, building-facts, building-highlight?,
// building-prose, architecture-movement, architecture-prose, typography,
// dialogue, specimen — up to nine entries). This table is the one place that
// groups those page ids under their chapter; `cover` is deliberately absent
// (Explora is page 0, outside the numbered sequence per the R3 authority).
// Arrows keep paging through every real page/subpage exactly as before —
// only the five circles read through this grouping instead of indexing
// `descriptors` directly.
const CHAPTER_OF_PAGE: Partial<Record<InfocardPageId, number>> = {
  "building-facts": 1,
  "building-highlight": 1,
  "building-prose": 1,
  "architecture-movement": 2,
  "architecture-prose": 2,
  typography: 3,
  dialogue: 4,
  specimen: 5,
};
const CHAPTER_COUNT = 5;

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
  stampEnabled = true,
  stampDisabledReason,
  proofStatus,
}: InfocardDossierProps) {
  const t = useT();
  const { descriptors, currentPage, pageIndex, canGoPrevious, canGoNext, goPrevious, goNext, goToPage } =
    useInfocardPagination(activeCase);

  // TG020-R3 (FB-065/FB-066): first real-page index per chapter, derived
  // from whatever `descriptors` this case actually has (the optional
  // building-highlight page shifts every chapter after it by one — this
  // reads that live rather than assuming a fixed layout). Clicking a
  // chapter circle jumps to this index; the arrows are untouched and keep
  // paging through every descriptor, subpages included.
  const chapterStartIndex = useMemo(() => {
    const map = new Map<number, number>();
    descriptors.forEach((descriptor, index) => {
      const chapter = CHAPTER_OF_PAGE[descriptor.id];
      if (chapter !== undefined && !map.has(chapter)) map.set(chapter, index);
    });
    return map;
  }, [descriptors]);
  const currentChapter = currentPage ? CHAPTER_OF_PAGE[currentPage.id] ?? 0 : 0;

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
    if (stampingRef.current || !stampEnabled) return;
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

  // TG020-R1: derived from the public/active case list, not the full 31-
  // record dataset — "case lookup" is one of the surfaces the visibility
  // correction requires to track `activeCases`, so this ordinal can never
  // drift from what the Passport/navbar show. A hidden case opened directly
  // via `?case=<slug>` resolves to -1 here (`Math.max(ordinal, 0)` below
  // already handled the "not found" case before this change) — its dossier
  // still opens, it just carries no public ordinal.
  const ordinal = activeCases.findIndex((c) => c.slug === activeCase.slug) + 1;
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
  // FB-117 (TG033 Prompt 073 corrective): the case's own structured
  // building-name/typeface-name terms, shared by every editorial prose page
  // below so a verbatim occurrence in any of them renders with the same
  // inline emphasis — never recomputed per page, never parsed from the
  // running copy itself.
  const emphasisTerms = {
    boldTerm: activeCase.typography.primaryFamily,
    underlineTerm: activeCase.identity.name,
  };

  const renderPage = () => {
    if (!currentPage) return null;

    switch (currentPage.id) {
      case "cover":
        return (
          <InfocardCoverPage caseName={activeCase.identity.name} heroMedia={activeCase.heroMedia} />
        );
      case "building-facts":
        // TG018 Pass C (correction matrix §D): Moviment is not passed to
        // this page at all — it stays live only on the dedicated
        // "architecture-movement" page below.
        return (
          <InfocardFactsPage
            dateLabel={activeCase.identity.date.displayLabel}
            architect={activeCase.identity.architect}
            // FB-109 (TG029): prefer the verified Catalan display-canon
            // form where one exists; `identity.address` (the preserved
            // source-evidence value) is the fallback, never overwritten.
            address={activeCase.identity.addressDisplay ?? activeCase.identity.address ?? null}
            labels={{
              year: t("caseSheet.fact.year"),
              architect: t("caseSheet.fact.architect"),
              address: t("caseSheet.fact.address"),
            }}
          />
        );
      case "building-highlight":
        return activeCase.infocard.highlightedPhrase ? (
          <InfocardHighlightedPhrasePage phrase={activeCase.infocard.highlightedPhrase} />
        ) : null;
      case "building-prose":
        // No in-body heading — the footer pill already carries the section
        // label. TG020-R1 (FB-051): its own class so the prose-centering/
        // size correction below can target L'edifici specifically, the same
        // way Arquitectura/Diàleg already carry their own modifier classes.
        return (
          <InfocardProsePage
            className="infocard-page--building"
            copy={activeCase.infocard.buildingProse}
            emphasis={emphasisTerms}
          />
        );
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
            emphasis={emphasisTerms}
          />
        );
      case "typography":
        // No in-body heading — the large typeface treatment carries the page.
        // TG033 Prompt 073 corrective (ADGARC-FB-117): the typeface-name
        // meta line is back to its pre-TG033 form — just the family name,
        // the page's own existing display-size/bold presentation. The prior
        // pass additionally showed the building name here as a second,
        // underlined meta line; the OPERATOR runtime review clarified that
        // was a misreading — FB-117's bold/underline requirement targets
        // verbatim occurrences inside the existing editorial running copy,
        // not a new title/meta row, so that line is removed and `emphasis`
        // (below) carries the real requirement into the page's own running
        // text instead. The page's own CSS (`.infocard-page--typography`)
        // still left-aligns this meta block to the same edge as the body
        // copy beneath it.
        return (
          <InfocardProsePage
            className="infocard-page--typography"
            copy={activeCase.infocard.typographyCopy}
            emphasis={emphasisTerms}
            meta={<p className="infocard-page__meta-typeface">{activeCase.typography.primaryFamily}</p>}
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
            emphasis={emphasisTerms}
          />
        );
      case "specimen":
        // TG033 (ADGARC-FB-115): resolved from the locked slug lookup —
        // `undefined` (no locked specimen for this case) normalizes to
        // `null` so InfocardSpecimenPage renders its honest empty frame.
        return <InfocardSpecimenPage media={SPECIMEN_MEDIA[activeCase.slug] ?? null} />;
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
            {/* TG018 Pass C (operator decision): the former third-slot
                hairline is removed with no replacement — the row is now a
                two-slot identity row.
                TG028 (ADGARC-FB-107): the number circle and title now share
                a top-aligned edge (was vertically centered) — see
                `.infocard-dossier__row-left` in global.css. */}
            <div className="infocard-dossier__row-left">
              <span className="infocard-dossier__ordinal">{ordinalLabel}</span>
              {/* TG028 (ADGARC-FB-107): renders `identity.displayNameLines`
                  when a case supplies a deterministic editorial break,
                  falling back to the plain name otherwise — a 20-case
                  system, not a one-off per-case override. */}
              <span className="infocard-dossier__case-name">
                {(activeCase.identity.displayNameLines ?? [activeCase.identity.name]).map(
                  (line, index) => (
                    <span key={index} className="infocard-dossier__case-name-line">
                      {line}
                    </span>
                  )
                )}
              </span>
            </div>
          </div>

          {stampFeedback && (
            <p className="infocard-dossier__stamp-feedback" role="status">
              {stampFeedback}
            </p>
          )}

          {proofStatus && (
            <p className="infocard-dossier__proof-status" role="status">
              {proofStatus}
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
              </div>

              {/* TG019 Pass D (operator feedback §10): `Explora →` used to
                  render inside the cover's own content flow, allocating a
                  row of its own and leaving an unused extra footer-height gap
                  below it (evidence 14_explora_extra_row_height.png) — every
                  other page already has a footer row here, the cover simply
                  never rendered one. Reusing the same `.infocard-dossier__nav`
                  footer for the cover too puts Explora at the identical
                  vertical level as every other page's controls and hands the
                  freed height back to the hero-media slot above
                  (`.infocard-page__hero`'s own `flex: 1 1 auto` absorbs it). */}
              {currentPage && (
                <nav
                  className={`infocard-dossier__nav${
                    isCover ? " infocard-dossier__nav--cover" : ""
                  }`}
                  aria-label={t("caseSheet.navLabel")}
                >
                  {isCover ? (
                    <>
                      <button type="button" className="infocard-dossier__explore" onClick={goNext}>
                        {/* Operator corrective: the label/arrow gap is now
                            the shared pill rule's own `gap` (global.css) —
                            structural, not an incidental JSX whitespace
                            character between these two children. */}
                        <span>Explora</span>
                        <NavArrowGlyph direction="next" />
                      </button>
                      {/* TG033 Prompt 073 corrective (ADGARC-FB-114): the
                          image credit now shares this same footer row with
                          Explora — using the remaining horizontal space —
                          instead of a second centered row below the hero
                          frame (InfocardCoverPage no longer renders it). */}
                      {activeCase.heroMedia && (
                        <InfocardHeroCredit credits={activeCase.heroMedia.credits} />
                      )}
                    </>
                  ) : (
                    <>
                      <span className="infocard-dossier__nav-pill">{sectionLabel}</span>
                      <div className="infocard-dossier__nav-controls">
                        <button
                          type="button"
                          className="infocard-dossier__nav-arrow"
                          onClick={goPrevious}
                          disabled={!canGoPrevious}
                          aria-label={t("caseSheet.previous")}
                        >
                          <NavArrowGlyph direction="previous" />
                        </button>
                        {/* TG020-R3 (FB-065/FB-066): exactly five canonical
                            chapter circles, never a moving window over the
                            real page/subpage count — `chapterStartIndex`
                            above groups the real `descriptors` list under
                            each chapter. A circle activates when the current
                            *page* belongs to that chapter (any of its
                            subpages), and clicking one jumps straight to the
                            chapter's first page; the arrows on either side
                            are unchanged page-flow controls and still walk
                            every subpage in between. */}
                        <div
                          className="infocard-dossier__page-window"
                          role="group"
                          aria-label={t("caseSheet.navLabel")}
                        >
                          {Array.from({ length: CHAPTER_COUNT }, (_, i) => {
                            const chapter = i + 1;
                            const active = chapter === currentChapter;
                            const targetIndex = chapterStartIndex.get(chapter);
                            return (
                              <button
                                key={chapter}
                                type="button"
                                className="infocard-dossier__page-pip"
                                data-active={active ? "true" : "false"}
                                aria-current={active ? "true" : undefined}
                                aria-label={t("caseSheet.chapterOrdinal", {
                                  index: chapter,
                                  total: CHAPTER_COUNT,
                                })}
                                disabled={targetIndex === undefined}
                                onClick={() => {
                                  if (targetIndex !== undefined) goToPage(targetIndex);
                                }}
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
                            <NavArrowGlyph direction="next" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </nav>
              )}
            </>
          )}

          {step === "passport-stamp" && (
            <>
              <div className="infocard-dossier__content infocard-dossier__content--page infocard-dossier__content--stamp">
                {/* TG033 Prompt 077 corrective (Figma spacing / frame-contract
                    authority): this wrapper is the Passport content frame —
                    the minimal structural addition needed so the outer
                    `--dossier-space-x` inset (on the content div above) and
                    an additional inner `--dossier-space-x` content padding
                    (on this frame) can both apply; see
                    `.infocard-dossier__stamp-frame`'s own comment in
                    global.css for why one element can't carry both. */}
                <div className="infocard-dossier__stamp-frame">
                  <button
                    type="button"
                    className="infocard-dossier__stamp-target"
                    onClick={handleStampActivate}
                    disabled={!stampEnabled}
                    aria-disabled={!stampEnabled}
                    aria-label={stampEnabled ? t("passport.stampInstruction") : stampDisabledReason ?? undefined}
                  >
                    <span className="infocard-dossier__stamp-tick" aria-hidden="true">
                      &#10003;
                    </span>
                  </button>
                  <p className="infocard-dossier__stamp-instruction">
                    {stampEnabled ? t("passport.stampInstruction") : stampDisabledReason}
                  </p>
                </div>
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
                    <NavArrowGlyph direction="previous" />
                  </button>
                  <button
                    type="button"
                    className="infocard-dossier__nav-arrow"
                    disabled
                    aria-label={t("caseSheet.next")}
                  >
                    <NavArrowGlyph direction="next" />
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
