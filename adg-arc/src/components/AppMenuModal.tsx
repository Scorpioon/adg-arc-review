import { useRef, type RefObject } from "react";
import type { CaseRecord } from "../data/cases";
import { DEVTOOLS_ENABLED } from "../config/devtools";
import { useDialogA11y } from "../hooks/useDialogA11y";
import DevTools, { type DevToolsProps } from "./DevTools";
import { CloseIcon, MenuIcon } from "./icons";

export type MenuDestination = "cases" | "info" | "about" | "settings" | "devtools";

const NAV_ITEMS: Array<{ id: MenuDestination; label: string }> = [
  { id: "cases", label: "Cases" },
  { id: "info", label: "Info" },
  { id: "about", label: "About" },
  { id: "settings", label: "Settings" },
  { id: "devtools", label: "Developer Tools" },
];

interface AppMenuModalProps {
  open: boolean;
  active: MenuDestination | null;
  onToggle: () => void;
  onClose: () => void;
  onSelectDestination: (destination: MenuDestination) => void;
  cases: CaseRecord[];
  onSelectCase: (slug: string) => void;
  onResetMap: () => void;
  onNorthUp: () => void;
  onEditorialOrientation: () => void;
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
  cases,
  onSelectCase,
  onResetMap,
  onNorthUp,
  onEditorialOrientation,
  devTools,
}: AppMenuModalProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="app-menu-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="app-menu-panel"
        aria-label={open ? "Close application menu" : "Open application menu"}
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
  devTools,
}: AppMenuDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useDialogA11y({ onClose, triggerRef, initialFocusRef: closeButtonRef });

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
        aria-label="Application menu"
      >
        <header className="app-menu__header">
          <span className="app-menu__mark">ADG·ARC</span>
          <button
            type="button"
            ref={closeButtonRef}
            className="app-modal__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="app-menu__body">
          <nav className="app-menu__nav" aria-label="Application destinations">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="app-menu__nav-btn"
                aria-current={active === item.id ? "true" : undefined}
                onClick={() => onSelectDestination(item.id)}
              >
                {item.label}
              </button>
            ))}
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
                <p>
                  ADG-ARC explores relationships between architecture and typography in Barcelona,
                  pairing each building with a typeface chosen for a resonance between the two.
                </p>
                <p>
                  The map is the primary way to explore the collection — pan, zoom, and select any of
                  the current 10 cases, or browse them from the Cases menu.
                </p>
                <p className="app-modal__note">
                  This is a functional review build. Visual design, copy, and content are still
                  provisional.
                </p>
              </>
            )}

            {active === "about" && (
              <>
                <section className="app-modal__section">
                  <h3>Project</h3>
                  <p>
                    ADG-ARC pairs Barcelona buildings with typefaces selected for a formal or
                    conceptual correlation between the architecture and the letterforms.
                  </p>
                </section>
                <section className="app-modal__section">
                  <h3>Methodology</h3>
                  <p>
                    Each case begins from a source-documented building/typeface pairing and a written
                    architecture-typography rationale; the depth of editorial treatment currently
                    varies case by case.
                  </p>
                </section>
                <section className="app-modal__section">
                  <h3>Team / Credits</h3>
                  <p className="app-modal__note">Pending team confirmation.</p>
                </section>
              </>
            )}

            {active === "settings" && (
              <div className="settings-actions">
                <button type="button" className="settings-actions__btn" onClick={onResetMap}>
                  Return to DHub / Reset map
                </button>
                <button type="button" className="settings-actions__btn" onClick={onNorthUp}>
                  North-up
                </button>
                <button type="button" className="settings-actions__btn" onClick={onEditorialOrientation}>
                  Editorial orientation
                </button>
                <p className="app-modal__note">These are one-off map actions, not saved preferences.</p>
              </div>
            )}

            {active === "devtools" && DEVTOOLS_ENABLED && <DevTools {...devTools} />}
          </div>
        </div>
      </div>
    </div>
  );
}
