import type { ReactNode } from "react";
import type {
  InfocardEditorialCopy,
  InfocardHighlightedPhrase,
  SpecimenMode,
} from "../data/cases";
import DhubSpecimen from "./DhubSpecimen";

// TG012 Pass B — presentational primitives for the final Infocard dossier.
// Every component here receives resolved props; none read CaseRecord or own
// pagination/navigation state (see useInfocardPagination.ts for that).

export interface InfocardCoverPageProps {
  caseName: string;
  typefaceName: string;
}

export function InfocardCoverPage({ caseName, typefaceName }: InfocardCoverPageProps) {
  return (
    <section className="infocard-page infocard-page--cover" aria-label={caseName}>
      <h2 className="infocard-page__case-name">{caseName}</h2>
      <p className="infocard-page__typeface-name">{typefaceName}</p>
    </section>
  );
}

export interface InfocardFactsPageLabels {
  year: string;
  architect: string;
  address: string;
  movement: string;
  movementTbd: string;
}

export interface InfocardFactsPageProps {
  year: number;
  architect: string;
  address: string | null;
  movement: string | null;
  movementStatus: "verified" | "tbd";
  labels: InfocardFactsPageLabels;
}

export function InfocardFactsPage({
  year,
  architect,
  address,
  movement,
  movementStatus,
  labels,
}: InfocardFactsPageProps) {
  const resolvedMovement = movementStatus === "verified" && movement ? movement : null;

  return (
    <section className="infocard-page infocard-page--facts">
      <dl className="infocard-page__facts">
        <div className="infocard-page__fact">
          <dt>{labels.year}</dt>
          <dd>{year}</dd>
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
        <div className="infocard-page__fact">
          <dt>{labels.movement}</dt>
          <dd>{resolvedMovement ?? labels.movementTbd}</dd>
        </div>
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
  heading: string;
  copy: InfocardEditorialCopy;
  meta?: ReactNode;
}

// Shared narrow primitive for building prose / Arquitectura / Tipografia /
// Diàleg — a heading, optional factual metadata, and the resolved editorial
// copy. Deliberately not a generic content-block/render-schema framework.
export function InfocardProsePage({ heading, copy, meta }: InfocardProsePageProps) {
  return (
    <section className="infocard-page infocard-page--prose">
      <h3 className="infocard-page__heading">{heading}</h3>
      {meta && <div className="infocard-page__meta">{meta}</div>}
      <p className="infocard-page__body">{copy.displayText}</p>
    </section>
  );
}

export interface InfocardSpecimenPageProps {
  specimenMode: SpecimenMode;
  emptyLabel: string;
}

export function InfocardSpecimenPage({ specimenMode, emptyLabel }: InfocardSpecimenPageProps) {
  return (
    <section className="infocard-page infocard-page--specimen">
      {specimenMode === "dhub" ? (
        <DhubSpecimen />
      ) : (
        <p className="infocard-page__module-empty">{emptyLabel}</p>
      )}
    </section>
  );
}
