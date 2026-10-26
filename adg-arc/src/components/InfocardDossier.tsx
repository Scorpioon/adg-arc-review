import { useEffect, useRef, useState } from "react";
import { activeCases, SPECIMEN_MEDIA, type CaseRecord } from "../data/cases";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
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
  InfocardTypographyPhotoPage,
  InfocardTypographySheetPage,
} from "./InfocardPages";
import NavArrowGlyph from "./NavArrowGlyph";
import { useInfocardPagination, type InfocardPageId } from "../hooks/useInfocardPagination";
import { useLocalizedCase } from "../hooks/useLocalizedCase";

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
  // TG039 (FB-126 browser-smoke corrective): App-resolved
  // `passport.visited.has(activeCase.slug)` for the current case. The sole
  // signal the passport-stamp step uses to recognize an already-registered
  // visit on re-entry — InfocardDossier never reads `usePassport` itself.
  isVisited?: boolean;
}

// Pass F1 (Prompt 045 §8): the five canonical chapter section labels plus
// the highlighted-phrase ("Quote") label now resolve through i18n rather
// than a hardcoded mixed-language map, so the bottom footer pill this pass
// introduces never perpetuates that drift.
const SECTION_LABEL_KEY: Record<Exclude<InfocardPageId, "cover">, TranslationKey> = {
  "building-facts": "caseSheet.section.facts",
  "building-highlight": "caseSheet.section.quote",
  "building-prose": "caseSheet.section.building",
  "architecture-prose": "caseSheet.section.architecture",
  // TG049 Stage 1 Phase C A01 (OPERATOR-approved): new shared footer-pill
  // label for the "Fotografia de la tipografia" step — a dedicated key, not
  // a reuse of `caseSheet.section.typography` below (which is renamed to
  // "Caràcters" this same pass and labels a different, existing page).
  "typography-photo": "caseSheet.section.typographyPhoto",
  // TG051 IMP-01 (OPERATOR-approved): footer-pill label for the new "Fitxa de
  // la tipografia" step. Its own key — not a reuse of `caseSheet.section.facts`
  // ("Fitxa", the building sheet's label), which labels a different page.
  "typography-sheet": "caseSheet.section.typographySheet",
  typography: "caseSheet.section.typography",
  dialogue: "caseSheet.section.dialogue",
  specimen: "caseSheet.section.specimen",
};

// MTG01_R2 FB-011/FB-012 (OPERATOR, evidence 02/03/04_header_*.png): which of
// the identity row's two divisions is lit on each page. Every page belongs to
// exactly one half of the dossier — the building or the typeface — except
// Diàleg, which is the page about their encounter and therefore lights both.
//
// Declared as a total `Record` over `InfocardPageId` rather than as a derived
// rule (e.g. "ids starting with typography"), so adding a page to
// `useInfocardPagination` is a compile error here until its header state is
// stated explicitly — the state is editorial, not inferable from a name.
// `typography-photo` keeps its entry even though it is hidden from public
// pagination this same pass (FB-015): the record stays exhaustive, and the
// page is correct the moment it is reinstated.
const HEADER_SLOTS: Record<InfocardPageId, { building: boolean; typography: boolean }> = {
  // P0-P4 — the building half.
  cover: { building: true, typography: false },
  "building-facts": { building: true, typography: false },
  "building-highlight": { building: true, typography: false },
  "building-prose": { building: true, typography: false },
  "architecture-prose": { building: true, typography: false },
  // P5-P7 — the typeface half.
  "typography-photo": { building: false, typography: true },
  "typography-sheet": { building: false, typography: true },
  typography: { building: false, typography: true },
  // P8 — the encounter: both lit (OPERATOR annotation on frame 34, "cuando se
  // habla de la union de los dos edificios salen ambos activos").
  dialogue: { building: true, typography: true },
  // P9 — the specimen is a typeface artifact, so it stays typography-owned.
  // Explicitly NOT withdrawn from the public sequence (FB-024).
  specimen: { building: false, typography: true },
};

// TG041 (ADGARC-FB-110/FB-128): the lower navbar's numbered circles are one
// per *real rendered page*, not a fixed five-chapter grouping — TG020-R3's
// own chapter window (which collapsed every subpage of a chapter onto one
// shared circle) is retired per FB-110's locked page grammar ("number pages
// individually, not by chapter group") and FB-128's explicit requirement
// ("one rendered dossier page = one sequential numbered navigation item").
// `descriptors` (useInfocardPagination.ts) is already the one real-page
// authority — `pageIndex`/`goToPage` index it directly, so this nav no
// longer needs a second grouping table or a derived "current chapter";
// `cover` stays outside the numbered rail exactly as it did under the
// chapter model (Explora is page 0, not part of the numbered sequence).

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
  isVisited = false,
}: InfocardDossierProps) {
  const t = useT();
  const { descriptors, currentPage, pageIndex, canGoPrevious, canGoNext, goPrevious, goNext, goToPage } =
    useInfocardPagination(activeCase);
  // TG063 IMP-02B: single resolver boundary for editorial display text.
  // `useLocalizedCase` requires a `CaseRecord` (unlike `useInfocardPagination`
  // above), so this unconditional top-level call — required by the Rules of
  // Hooks, since `activeCase` may still be undefined below — falls back to
  // any already-imported `activeCases[0]` only to keep the call type-safe;
  // that fallback result is never read, since the component returns null
  // right below whenever `activeCase` itself is undefined.
  const localizedCase = useLocalizedCase(activeCase ?? activeCases[0]);
  const reducedMotion = usePrefersReducedMotion();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  // TG041 (ADGARC-FB-128): the single horizontally scrollable page-nav
  // rail's own scroll owner, plus a live index->element map of its pips —
  // same measured-rect-delta pattern PassportPane's `focusStop` already
  // uses for its circle rail, scoped here to one effect that re-centers
  // whichever pip is current (see below) rather than a click-triggered
  // callback, since this rail's one canonical index (`pageIndex`) can also
  // change via the prev/next arrows or a swipe-driven tap, not just a pip
  // click.
  const pageWindowRef = useRef<HTMLDivElement | null>(null);
  const pagePipRefs = useRef(new Map<number, HTMLButtonElement>());

  // Pass F1 §3/§6: local post-chapter step state, reset to "pages" whenever
  // the active case changes — never persisted to URL/storage, mirroring how
  // `useInfocardPagination` itself resets `pageIndex` on the same dependency.
  const [step, setStep] = useState<DossierStep>("pages");
  // Guards against a double-fire of the stamp target between the click and
  // the resulting `setStep("finish")` re-render actually unmounting it.
  const stampingRef = useRef(false);
  // TG039 (FB-126 browser-smoke corrective): InfocardDossier is mounted
  // once by App and never remounted as `activeCase` changes (only this
  // prop changes), so both `step` and `stampingRef` are shared across every
  // case the user opens in a session. Without resetting `stampingRef` here
  // too, the guard set by the very first successful stamp stayed `true`
  // forever and silently no-opped `handleStampActivate` for every later
  // case — the root cause of "only one stamp can ever be collected."
  useEffect(() => {
    setStep("pages");
    stampingRef.current = false;
  }, [activeCase?.slug]);
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

  // TG041 (ADGARC-FB-128): "active page subtly auto-centers". `pageIndex`
  // is the one canonical index driving arrows, pips and page content alike
  // (goPrevious/goNext/a pip click/`goToPage` all funnel through it), so
  // centering here — on that single value changing — covers every
  // navigation method with no second trigger. Measured off live rects
  // (PassportPane's own `focusStop` idiom) rather than `scrollIntoView`,
  // which would risk scrolling an ancestor too; applied as a delta on the
  // rail's own `scrollLeft` so a swipe mid-flight is never fought, only
  // nudged. Missing refs (cover page, where this rail does not render) are
  // a silent no-op, not an error.
  useEffect(() => {
    const track = pageWindowRef.current;
    const item = pagePipRefs.current.get(pageIndex);
    if (!track || !item) return;
    const trackRect = track.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const delta = itemRect.left + itemRect.width / 2 - (trackRect.left + trackRect.width / 2);
    if (Math.abs(delta) < 1) return;
    track.scrollTo({ left: track.scrollLeft + delta, behavior: reducedMotion ? "auto" : "smooth" });
  }, [pageIndex, reducedMotion]);

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
  // MTG01_R2 FB-012: which header divisions are lit for the page being read.
  // Falls back to the cover's own state only for the impossible-in-practice
  // case of an empty descriptor list (the component has already returned null
  // for a missing `activeCase` above), so this is never an invented state for
  // a real page.
  const headerSlots = currentPage ? HEADER_SLOTS[currentPage.id] : HEADER_SLOTS.cover;
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
  // TG051 IMP-01: the Caràcters page's optional typeface link target. Resolved
  // once here, trimmed so a whitespace-only field counts as absent, and
  // narrowed to `string | null` — the page below renders the link only when
  // this is non-null, never a fabricated or empty href.
  const trimmedTypographySourceUrl = activeCase.typography.sourceUrl?.trim();
  const typographySourceUrl =
    trimmedTypographySourceUrl && trimmedTypographySourceUrl.length > 0
      ? trimmedTypographySourceUrl
      : null;

  const renderPage = () => {
    if (!currentPage) return null;

    switch (currentPage.id) {
      case "cover":
        return (
          <InfocardCoverPage
            caseName={activeCase.identity.name}
            heroMedia={localizedCase.heroMedia}
            isVisited={isVisited}
          />
        );
      case "building-facts":
        // TG049 Stage 1 Phase C (OPERATOR-approved): Moviment is now a
        // fourth fact row here, resolved exactly as the former
        // "architecture-movement" page resolved it below — the dedicated
        // page is retired (useInfocardPagination.ts), not duplicated.
        return (
          <InfocardFactsPage
            dateLabel={activeCase.identity.date.displayLabel}
            architect={activeCase.identity.architect}
            movement={resolvedMovement ?? t("caseSheet.movementTbdInline")}
            // FB-109 (TG029): prefer the verified Catalan display-canon
            // form where one exists; `identity.address` (the preserved
            // source-evidence value) is the fallback, never overwritten.
            address={activeCase.identity.addressDisplay ?? activeCase.identity.address ?? null}
            labels={{
              year: t("caseSheet.fact.year"),
              architect: t("caseSheet.fact.architect"),
              address: t("caseSheet.fact.address"),
              movement: t("caseSheet.section.movement"),
            }}
          />
        );
      case "building-highlight":
        return localizedCase.infocard.highlightedPhrase ? (
          <InfocardHighlightedPhrasePage phrase={localizedCase.infocard.highlightedPhrase} />
        ) : null;
      case "building-prose":
        // No in-body heading — the footer pill already carries the section
        // label. TG020-R1 (FB-051): its own class so the prose-centering/
        // size correction below can target L'edifici specifically, the same
        // way Arquitectura/Diàleg already carry their own modifier classes.
        return (
          <InfocardProsePage
            className="infocard-page--building"
            copy={localizedCase.infocard.buildingProse}
            emphasis={emphasisTerms}
          />
        );
      case "architecture-prose":
        // Pass F1C §F: running-text-only composition — same footer pill,
        // same chapter dot, no meta block, no heading.
        return (
          <InfocardProsePage
            className="infocard-page--architecture infocard-page--architecture-prose"
            copy={localizedCase.infocard.architectureCopy}
            emphasis={emphasisTerms}
          />
        );
      case "typography-photo":
        // TG049 Stage 1 Phase C A01 (OPERATOR-approved): shared page, no
        // per-case branching — `activeCase.typography.photo` resolves to
        // `null` for every active case today (0/20, unchanged from the
        // Prompt 01 preflight), so this always renders the honest empty
        // frame; it will start rendering real photographs the moment any
        // case record populates that optional field, with no code change
        // needed here.
        // MTG01_R2 FB-013: the typeface name is no longer passed — the
        // two-division header above states it on every typography-owned page,
        // so the page's own in-body copy of it is removed. FB-015 withdraws
        // this step from the public sequence, so this branch is currently
        // unreachable in the product; it is kept (and kept correct) because
        // the withdrawal is a one-line, reversible change in
        // useInfocardPagination.ts.
        return <InfocardTypographyPhotoPage photo={activeCase.typography.photo ?? null} />;
      case "typography-sheet":
        // TG051 IMP-01 (OPERATOR-approved): the typography counterpart of
        // `building-facts` above — same shared fact-row grammar, resolved
        // from this case's own `CaseTypography` record. The optional fields
        // normalize `undefined` to `null` here (the same `?? null` the
        // typography photo already uses) so the page's own omit-when-null
        // rule has one unambiguous signal; no value is defaulted or invented
        // to fill a row. `sourceUrl` is intentionally not passed — it is the
        // Caràcters link below, not a fact row.
        return (
          <InfocardTypographySheetPage
            primaryFamily={activeCase.typography.primaryFamily}
            designer={activeCase.typography.designer ?? null}
            classification={activeCase.typography.classification ?? null}
            year={activeCase.typography.year ?? null}
            labels={{
              typeface: t("caseSheet.fact.typeface"),
              designer: t("caseSheet.fact.designer"),
              classification: t("caseSheet.fact.classification"),
              // Reuses the existing fact-label key the building sheet already
              // uses for its own date row — same word, one definition.
              year: t("caseSheet.fact.year"),
            }}
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
        // TG051 IMP-01 (OPERATOR-approved): a small `link a tipografia` below
        // the running paragraph, in the same visual treatment as the hero
        // image-credit link (the CSS rule itself is shared — see
        // `.infocard-page__source-link` in global.css). Rendered when and only
        // when this case's record carries a non-empty `typography.sourceUrl`;
        // 6 of the 20 active cases do today, and the other 14 render no link
        // rather than a fabricated or dead one. The anchor's text is the
        // localized label, so it always has a discernible accessible name, and
        // `target`/`rel` match `InfocardHeroCredit` exactly.
        return (
          <InfocardProsePage
            className="infocard-page--typography"
            copy={localizedCase.infocard.typographyCopy}
            emphasis={emphasisTerms}
            meta={<p className="infocard-page__meta-typeface">{activeCase.typography.primaryFamily}</p>}
            footer={
              typographySourceUrl ? (
                <p className="infocard-page__source-link">
                  <a href={typographySourceUrl} target="_blank" rel="noopener noreferrer">
                    {t("caseSheet.typographyLink")}
                  </a>
                </p>
              ) : null
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
            copy={localizedCase.infocard.dialogueCopy}
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
          {/* MTG01_R2 FB-011/FB-012: the identity row is now the Passport's
              two-division header — a leading ordinal cell, the EDIFICI
              division, and the TIPOGRAFIA division — with exactly the
              geometry the OPERATOR mockups show (frames 32-34). Both
              divisions are always present on every page; `data-active` is
              what lights one, the other, or (on Diàleg) both. They are
              deliberately plain `<span>`s, not buttons or tabs: the handoff
              forbids any secondary click behaviour here without approval, so
              there is no `onClick`, no `role="tab"` and no focusable target.
              Rendered as a labelled group so the two divisions are
              distinguishable to assistive tech, whose own state is carried in
              words (`caseSheet.header.slotInactive`) and never by the visual
              on/off treatment alone. */}
          <div
            className="infocard-dossier__row"
            role="group"
            aria-label={t("caseSheet.navLabel")}
          >
            <span className="infocard-dossier__ordinal">{ordinalLabel}</span>
            {/* TG028 (ADGARC-FB-107): renders `identity.displayNameLines`
                when a case supplies a deterministic editorial break, falling
                back to the plain name otherwise — a 20-case system, not a
                one-off per-case override. MTG01_R2 FB-025: full names still
                wrap freely and are never ellipsized; the division's own
                `min-width: 0` in global.css is what lets a long name (Torre
                Baró and friends) wrap inside the narrower two-division row
                instead of forcing the row to overflow. */}
            <span
              className="infocard-dossier__slot infocard-dossier__slot--building"
              data-active={headerSlots.building ? "true" : "false"}
            >
              <span className="infocard-dossier__case-name">
                {(activeCase.identity.displayNameLines ?? [activeCase.identity.name]).map(
                  (line, index) => (
                    <span key={index} className="infocard-dossier__case-name-line">
                      {line}
                    </span>
                  )
                )}
              </span>
              <span className="visually-hidden">
                {headerSlots.building
                  ? t("caseSheet.header.buildingSlot")
                  : `${t("caseSheet.header.buildingSlot")} — ${t("caseSheet.header.slotInactive")}`}
              </span>
            </span>
            {/* The typeface division states `typography.primaryFamily` — the
                same non-nullable record field the typography sheet and
                Caràcters pages already read, never a second or derived name.
                This is also what makes FB-013's removal of the in-body
                "Arlette" line a de-duplication rather than a loss. */}
            <span
              className="infocard-dossier__slot infocard-dossier__slot--typography"
              data-active={headerSlots.typography ? "true" : "false"}
            >
              <span className="infocard-dossier__typeface-name">
                {activeCase.typography.primaryFamily}
              </span>
              <span className="visually-hidden">
                {headerSlots.typography
                  ? t("caseSheet.header.typographySlot")
                  : `${t("caseSheet.header.typographySlot")} — ${t("caseSheet.header.slotInactive")}`}
              </span>
            </span>
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
                        <span>{t("caseSheet.explore")}</span>
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
                        {/* TG041 (ADGARC-FB-110/FB-128): one circle per real
                            rendered page (`descriptors`, cover excluded —
                            Explora stays page 0, outside this numbered
                            rail), never a five-chapter grouping — FB-110's
                            locked page grammar and FB-128's "one rendered
                            dossier page = one sequential navigation item"
                            retire TG020-R3's chapter window. A single
                            horizontal native-scroll track (mobile-safe,
                            touch/swipe-capable, no clipping — see
                            `.infocard-dossier__page-window`'s own
                            `overflow-x: auto` in global.css) replaces the
                            former fixed five-slot row; the active pip
                            subtly auto-centers via the effect above. Prev/
                            next arrows on either side are unchanged and
                            still walk every real page in order. */}
                        <div
                          className="infocard-dossier__page-window"
                          role="group"
                          ref={pageWindowRef}
                          aria-label={t("caseSheet.navLabel")}
                        >
                          {descriptors.slice(1).map((descriptor, i) => {
                            const index = i + 1;
                            const ordinal = i + 1;
                            const active = index === pageIndex;
                            return (
                              <button
                                key={descriptor.id}
                                type="button"
                                ref={(el) => {
                                  if (el) pagePipRefs.current.set(index, el);
                                  else pagePipRefs.current.delete(index);
                                }}
                                className="infocard-dossier__page-pip"
                                data-active={active ? "true" : "false"}
                                aria-current={active ? "true" : undefined}
                                aria-label={t("caseSheet.pageOrdinal", {
                                  index: ordinal,
                                  total: descriptors.length - 1,
                                })}
                                onClick={() => goToPage(index)}
                              >
                                {ordinal}
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
                  {isVisited ? (
                    // TG039 (FB-126 browser-smoke corrective): re-entering an
                    // already-stamped case must recognize that fact in the
                    // dossier itself, not just via the external map navbar/
                    // Menu > Passport projections — reuses the existing
                    // "Visita registrada" finish copy rather than a second,
                    // divergent completion string. A non-interactive `div`
                    // (not `button`) keeps the same box/border sizing as the
                    // actionable target with no click handler, so no repeat
                    // stamp attempt (and no duplicate persistence) is
                    // possible from this step.
                    <div className="infocard-dossier__stamp-target">
                      <span
                        className="infocard-dossier__stamp-tick infocard-dossier__stamp-tick--visited"
                        aria-hidden="true"
                      >
                        &#10003;
                      </span>
                    </div>
                  ) : (
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
                  )}
                  <p className="infocard-dossier__stamp-instruction">
                    {isVisited
                      ? t("caseSheet.finishHeading")
                      : stampEnabled
                        ? t("passport.stampInstruction")
                        : stampDisabledReason}
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
