import { useState } from "react";
import type { CaseRecord } from "../data/cases";
import type { PassportState } from "../hooks/usePassport";
import { useT } from "../i18n/context";

interface PassportPaneProps {
  passport: PassportState;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
}

// TG010 S4/S5B (ADGARC-FB-023 / DEC-007 §13-14, ADGARC-FB-029 / DEC-008
// §3.2): the horizontal ordinal+tick progress rail, rendered both at the top
// of the Pasaporte pane and — since S5B — as the map's top-center overlay
// chrome (see PassportMapOverlay.tsx) — one component, two variants, never
// two drifting implementations of the same progress read.
//
// DEC-007 §14 / DEC-006 §5: the cells are deliberately NOT interactive.
// They are a progress display whose numbers are stop identifiers, not a
// route order, a required sequence, or a first/last-stop semantic — the
// accessible per-case navigation stays the real button list below, so this
// rail never becomes a second case-selection authority either. The physical
// collection is derived here the same way usePassport derives it: from
// `experienceType`, never a second hardcoded list or count.
export function PassportRail({
  passport,
  cases,
  variant,
}: {
  passport: PassportState;
  cases: CaseRecord[];
  variant: "pane" | "overlay";
}) {
  const t = useT();
  const physicalCases = cases.filter((c) => c.experienceType === "physical_digital");

  return (
    <div className={`passport-rail passport-rail--${variant}`}>
      <p className="passport-rail__head">
        <span className="passport-rail__label">{t("passport.railLabel")}</span>
        <span className="passport-rail__count">
          {t("passport.progress", { count: passport.count, total: passport.total })}
        </span>
      </p>
      <ol className="passport-rail__track">
        {physicalCases.map((c, i) => {
          const isVisited = passport.visited.has(c.slug);
          return (
            <li
              key={c.slug}
              className="passport-rail__cell"
              data-visited={isVisited ? "true" : "false"}
            >
              {/* Status is never carried by color alone: the tick glyph
                  differs, and the full name+status text below is available
                  to assistive technology. */}
              <span className="passport-rail__ordinal">{String(i + 1).padStart(2, "0")}</span>
              <span className="passport-rail__tick" aria-hidden="true">
                {isVisited ? "✓" : "·"}
              </span>
              <span className="visually-hidden">
                {t("passport.railCellStatus", {
                  name: c.identity.name,
                  status: isVisited ? t("passport.stampObtained") : t("passport.stampPending"),
                })}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="passport-rail__note">{t("passport.railOrdinalNote")}</p>
    </div>
  );
}

// TG010 (DEC-006); S5B card carousel (DEC-008 §4/§5.2): Pasaporte
// destination pane — reuses .settings-actions / .settings-actions__btn for
// its reset action rather than inventing a parallel visual language; its own
// stop-browsing surface is the .passport-carousel 9:16 content-card
// carousel below. Opening a case from here goes through the same App-owned
// `onSelectCase` the map already uses — never a second selection authority,
// never a stamp (only a valid `entry=physical` signal stamps).
export default function PassportPane({ passport, cases, onSelectCase }: PassportPaneProps) {
  const t = useT();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const physicalCases = cases.filter((c) => c.experienceType === "physical_digital");
  const completed = passport.total > 0 && passport.count === passport.total;

  const handleResetConfirmed = () => {
    passport.reset();
    setConfirmingReset(false);
  };

  return (
    <div className="passport-pane">
      <PassportRail passport={passport} cases={cases} variant="pane" />
      {completed && (
        <p className="passport-pane__status passport-pane__status--visited">{t("passport.completed")}</p>
      )}

      {/* TG010 S5B (ADGARC-FB-030 / DEC-008 §4): the Pasaporte destination's
          own stop-browsing surface — a horizontal scroll-snap carousel of
          9:16 editorial cards (full card ratio, media + info together),
          replacing the former plain row list now that Casos no longer exists
          as a separate destination. Content-card visual class (DEC-008 §5.2):
          white fill, thin black stroke, square corners — explicitly exempt
          from the window/panel yellow title-bar treatment. Every card is a
          real <button> going through the same App-owned `onSelectCase` the
          map/menu already use — never a second selection authority, never a
          stamp (only a valid `entry=physical` signal stamps). */}
      <ul className="passport-carousel" aria-label={t("passport.carouselLabel")}>
        {physicalCases.map((c, i) => {
          const isVisited = passport.visited.has(c.slug);
          return (
            <li key={c.slug} className="passport-carousel__item">
              <button
                type="button"
                className="passport-carousel__card"
                onClick={() => onSelectCase(c.slug)}
              >
                <span className="passport-carousel__media">
                  {c.heroMedia ? (
                    <img
                      className="passport-carousel__img"
                      src={c.heroMedia.src}
                      alt={c.heroMedia.alt}
                    />
                  ) : (
                    <span className="passport-carousel__media-empty">
                      {t("cases.mediaPending")}
                    </span>
                  )}
                </span>
                <span className="passport-carousel__body">
                  <span className="passport-carousel__ordinal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="passport-carousel__name">{c.identity.name}</span>
                  <span
                    className={`passport-pane__status${isVisited ? " passport-pane__status--visited" : ""}`}
                  >
                    {isVisited ? t("passport.stampObtained") : t("passport.stampPending")}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="settings-actions">
        {confirmingReset ? (
          <div className="passport-pane__reset-confirm">
            <p className="app-modal__note">{t("passport.resetConfirm")}</p>
            <button type="button" className="settings-actions__btn" onClick={handleResetConfirmed}>
              {t("passport.resetConfirmYes")}
            </button>
            <button type="button" className="settings-actions__btn" onClick={() => setConfirmingReset(false)}>
              {t("passport.resetConfirmCancel")}
            </button>
          </div>
        ) : (
          <button type="button" className="settings-actions__btn" onClick={() => setConfirmingReset(true)}>
            {t("passport.reset")}
          </button>
        )}
      </div>
    </div>
  );
}
