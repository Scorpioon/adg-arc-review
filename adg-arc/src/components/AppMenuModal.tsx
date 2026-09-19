import { useEffect, useRef, type RefObject } from "react";
import type { CaseRecord } from "../data/cases";
import { DEVTOOLS_ENABLED } from "../config/devtools";
import { useDialogA11y } from "../hooks/useDialogA11y";
import type { PassportState } from "../hooks/usePassport";
import { useLocale } from "../i18n/context";
import type { TranslationKey } from "../i18n/es";
import DevTools, { type DevToolsProps } from "./DevTools";
import EditorialShell from "./EditorialShell";
import PassportPane from "./PassportPane";
import { MenuIcon } from "./icons";

export type MenuDestination = "info" | "about" | "settings" | "devtools" | "passport";

const NAV_ITEMS: Array<{ id: MenuDestination; labelKey: TranslationKey }> = [
  { id: "passport", labelKey: "nav.passport" },
  { id: "info", labelKey: "nav.info" },
  { id: "about", labelKey: "nav.about" },
  { id: "settings", labelKey: "nav.settings" },
  { id: "devtools", labelKey: "nav.devtools" },
];

// TG010 Final Experience P1 (ADGARC-DEC-010 §2-4): the canonical partner
// credits shown on the root menu's footer band, transcribed verbatim from
// ADGARC_FINAL_MOCKUP_01_main_menu.png. Proper-noun partner identities, not
// UI chrome — kept here rather than in the i18n catalog, the same scoping
// boundary es.ts's own header comment already draws for case/source content.
const PARTNER_PILLS = ["ADG", "AJTMNT de Barna", "CONGRÉS Arquitectura"];

function padOrdinal(n: number): string {
  return String(n).padStart(2, "0");
}

interface AppMenuModalProps {
  open: boolean;
  active: MenuDestination | null;
  onToggle: () => void;
  onClose: () => void;
  // TG011 Pass A (ADGARC-FB-042): widened to accept `null` so an internal
  // destination's back control can unwind to the root menu through the state
  // App already owns. App's own `setMenuActive` already accepted null, so no
  // change was needed on the App side to satisfy this.
  onSelectDestination: (destination: MenuDestination | null) => void;
  // TG009: owned by App (not created locally here) so the same persistent
  // button can also serve as the entry curtain's manual-reopen focus-return
  // target — see App.tsx's menuTriggerRef.
  triggerRef: RefObject<HTMLButtonElement>;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
  onResetMap: () => void;
  onNorthUp: () => void;
  onEditorialOrientation: () => void;
  devTools: DevToolsProps;
  passport: PassportState;
}

// TG006E corrective pass: replaces the left-edge AppSidebar overlay with a
// centered floating application-menu modal. The trigger button stays
// permanently mounted (so it is always reachable, closed or open); the
// dialog itself (backdrop + panel) only mounts while `open` — this keeps
// AppMenuDialog's useDialogA11y call unconditional within its own component
// tree, never a hook called behind a runtime `if`.
//
// TG010 Final Experience P1-R1 (Companion C2): `active` is rendered
// straight through from the lifted App state — App.tsx is the single place
// that decides intent (an ordinary open explicitly resets it to `null`; the
// DevTools "D" hotkey explicitly sets `"devtools"`), so this component never
// infers root-vs-destination from prior state.
export default function AppMenuModal({
  open,
  active,
  onToggle,
  onClose,
  onSelectDestination,
  triggerRef,
  cases,
  onSelectCase,
  onResetMap,
  onNorthUp,
  onEditorialOrientation,
  devTools,
  passport,
}: AppMenuModalProps) {
  const { t } = useLocale();

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="app-menu-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="app-menu-panel"
        aria-label={open ? t("menu.trigger.close") : t("menu.trigger.open")}
        onClick={onToggle}
      >
        <MenuIcon />
      </button>

      {open && (
        <AppMenuDialog
          triggerRef={triggerRef}
          onClose={onClose}
          active={active}
          onSelectDestination={onSelectDestination}
          cases={cases}
          onSelectCase={onSelectCase}
          onResetMap={onResetMap}
          onNorthUp={onNorthUp}
          onEditorialOrientation={onEditorialOrientation}
          devTools={devTools}
          passport={passport}
        />
      )}
    </>
  );
}

interface AppMenuDialogProps {
  triggerRef: RefObject<HTMLElement>;
  onClose: () => void;
  active: MenuDestination | null;
  // `null` = back to the menu root (ADGARC-FB-042).
  onSelectDestination: (destination: MenuDestination | null) => void;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
  onResetMap: () => void;
  onNorthUp: () => void;
  onEditorialOrientation: () => void;
  devTools: DevToolsProps;
  passport: PassportState;
}

// TG010 Final Experience P1 (ADGARC-DEC-010 §3-4): one canonical editorial-
// shell surface built on the same useDialogA11y primitive AppModal uses
// (focus-in, Tab-trap, Escape, focus-return). The root state is the
// five-row numbered menu (mockup 01); selecting a row swaps the shell's
// body for that destination's existing content, in place, inside the same
// dialog. There is no persistent nav rail anymore.
//
// TG011 Pass A (ADGARC-FB-042 / DEC-010 §11.4): close-and-reopen is no
// longer the *only* way back to the root menu — every destination now
// carries an explicit `← ordinal label` back header. That replaces the
// earlier "closing and reopening returns to root" rule as the primary
// affordance; the rule itself still holds, since [X] and Escape continue to
// close the whole surface and an ordinary reopen still lands on root.
function AppMenuDialog({
  triggerRef,
  onClose,
  active,
  onSelectDestination,
  cases,
  onSelectCase,
  onResetMap,
  onNorthUp,
  onEditorialOrientation,
  devTools,
  passport,
}: AppMenuDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useDialogA11y({ onClose, triggerRef, initialFocusRef: closeButtonRef });
  const { t, locale, setLocale, locales } = useLocale();

  // TG010 Final Experience P1-R1 (Companion C1): the canonical root menu's
  // five rows are fixed by the mockup, not by DevTools' own runtime
  // visibility — `NAV_ITEMS` is used directly, unfiltered. `DEVTOOLS_ENABLED`
  // still gates the actual Developer Tools content below, exactly as before;
  // in a production build, row 5 stays visible and reachable, since exposing
  // the debug panel itself was never authorized by this correction.
  //
  // TG011 Pass B (ADGARC-FB-045 / DEC-010 §11.5): what that row's body shows
  // when the gate is false is no longer "nothing" — see the safe unavailable
  // state at the bottom of this shell. The five-row structure and the gate
  // are both unchanged by that; only the empty slot was.
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === active);
  const activeNavItem = activeIndex === -1 ? null : NAV_ITEMS[activeIndex];

  // TG011 Pass A (ADGARC-FB-042): "back" means the *menu root* — the same
  // lifted `active` state App already owns, set to null. Deliberately not
  // browser history, not a router, and not a second navigation state living
  // down here alongside App's.
  const rowRefs = useRef(new Map<MenuDestination, HTMLButtonElement>());
  const backTargetRef = useRef<MenuDestination | null>(null);

  const backToRoot = () => {
    // Recorded on the way out rather than on the way in, so the DevTools "D"
    // hotkey path — which opens straight into a destination without any row
    // ever being clicked — returns focus just as correctly.
    backTargetRef.current = active;
    onSelectDestination(null);
  };

  // useDialogA11y returns focus to the menu trigger when the whole surface
  // closes; this is the same courtesy one level down, for a back that only
  // unwinds a destination. It runs on the transition to root and nowhere
  // else — `backTargetRef` stays null until a back actually happens, so the
  // shell's initial [X] focus placement on open is left alone.
  useEffect(() => {
    if (active !== null) return;
    const target = backTargetRef.current;
    if (!target) return;
    backTargetRef.current = null;
    rowRefs.current.get(target)?.focus();
  }, [active]);

  return (
    <div
      className="app-menu-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="app-menu-panel"
        ref={dialogRef}
        className="app-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu.dialogLabel")}
      >
        {/* TG011 Pass A (ADGARC-FB-042): the yellow topbar carries the
            constant project title at every depth, exactly as both canonical
            mockups render it (01 root, 02 Passaport). The destination's own
            identity moved into the `← ordinal label` header below, so it is
            stated once rather than duplicated in two places at once. */}
        <EditorialShell
          title={t("menu.rootTitle")}
          onClose={onClose}
          closeLabel={t("menu.close")}
          closeButtonRef={closeButtonRef}
          footer={
            activeNavItem ? undefined : (
              <footer className="app-menu__footer">
                {/* ADGARC-FB-041: placement slots for partner logos that do
                    not exist in the source materials yet. Honest text
                    placeholders — no asset is invented, sourced or ingested
                    to fill them. */}
                {PARTNER_PILLS.map((name) => (
                  <span key={name} className="app-menu__partner-pill">
                    {name}
                  </span>
                ))}
              </footer>
            )
          }
        >
          {!activeNavItem && (
            <nav className="app-menu__rootlist" aria-label={t("menu.navLabel")}>
              {NAV_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  ref={(el) => {
                    if (el) rowRefs.current.set(item.id, el);
                    else rowRefs.current.delete(item.id);
                  }}
                  className="app-menu__row"
                  onClick={() => onSelectDestination(item.id)}
                >
                  <span className="app-menu__row-index">{padOrdinal(index + 1)}</span>
                  <span className="app-menu__row-label">{t(item.labelKey)}</span>
                </button>
              ))}
            </nav>
          )}

          {/* TG011 Pass A (ADGARC-FB-039 / ADGARC-FB-042 / DEC-010 §11.4):
              one header for every internal destination — Passaport,
              Información, Acerca de, Ajustes and Dev Settings alike — rather
              than a per-destination variant. The ordinal is the row's menu
              ordinal and carries no route, stop or sequence meaning. */}
          {activeNavItem && (
            <div className="app-menu__destination-header">
              <button
                type="button"
                className="app-menu__back"
                onClick={backToRoot}
                aria-label={t("menu.back")}
              >
                <span aria-hidden="true">←</span>
              </button>
              <span className="app-menu__row-index">{padOrdinal(activeIndex + 1)}</span>
              <span className="app-menu__row-label">{t(activeNavItem.labelKey)}</span>
            </div>
          )}

          {active === "info" && (
            <>
              <p>{t("info.p1")}</p>
              <p>{t("info.p2")}</p>
              <p className="app-modal__note">{t("info.note")}</p>
            </>
          )}

          {active === "about" && (
            <>
              <section className="app-modal__section">
                <h3>{t("about.project.title")}</h3>
                <p>{t("about.project.body")}</p>
              </section>
              <section className="app-modal__section">
                <h3>{t("about.methodology.title")}</h3>
                <p>{t("about.methodology.body")}</p>
              </section>
              <section className="app-modal__section">
                <h3>{t("about.credits.title")}</h3>
                <p className="app-modal__note">{t("about.credits.note")}</p>
              </section>
              {/* TG010 S4 (ADGARC-FB-025): fuller source credits, in
                  addition to — never instead of — the required
                  attribution MapLibre's own AttributionControl keeps
                  rendering over the map. Plain project-authored text: no
                  third-party attribution HTML is re-created here. */}
              <section className="app-modal__section">
                <h3>{t("about.credits.sourcesTitle")}</h3>
                <p>{t("about.credits.sources")}</p>
                <p className="app-modal__note">{t("about.credits.sourcesNote")}</p>
              </section>
            </>
          )}

          {active === "settings" && (
            <div className="settings-actions">
              <button type="button" className="settings-actions__btn" onClick={onResetMap}>
                {t("settings.resetMap")}
              </button>
              <button type="button" className="settings-actions__btn" onClick={onNorthUp}>
                {t("settings.northUp")}
              </button>
              <button type="button" className="settings-actions__btn" onClick={onEditorialOrientation}>
                {t("settings.editorialOrientation")}
              </button>
              <p className="app-modal__note">{t("settings.note")}</p>

              <div className="settings-actions__lang-group">
                <span className="settings-actions__lang-label">{t("settings.language.label")}</span>
                <div className="lang-switch" role="group" aria-label={t("settings.language.label")}>
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className="lang-switch__btn"
                      aria-pressed={locale === l.code}
                      disabled={l.status !== "active"}
                      onClick={() => setLocale(l.code)}
                    >
                      {l.selectorLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === "passport" && (
            <PassportPane passport={passport} cases={cases} onSelectCase={onSelectCase} />
          )}

          {/* TG011 Pass B (ADGARC-FB-045 / DEC-010 §11.5): row 05 is now a
              total function over the gate rather than a single gated
              expression — that missing `else` was the empty pane FB-045
              reported. `DEVTOOLS_ENABLED` itself is untouched: still the same
              build-time constant, still statically inlined, so an unflagged
              build dead-code-eliminates the DevTools branch exactly as
              before. The false branch is presentation only and adds no
              runtime capability; it states the unavailability and nothing
              else — no product version, no environment or path detail, and
              none of the six gated DevTools sections. */}
          {active === "devtools" &&
            (DEVTOOLS_ENABLED ? (
              <DevTools {...devTools} />
            ) : (
              <p className="dev-settings-unavailable">{t("devtools.unavailable")}</p>
            ))}
        </EditorialShell>
      </div>
    </div>
  );
}
