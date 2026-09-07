import { useRef, type ReactNode, type RefObject } from "react";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { CloseIcon } from "./icons";

interface AppModalProps {
  titleId: string;
  title: string;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement>;
  children: ReactNode;
}

// TG006B: one reusable, dependency-free application modal — distinct from
// CaseSheet, which stays non-modal (ADGARC-FB-004). Modal accessibility
// mechanics (focus-in, Tab-trap, Escape, focus-return) live in the shared
// useDialogA11y hook (TG006E corrective pass) so AppMenuDialog can reuse the
// exact same primitive rather than a second, parallel modal implementation.
// The full-viewport backdrop (see .app-modal-backdrop in global.css) sits
// above every other layer, so a background click can never reach the map
// either.
export default function AppModal({ titleId, title, onClose, triggerRef, children }: AppModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useDialogA11y({ onClose, triggerRef, initialFocusRef: closeButtonRef });

  return (
    <div
      className="app-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="app-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="app-modal__header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            ref={closeButtonRef}
            className="app-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="app-modal__body">{children}</div>
      </div>
    </div>
  );
}
