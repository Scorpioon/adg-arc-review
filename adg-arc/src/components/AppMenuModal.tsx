import { useRef, type RefObject } from "react";
import type { CaseRecord } from "../data/cases";
import { DEVTOOLS_ENABLED } from "../config/devtools";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { useLocale } from "../i18n/context";
import type { TranslationKey } from "../i18n/es";
import DevTools, { type DevToolsProps } from "./DevTools";
import { CloseIcon, MenuIcon } from "./icons";

export type MenuDestination = "cases" | "info" | "about" | "settings" | "devtools";

const NAV_ITEMS: Array<{ id: MenuDestination; labelKey: TranslationKey }> = [
  { id: "cases", labelKey: "nav.cases" },
  { id: "info", labelKey: "nav.info" },
  { id: "about", labelKey: "nav.about" },
  { id: "settings", labelKey: "nav.settings" },
  { id: "devtools", labelKey: "nav.devtools" },
];

interface AppMenuModalProps {
  open: boolean;
  active: MenuDestination | null;
  onToggle: () => void;
  onClose: () => void;
  onSelectDestination: (destination: MenuDestination) => void;
  // TG009: owned by App (not created locally here) so the same persistent
  // button can also serve as the entry curtain's manual-reopen focus-return
  // target — see App.tsx's menuTriggerRef.
  triggerRef: RefObject<HTMLButtonElement>;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
  onResetMap: () => void;
  onNorthUp: () => void;
  onEditorialOrientation: () => void;
  // TG009: reopens the editorial entry curtain — a menu action, not a
  // destination pane, so it stays outside the MenuDestination union/pane
  // switch below (ADGARC_DEC_005 "Dismissal and re-entry").
  onOpenIntro: () => void;
  devTools: DevToolsProps;
}

// TG006E corrective pass: replaces the left-edge AppSidebar overlay with a
// centered floating application-menu modal (ChatGPT-Settings-shaped) — see
// the corrective handoff §2. The trigger button stays permanently mounted
// (so it is always reachable, closed or open); the dialog itself (backdrop +
// panel) only mounts while `open`, matching how AppModal's own consumers
// mount it — this keeps AppMenuDialog's useDialogA11y call unconditional
// within its own component tree, never a hook called behind a runtime `if`.
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
  onOpenIntro,
  devTools,
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
          onOpenIntro={onOpenIntro}
          devTools={devTools}
        />
      )}
    </>
  );
}

interface AppMenuDialogProps {
  triggerRef: RefObject<HTMLElement>;
  onClose: () => void;
  active: MenuDestination | null;
  onSelectDestination: (destination: MenuDestination) => void;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
  onResetMap: () => void;
  onNorthUp: () => void;
  onEditorialOrientation: () => void;
  onOpenIntro: () => void;
  devTools: DevToolsProps;
}

// One coherent modal shell — nav column + active content pane — built on
// the same useDialogA11y primitive AppModal uses (focus-in, Tab-trap,
// Escape, focus-return), per the handoff's "prefer reusing/refactoring the
// existing AppModal primitive rather than building an unrelated second
// modal system." The backdrop dims *and* blurs the map behind it
// (.app-menu-backdrop in global.css) and blocks all pointer interaction
// with it, since it is a full-viewport layer above everything else.
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
  onOpenIntro,
  devTools,
}: AppMenuDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useDialogA11y({ onClose, triggerRef, initialFocusRef: closeButtonRef });
  const { t, locale, setLocale, locales } = useLocale();

  const visibleNavItems = NAV_ITEMS.filter((item) => item.id !== "devtools" || DEVTOOLS_ENABLED);

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
        <header className="app-menu__header">
          <span className="app-menu__mark">ADG·ARC</span>
          <button
            type="button"
            ref={closeButtonRef}
            className="app-modal__close"
            onClick={onClose}
            aria-label={t("menu.close")}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="app-menu__body">
          <nav className="app-menu__nav" aria-label={t("menu.navLabel")}>
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="app-menu__nav-btn"
                aria-current={active === item.id ? "true" : undefined}
                onClick={() => onSelectDestination(item.id)}
              >
                {t(item.labelKey)}
              </button>
            ))}
            {/* TG009: menu action, not a destination pane — reopens the
                editorial entry curtain and closes this menu; never sets
                `active`/aria-current, unlike the panes above. */}
            <button type="button" className="app-menu__nav-btn" onClick={onOpenIntro}>
              {t("menu.introAction")}
            </button>
          </nav>

          <div className="app-menu__pane" aria-live="polite">
            {active === "cases" && (
              <ol className="cases-index">
                {cases.map((c, i) => (
                  <li key={c.slug}>
                    <button
                      type="button"
                      className="cases-index__row"
                      onClick={() => onSelectCase(c.slug)}
                    >
                      <span className="cases-index__ordinal">{String(i + 1).padStart(2, "0")}</span>
                      <span className="cases-index__identity">
                        <span className="cases-index__name">{c.identity.name}</span>
                        <span className="cases-index__meta">
                          {c.identity.year} · {c.identity.architect} · {c.typography.primaryFamily}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
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

            {active === "devtools" && DEVTOOLS_ENABLED && <DevTools {...devTools} />}
          </div>
        </div>
      </div>
    </div>
  );
}
