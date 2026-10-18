// ADG-ARC TG046 Prompt 046-13 — architecture-only, local DEV-only review of
// the nine Catalog R2 candidates. Reached ONLY via
// `architecture-r2-preview.html`'s own `<script type="module">` — never
// imported by `main.tsx`, `App.tsx`, or any other always-bundled module.
//
// Self-contained on purpose: the only runtime import is
// `catalogR2CaseRecordDrafts.ts` (itself deliberately unimported by product
// code — see that file's own header). Nothing here is, or is treated as, a
// finished `CaseRecord`: `typography`/`correlation`/`infocard`/
// `coordinates`/`heroMedia`/`editorial` are not rendered because the draft
// itself leaves them unset (see each draft's `blockedFields`). No media, no
// `visitPoint`-as-building-coordinate, no QR/stamp/route/geolocation
// behavior, no `localStorage` (including for the CAT/ES toggle below, which
// is plain in-memory React state), and no fetch of any kind.
import { createRoot } from "react-dom/client";
import { useState } from "react";
import {
  CATALOG_R2_CASE_RECORD_DRAFTS,
  type CatalogR2CaseRecordDraft,
} from "../data/catalogR2CaseRecordDrafts";

type ProseLocale = "cat" | "es";

const LOCALE_LABEL: Record<ProseLocale, string> = {
  cat: "Català",
  es: "Español",
};

function ProseBlock({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="r2prev-prose-paragraph">
          {paragraph}
        </p>
      ))}
    </>
  );
}

function FichaCard({ draft, locale }: { draft: CatalogR2CaseRecordDraft; locale: ProseLocale }) {
  const { productFields, sourceDraft } = draft;
  const name = productFields.identity?.name ?? sourceDraft.header.nameAsPrinted;
  const architect = productFields.identity?.architect ?? sourceDraft.header.architectAsPrinted;
  const movement = productFields.architecture?.movement ?? sourceDraft.header.styleAsPrinted;
  const dateLabel = productFields.identity?.date?.displayLabel;

  return (
    <article className="r2prev-card">
      <p className="r2prev-card-badge">Ficha de arquitectura — provisional / no publicada</p>
      <p className="r2prev-card-meta">
        Proposed slot {draft.slot} · <code>{draft.slug}</code>
      </p>

      <h2 className="r2prev-card-name">{name}</h2>
      <p className="r2prev-card-subline">
        {architect} · {movement}
        <span className="r2prev-tbd-tag">status: tbd</span>
      </p>
      <p className="r2prev-card-subline">
        {dateLabel ?? "Date pending — unresolved source conflict, not reconciled here (see provenance below)."}
      </p>

      <p className="r2prev-card-handoff-label">
        Working label (TG046 handoff, not fiche text): {sourceDraft.handoffDisplayName}
      </p>

      <section className="r2prev-card-section">
        <h3>Forma ({LOCALE_LABEL[locale]})</h3>
        <ProseBlock text={sourceDraft.forma[locale]} />
      </section>

      <section className="r2prev-card-section">
        <h3>Descripció web ({LOCALE_LABEL[locale]})</h3>
        <ProseBlock text={sourceDraft.descripcioWeb[locale]} />
      </section>

      <details className="r2prev-details">
        <summary>Provenance &amp; open items ({draft.unresolved.length})</summary>
        <ul>
          {draft.unresolved.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </details>

      <details className="r2prev-details">
        <summary>Fields intentionally left blank ({draft.blockedFields.length})</summary>
        <ul>
          {draft.blockedFields.map((note) => (
            <li key={note.field}>
              <strong>{note.field}</strong> — {note.reason}
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

function App() {
  const [locale, setLocale] = useState<ProseLocale>("cat");
  const readinessReasons = CATALOG_R2_CASE_RECORD_DRAFTS[0]?.readiness.reasons ?? [];

  return (
    <>
      <style>{PREVIEW_STYLES}</style>
      <div className="r2prev-root">
        <header className="r2prev-header">
          <p className="r2prev-header-badge">Local review only — not a product build</p>
          <h1>R2 architecture — provisional candidates</h1>
          <p className="r2prev-header-caveat">
            Architecture-only, non-public preview of the nine R2 candidate buildings. None of these are
            finished or publishable <code>CaseRecord</code>s. Typography and the architecture↔typography
            dialogue are not verified for any of these nine; the media shown by neither this page nor any
            other product surface is publication-authorized; address and date uncertainty remain for some
            records (flagged per-card below, never silently resolved). No pedestrian visit point is shown
            here and none should be read as a building coordinate. No QR, stamp, or physical-verification
            behavior is implied by anything on this page.
          </p>
          <ul className="r2prev-header-reasons">
            {readinessReasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
          <div className="r2prev-locale-toggle" role="group" aria-label="Architectural source prose language">
            {(Object.keys(LOCALE_LABEL) as ProseLocale[]).map((candidate) => (
              <button
                key={candidate}
                type="button"
                className={candidate === locale ? "r2prev-locale-active" : ""}
                onClick={() => setLocale(candidate)}
              >
                {LOCALE_LABEL[candidate]}
              </button>
            ))}
          </div>
        </header>

        <main className="r2prev-grid">
          {CATALOG_R2_CASE_RECORD_DRAFTS.map((draft) => (
            <FichaCard key={draft.slug} draft={draft} locale={locale} />
          ))}
        </main>
      </div>
    </>
  );
}

const PREVIEW_STYLES = `
.r2prev-root {
  --r2prev-surface: #ffffff;
  --r2prev-ink: #1d1d1b;
  --r2prev-ink-muted: rgba(29, 29, 27, 0.62);
  --r2prev-hairline: rgba(90, 42, 18, 0.16);
  --r2prev-font-ui: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --r2prev-font-editorial: "Yrsa", Georgia, "Times New Roman", serif;
  font-family: var(--r2prev-font-ui);
  color: var(--r2prev-ink);
  background: #f4efe9;
  min-height: 100vh;
  padding: 1.5rem;
  box-sizing: border-box;
}
.r2prev-header {
  max-width: 64rem;
  margin: 0 auto 1.5rem;
}
.r2prev-header-badge {
  display: inline-block;
  margin: 0 0 0.5rem;
  padding: 0.2rem 0.6rem;
  background: #a3330b;
  color: #fff;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 0.25rem;
}
.r2prev-header h1 {
  font-family: var(--r2prev-font-editorial);
  margin: 0 0 0.5rem;
}
.r2prev-header-caveat {
  color: var(--r2prev-ink-muted);
  line-height: 1.5;
  font-size: 0.9rem;
}
.r2prev-header-reasons {
  color: var(--r2prev-ink-muted);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0.5rem 0 1rem;
}
.r2prev-locale-toggle button {
  font: inherit;
  padding: 0.3rem 0.8rem;
  margin-right: 0.4rem;
  border: 1px solid var(--r2prev-hairline);
  border-radius: 0.3rem;
  background: var(--r2prev-surface);
  color: var(--r2prev-ink);
  cursor: pointer;
}
.r2prev-locale-toggle button.r2prev-locale-active {
  background: var(--r2prev-ink);
  color: var(--r2prev-surface);
}
.r2prev-grid {
  max-width: 64rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1rem;
}
.r2prev-card {
  background: var(--r2prev-surface);
  border: 1px solid var(--r2prev-hairline);
  border-radius: 0.5rem;
  padding: 1rem;
}
.r2prev-card-badge {
  margin: 0 0 0.4rem;
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #a3330b;
}
.r2prev-card-meta {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  color: var(--r2prev-ink-muted);
}
.r2prev-card-name {
  font-family: var(--r2prev-font-editorial);
  margin: 0 0 0.25rem;
}
.r2prev-card-subline {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--r2prev-ink-muted);
}
.r2prev-tbd-tag {
  margin-left: 0.4rem;
  padding: 0.05rem 0.35rem;
  border: 1px solid var(--r2prev-hairline);
  border-radius: 0.25rem;
  font-size: 0.68rem;
  text-transform: uppercase;
}
.r2prev-card-handoff-label {
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  color: var(--r2prev-ink-muted);
  font-style: italic;
}
.r2prev-card-section {
  margin: 0 0 0.75rem;
}
.r2prev-card-section h3 {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--r2prev-ink-muted);
  margin: 0 0 0.3rem;
}
.r2prev-prose-paragraph {
  margin: 0 0 0.6rem;
  font-size: 0.9rem;
  line-height: 1.5;
}
.r2prev-details {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: var(--r2prev-ink-muted);
}
.r2prev-details summary {
  cursor: pointer;
  font-weight: 600;
}
.r2prev-details ul {
  margin: 0.4rem 0 0;
  padding-left: 1.1rem;
}
.r2prev-details li {
  margin-bottom: 0.3rem;
  line-height: 1.4;
}
`;

const mountNode = document.getElementById("r2-architecture-preview-root");
if (!mountNode) {
  throw new Error(
    "catalogR2ArchitectureOnlyPreview: #r2-architecture-preview-root not found — " +
      "architecture-r2-preview.html's mount markup must have changed.",
  );
}
createRoot(mountNode).render(<App />);
