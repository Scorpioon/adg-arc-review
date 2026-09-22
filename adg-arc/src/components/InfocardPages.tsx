import type { ReactNode } from "react";
import type {
  CaseHeroMedia,
  InfocardEditorialCopy,
  InfocardHighlightedPhrase,
} from "../data/cases";

// TG012 Pass B — presentational primitives for the final Infocard dossier.
// Every component here receives resolved props; none read CaseRecord or own
// pagination/navigation state (see useInfocardPagination.ts for that).

export interface InfocardCoverPageProps {
  caseName: string;
  heroMedia: CaseHeroMedia | null;
}

// Pass E (visual parity): the cover is a hero-media slot, not a centered
// title/typeface treatment — the case/section row above already carries the
// name. `heroMedia` stays whatever CaseRecord currently resolves (null for
// every case per the TG006C durable-media contract); this primitive never
// fabricates or substitutes an image when it is absent, it only renders an
// honest empty slot that preserves the target composition.
export function InfocardCoverPage({ caseName, heroMedia }: InfocardCoverPageProps) {
  return (
    <section className="infocard-page infocard-page--cover" aria-label={caseName}>
      <div className="infocard-page__hero" data-empty={heroMedia ? undefined : "true"}>
        {heroMedia && (
          <img className="infocard-page__hero-image" src={heroMedia.src} alt={heroMedia.alt} />
        )}
      </div>
    </section>
  );
}

// TG018 Pass C (operator decision, correction matrix §D): `Moviment` is
// removed from this presentation entirely — not hidden, not TBD-labeled.
// The architecture movement fact still exists and is still shown elsewhere
// (the dossier's own "architecture-movement" page), so no source content is
// lost; this component simply no longer renders it. Its former `movement`/
// `movementStatus`/`labels.movement`/`labels.movementTbd` props are dropped
// as a direct consequence rather than left as unused dead parameters.
export interface InfocardFactsPageLabels {
  year: string;
  architect: string;
  address: string;
}

export interface InfocardFactsPageProps {
  // TG020: the dossier's own display label (CaseIdentity.date.displayLabel),
  // not a raw year — source-faithful for exact/ranged/fuzzy dates alike
  // ("1929", "1906 - 1912", "~S. XX", "Anys 60").
  dateLabel: string;
  architect: string;
  address: string | null;
  labels: InfocardFactsPageLabels;
}

export function InfocardFactsPage({ dateLabel, architect, address, labels }: InfocardFactsPageProps) {
  return (
    <section className="infocard-page infocard-page--facts">
      {/* TG018 Pass C (correction matrix §D): explicit top separator above
          the first row — every row already carried its own border-bottom,
          but nothing closed the top edge above `Any`. */}
      <dl className="infocard-page__facts">
        <div className="infocard-page__fact">
          <dt>{labels.year}</dt>
          <dd>{dateLabel}</dd>
        </div>
        <div className="infocard-page__fact">
          <dt>{labels.architect}</dt>
          <dd>{architect}</dd>
        </div>
        {address && (
          <div className="infocard-page__fact">
            <dt>{labels.address}</dt>
            <dd>{address}</dd>
          </div>
        )}
      </dl>
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
      <footer className="infocard-page__attribution">
        <cite>{attribution}</cite>
        {bibliographicContext && (
          <span className="infocard-page__bibliographic-context">{bibliographicContext}</span>
        )}
      </footer>
    </section>
  );
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
}

// Shared narrow primitive for building prose / Arquitectura / Tipografia /
// Diàleg — an optional heading, optional factual metadata, and optional
// editorial copy (Pass F1C: the Arquitectura movement-only step has no
// running text at all). Deliberately not a generic content-block/render-
// schema framework.
export function InfocardProsePage({ heading, copy, meta, className }: InfocardProsePageProps) {
  return (
    <section
      className={`infocard-page infocard-page--prose${className ? ` ${className}` : ""}`}
    >
      {heading && <h3 className="infocard-page__heading">{heading}</h3>}
      {meta && <div className="infocard-page__meta">{meta}</div>}
      {copy && <p className="infocard-page__body">{copy.displayText}</p>}
    </section>
  );
}

// A deliberately vacant, data-independent canvas: no `CaseRecord` input, no
// case-specific branching, no visible placeholder copy. Exists only to keep
// chapter 05 "Especimen" present in the dossier's page/chapter shell and
// pagination.
export function InfocardSpecimenPage() {
  return <section className="infocard-page infocard-page--specimen" />;
}
