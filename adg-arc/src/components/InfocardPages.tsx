import type { ReactNode } from "react";
import type {
  CaseHeroMedia,
  CaseSpecimenMedia,
  CaseTypographyPhoto,
  InfocardEditorialCopy,
  InfocardHighlightedPhrase,
} from "../data/cases";

// TG012 Pass B — presentational primitives for the final Infocard dossier.
// Every component here receives resolved props; none read CaseRecord or own
// pagination/navigation state (see useInfocardPagination.ts for that).

export interface InfocardCoverPageProps {
  caseName: string;
  heroMedia: CaseHeroMedia | null;
  // TG040 (ADGARC-FB-121/FB-116, Prompt 083): the existing TG039
  // visited/pass-complete authority (passed through from InfocardDossier,
  // never recomputed here) — selects `heroMedia.srcPass` once true, the
  // base `heroMedia.src` otherwise. Defaults to false so this stays the
  // pre-TG040 "always base" behavior for any caller that omits it.
  isVisited?: boolean;
}

// TG023 (ADGARC-FB-006 case-media integration): the discreet,
// keyboard-accessible credit caption for the primary hero-image surface.
// Built from `heroMedia.credits` only — never executable HTML from data,
// never a fabricated/collapsed single string when more than one
// independently linked credit is required (e.g. GreenH@use's José Hevia +
// Peris+Toral pair). Renders nothing when there is no credit to show.
// TG033 Prompt 073 corrective (ADGARC-FB-114): exported — the dossier's
// cover footer row now composes this directly alongside `Explora` (same
// bottom row, not a second centered line below the hero), so this can no
// longer stay a private helper of `InfocardCoverPage` below.
export function InfocardHeroCredit({ credits }: { credits: CaseHeroMedia["credits"] }) {
  if (!credits || credits.length === 0) return null;
  return (
    <p className="infocard-page__hero-credit">
      {credits.map((credit, index) => (
        <span key={credit.label} className="infocard-page__hero-credit-item">
          {index > 0 && <span aria-hidden="true"> · </span>}
          {credit.url ? (
            <a href={credit.url} target="_blank" rel="noopener noreferrer">
              {credit.label}
            </a>
          ) : (
            credit.label
          )}
        </span>
      ))}
    </p>
  );
}

// Pass E (visual parity): the cover is a hero-media slot, not a centered
// title/typeface treatment — the case/section row above already carries the
// name. `heroMedia` stays whatever CaseRecord currently resolves (null for
// every case without a verified asset per the TG006C durable-media
// contract); this primitive never fabricates or substitutes an image when
// it is absent, it only renders an honest empty slot that preserves the
// target composition.
// TG033 Prompt 073 corrective (ADGARC-FB-114): the credit caption no longer
// renders here. It now shares the dossier's bottom nav row with `Explora`
// (InfocardDossier.tsx composes `InfocardHeroCredit` there directly) rather
// than forcing a second centered row below the hero frame.
export function InfocardCoverPage({ caseName, heroMedia, isVisited = false }: InfocardCoverPageProps) {
  return (
    <section className="infocard-page infocard-page--cover" aria-label={caseName}>
      <div className="infocard-page__hero" data-empty={heroMedia ? undefined : "true"}>
        {heroMedia && (
          <img
            className="infocard-page__hero-image"
            src={isVisited ? heroMedia.srcPass : heroMedia.src}
            alt={heroMedia.alt}
          />
        )}
      </div>
    </section>
  );
}

// TG018 Pass C (operator decision, correction matrix §D) retired `Moviment`
// from this presentation, moving it onto its own dedicated
// "architecture-movement" page instead. TG049 Stage 1 Phase C
// (OPERATOR-approved) relocates it back here as a fourth fact row — the
// dedicated page is removed in the same pass (useInfocardPagination.ts) —
// rather than left duplicated on two pages. The fact's resolution
// (`resolvedMovement ?? movementTbdInline`) is unchanged; only its position
// moves, from InfocardDossier.tsx's own architecture-movement switch case
// onto this one.
export interface InfocardFactsPageLabels {
  year: string;
  architect: string;
  address: string;
  movement: string;
}

// TG051 IMP-01: the fact-row grammar itself (the `dl`/`dt`/`dd` composition
// with its separators and label/value type scale) is factored out here so the
// building sheet below and the new typography sheet further down share ONE
// definition rather than two parallel copies that can drift. Rows are built
// by each page from its own already-resolved props; a row whose value is null
// is dropped by the builder before it reaches this primitive, which is the
// same "omit, never render empty" rule the `address` row established.
interface InfocardFactRow {
  label: string;
  value: string;
}

function InfocardFactRows({ rows }: { rows: InfocardFactRow[] }) {
  return (
    <dl className="infocard-page__facts">
      {rows.map((row) => (
        <div key={row.label} className="infocard-page__fact">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface InfocardFactsPageProps {
  // TG020: the dossier's own display label (CaseIdentity.date.displayLabel),
  // not a raw year — source-faithful for exact/ranged/fuzzy dates alike
  // ("1929", "1906 - 1912", "~S. XX", "Anys 60").
  dateLabel: string;
  architect: string;
  // Pre-resolved by the caller exactly as the former architecture-movement
  // page resolved it (`resolvedMovement ?? t("caseSheet.movementTbdInline")`)
  // — this component never re-derives or TBD-labels it itself.
  movement: string;
  address: string | null;
  labels: InfocardFactsPageLabels;
}

export function InfocardFactsPage({
  dateLabel,
  architect,
  movement,
  address,
  labels,
}: InfocardFactsPageProps) {
  return (
    <section className="infocard-page infocard-page--facts">
      {/* TG018 Pass C (correction matrix §D): explicit top separator above
          the first row — every row already carried its own border-bottom,
          but nothing closed the top edge above `Any`.
          TG049 Stage 1: row order is Autor, Moviment, Any, Adreça per the
          handoff's desired page-1 sequence — Any/Autor/Adreça keep their
          pre-existing resolved values; only the order and the added
          Moviment row change. */}
      {/* TG051 IMP-01: the same four rows in the same order, now expressed as
          the shared row data `InfocardFactRows` renders — `address` keeps its
          established omit-when-null behavior, expressed here as the row simply
          not being added to the list. */}
      <InfocardFactRows
        rows={[
          { label: labels.architect, value: architect },
          { label: labels.movement, value: movement },
          { label: labels.year, value: dateLabel },
          ...(address ? [{ label: labels.address, value: address }] : []),
        ]}
      />
    </section>
  );
}

// TG051 IMP-01 (OPERATOR-approved ten-page grammar): "Fitxa de la tipografia"
// — the typography counterpart of `InfocardFactsPage` above, between the
// typography photograph and Caràcters. It deliberately carries BOTH
// `infocard-page--facts` and `infocard-page--typography-sheet`: the former is
// what makes this the same page family as the building sheet (inheriting every
// existing facts rule — row separators, label/value type scale, the frame's own
// fill geometry and the `:has(.infocard-page--facts)` flex-column activation in
// global.css), the latter exists only as a hook for any future
// typography-sheet-specific tweak. No new layout family, no duplicated values.
//
// Every row resolves from the case's own `CaseTypography` record and is omitted
// when its field is null — no typeface fact is hard-coded or invented here, and
// `primaryFamily` (non-nullable in `CaseTypography`) guarantees the page is
// never empty. `sourceUrl` deliberately gets no row: it is surfaced as the
// Caràcters link one page later instead (see InfocardDossier.tsx's "typography"
// case), where a URL reads correctly as a link rather than as right-aligned
// bold display-type fact value.
export interface InfocardTypographySheetPageLabels {
  typeface: string;
  designer: string;
  classification: string;
  year: string;
}

export interface InfocardTypographySheetPageProps {
  primaryFamily: string;
  designer: string | null;
  classification: string | null;
  // `CaseTypography.year` is a number; the caller passes it through unchanged
  // rather than pre-formatting it, and this page does the one `String(...)`
  // conversion the shared row primitive needs.
  year: number | null;
  labels: InfocardTypographySheetPageLabels;
}

export function InfocardTypographySheetPage({
  primaryFamily,
  designer,
  classification,
  year,
  labels,
}: InfocardTypographySheetPageProps) {
  return (
    <section className="infocard-page infocard-page--facts infocard-page--typography-sheet">
      <InfocardFactRows
        rows={[
          { label: labels.typeface, value: primaryFamily },
          ...(designer ? [{ label: labels.designer, value: designer }] : []),
          ...(classification ? [{ label: labels.classification, value: classification }] : []),
          // `year !== null` rather than a truthiness test, so a falsy-but-real
          // value is never silently dropped the way `{year && …}` would.
          ...(year !== null ? [{ label: labels.year, value: String(year) }] : []),
        ]}
      />
    </section>
  );
}

export interface InfocardHighlightedPhrasePageProps {
  phrase: InfocardHighlightedPhrase;
}

// literal_quote may render blockquote/quotation semantics; paraphrase and
// synthesis never do, so neither can visually masquerade as a literal
// quotation regardless of how the final CSS treats each case (DEC-010 §D3,
// TG012 handoff §2 "O-039A Casa de la Marina").
export function InfocardHighlightedPhrasePage({ phrase }: InfocardHighlightedPhrasePageProps) {
  const { kind, displayText, attribution, bibliographicContext } = phrase;

  return (
    <section className="infocard-page infocard-page--highlight">
      {kind === "literal_quote" ? (
        <blockquote className="infocard-page__quote">
          <p>{displayText}</p>
        </blockquote>
      ) : (
        <p className="infocard-page__phrase" data-kind={kind}>
          {displayText}
        </p>
      )}
      {/* MTG01_R2 FB-019 (evidence 02/05_quote_author_year_mockup.png): the
          attribution is two stacked lines under the quotation — authorship
          first, the bibliographic/date line second — not the single
          "author · context" run TG028 introduced. The two values are the
          record's own existing `attribution` and `bibliographicContext`
          fields, rendered verbatim; nothing is parsed, split, reformatted or
          synthesized to manufacture a bare year, and a record whose
          `bibliographicContext` is null simply renders the one line it has.
          The `·` separator element is removed rather than hidden: with the
          two values on separate lines it had nothing left to separate. */}
      <footer className="infocard-page__attribution">
        <cite className="infocard-page__attribution-line">{attribution}</cite>
        {bibliographicContext && (
          <span className="infocard-page__attribution-line infocard-page__bibliographic-context">
            {bibliographicContext}
          </span>
        )}
      </footer>
    </section>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// FB-117 (TG033 Prompt 073 corrective): structured terms a prose page's own
// `copy` should emphasize inline — the case's official building name and
// primary typeface/family name, read from `CaseRecord` by the caller. Never
// parsed or guessed out of `copy.displayText` itself.
export interface RunningCopyEmphasis {
  boldTerm?: string | null;
  underlineTerm?: string | null;
}

// FB-117 (TG033 Prompt 073/074 correctives): the OPERATOR runtime review
// clarified that "render the typeface name bold / building name underlined"
// means every occurrence inside the EXISTING editorial running copy, not a
// separate meta/title presentation (the prior TG033 pass's two-line
// typeface+building meta block is reverted — see InfocardDossier.tsx's
// "typography" case). This is the one deterministic, reusable mechanism for
// that: it reads the exact source string, finds every non-overlapping
// case-insensitive match of `emphasis.boldTerm`/`underlineTerm` (longer term
// checked first, so a longer official name is never shadowed by a shorter
// term it contains), and wraps only the matched span — in its *original*
// rendered casing, never the canonical term's casing — in a dedicated
// semantic element. One capture group per term (rather than comparing the
// matched text back against each term's own string) is what makes this
// correctly case-insensitive: `GreenH@use` in running copy must match the
// canonical `GREENH@USE` (Prompt 074 §D), so the matched substring and the
// term that produced it will legitimately differ in case — only the
// regex's own group index, not a string-equality check, can say which term
// matched. Surrounding text and punctuation pass through completely
// untouched. No `dangerouslySetInnerHTML`, no locale-specific string
// handling, no fuzzy/partial-word matching, so it is correct for CAT/ES/EN
// copy alike. A term that never occurs in a given case's copy simply
// produces no match for that case — this never invents or rewrites a
// display alias to force one.
function renderEditorialCopy(text: string, emphasis?: RunningCopyEmphasis): ReactNode {
  const terms: { term: string; tag: "strong" | "underline" }[] = [];
  if (emphasis?.boldTerm) terms.push({ term: emphasis.boldTerm, tag: "strong" });
  if (emphasis?.underlineTerm) terms.push({ term: emphasis.underlineTerm, tag: "underline" });
  if (terms.length === 0) return text;

  const ordered = terms.slice().sort((a, b) => b.term.length - a.term.length);
  const pattern = ordered.map((entry) => `(${escapeRegExp(entry.term)})`).join("|");
  const matcher = new RegExp(pattern, "gi");

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const matched = match[0];
    // `match[1..n]` mirror `ordered`'s own term order one-for-one (one
    // capture group per alternative) — whichever group is defined (not
    // `undefined`) names the term that actually matched, regardless of the
    // case it matched in.
    const matchedIndex = ordered.findIndex((_, i) => match![i + 1] !== undefined);
    const entry = matchedIndex >= 0 ? ordered[matchedIndex] : undefined;
    if (entry?.tag === "strong") {
      nodes.push(
        <strong key={`emphasis-${key++}`} className="infocard-page__body-typeface">
          {matched}
        </strong>
      );
    } else if (entry?.tag === "underline") {
      nodes.push(
        <span key={`emphasis-${key++}`} className="infocard-page__body-building">
          {matched}
        </span>
      );
    } else {
      nodes.push(matched);
    }
    cursor = matcher.lastIndex;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export interface InfocardProsePageProps {
  // Nullable/optional: the case/section row already carries the section
  // label for building prose, Tipografia and Diàleg (Pass E visual-parity
  // finding — those in-body headings were redundant). Arquitectura is the
  // one page that keeps an explicit in-body heading, per the Figma source.
  heading?: string | null;
  // Pass F1C: optional/nullable — the Arquitectura chapter's movement-only
  // step (§F) renders `meta` alone, with no running-text body at all, so
  // `copy` can no longer be a required prop of this shared primitive.
  copy?: InfocardEditorialCopy | null;
  meta?: ReactNode;
  // Pass F1B (prompt 046 §4G/§4H): an optional page-specific modifier class
  // (e.g. `infocard-page--architecture`, `infocard-page--typography`) so
  // Arquitectura/Tipografia can carry their own composition tweaks in CSS
  // without forking this shared primitive.
  className?: string;
  // FB-117 (TG033 Prompt 073 corrective): optional building-name/typeface-
  // name terms to emphasize inline wherever they occur verbatim in `copy`.
  emphasis?: RunningCopyEmphasis;
  // TG051 IMP-01: optional trailing slot rendered AFTER the running copy —
  // added so the Caràcters page can carry its `link a tipografia` below the
  // paragraph without forking this shared primitive into a second variant.
  // Every existing caller omits it and renders exactly as before.
  footer?: ReactNode;
}

// Shared narrow primitive for building prose / Arquitectura / Tipografia /
// Diàleg — an optional heading, optional factual metadata, and optional
// editorial copy (Pass F1C: the Arquitectura movement-only step has no
// running text at all). Deliberately not a generic content-block/render-
// schema framework.
export function InfocardProsePage({
  heading,
  copy,
  meta,
  className,
  emphasis,
  footer,
}: InfocardProsePageProps) {
  return (
    <section
      className={`infocard-page infocard-page--prose${className ? ` ${className}` : ""}`}
    >
      {heading && <h3 className="infocard-page__heading">{heading}</h3>}
      {meta && <div className="infocard-page__meta">{meta}</div>}
      {copy && <p className="infocard-page__body">{renderEditorialCopy(copy.displayText, emphasis)}</p>}
      {footer}
    </section>
  );
}

// TG049 Stage 1 Phase C A01 (OPERATOR-approved): shared "Fotografia de la
// tipografia" page — the case-specific typography family name plus a
// cover-equivalent photo slot. No typography photograph exists for any of
// the 20 active cases yet (TG049 Prompt 01 preflight §4, unchanged by this
// pass), so `photo` is always null today: this renders the same honest,
// pure-white empty frame `InfocardCoverPage`/`InfocardSpecimenPage` already
// establish for missing media, never a fabricated placeholder, broken
// `<img>`, or "pending" wording inside the frame itself.
// MTG01_R2 FB-013 (OPERATOR, evidence 01_typography_name_p5_casa_fuster.png
// "Quitar Arlette de allí"): the in-body typeface-name line is removed. The
// two-slot Passport header introduced this same pass (InfocardDossier.tsx,
// FB-011/FB-012) now states the typeface name once, on every typography-owned
// page, so repeating it inside this page's own body was a duplicate reading of
// the same fact — exactly the redundancy the feedback names. `primaryFamily`
// is therefore no longer a prop of this component: it had no other consumer
// here, and keeping it would have left an unused parameter rather than an
// honest signature. The page is also temporarily hidden from public
// pagination (FB-015); this correction is applied anyway so the step is
// correct whenever it is reinstated.
export interface InfocardTypographyPhotoPageProps {
  photo: CaseTypographyPhoto | null;
}

export function InfocardTypographyPhotoPage({ photo }: InfocardTypographyPhotoPageProps) {
  return (
    <section className="infocard-page infocard-page--typography-photo">
      <div
        className="infocard-page__typography-photo-frame"
        data-empty={photo ? undefined : "true"}
      >
        {photo && (
          <img
            className="infocard-page__typography-photo-image"
            src={photo.src}
            alt={photo.alt}
          />
        )}
      </div>
    </section>
  );
}

export interface InfocardSpecimenPageProps {
  media: CaseSpecimenMedia | null;
}

// TG033 (ADGARC-FB-115): renders the case's locked typography specimen SVG
// inside the dossier's chapter 05 "Especimen" step. `media` is resolved by
// the caller from the locked slug lookup (`SPECIMEN_MEDIA` in cases.ts) —
// this component never infers a mapping itself. Cases outside the ten
// locked specimens (every digital-only record) render the same honest empty
// slot `InfocardCoverPage` already establishes for a missing `heroMedia`,
// never a fabricated placeholder.
export function InfocardSpecimenPage({ media }: InfocardSpecimenPageProps) {
  return (
    <section className="infocard-page infocard-page--specimen">
      <div className="infocard-page__specimen-frame" data-empty={media ? undefined : "true"}>
        {media && (
          <img className="infocard-page__specimen-image" src={media.src} alt={media.alt} />
        )}
      </div>
    </section>
  );
}
