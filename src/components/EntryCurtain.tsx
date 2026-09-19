import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { useT } from "../i18n/context";

// Matches the CSS transition duration below (ADGARC_DEC_005: ~650-800ms).
const EXIT_MS = 700;

interface EntryCurtainProps {
  // Persists the sessionStorage dismissal immediately — independent of the
  // exit transition, so a storage write is never lost to a closed tab.
  onRequestClose: () => void;
  // Actually unmounts the curtain, called once the exit transition (or the
  // reduced-motion immediate path) has finished.
  onExited: () => void;
  triggerRef: RefObject<HTMLElement>;
  reducedMotion: boolean;
  // TG009 R1 corrective §2: true only once LoadingScreen has released and
  // the curtain is the actual visible/interactive surface. While false, the
  // curtain owns no Escape/focus-placement/Tab-trap behavior (see
  // useDialogA11y's `enabled`) — it exists in the DOM, covered, but is not
  // yet "live" as a dialog.
  interactive: boolean;
}

// TG009: the editorial opening layer over the existing Barcelona map/app —
// see ADGARC_DEC_005 for the full product contract. Reuses useDialogA11y
// (the same focus-in/Tab-trap/Escape/focus-return primitive AppModal and
// AppMenuDialog already share) rather than a second, parallel modal
// mechanism; `triggerRef` is the persistent app-menu trigger button so a
// manual Introducción re-entry restores focus there on close, and is simply
// unset (a no-op focus return) for an automatic first-visit showing.
export default function EntryCurtain({ onRequestClose, onExited, triggerRef, reducedMotion, interactive }: EntryCurtainProps) {
  const [exiting, setExiting] = useState(false);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const t = useT();

  const handleDismiss = useCallback(() => {
    onRequestClose();
    if (reducedMotion) {
      onExited();
      return;
    }
    setExiting(true);
  }, [onRequestClose, onExited, reducedMotion]);

  const dialogRef = useDialogA11y({
    onClose: handleDismiss,
    triggerRef,
    initialFocusRef: ctaRef,
    enabled: interactive,
  });

  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(onExited, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [exiting, onExited]);

  return (
    <div
      ref={dialogRef}
      className={`entry-curtain${exiting ? " entry-curtain--exiting" : ""}`}
      role="dialog"
      aria-modal={interactive ? "true" : undefined}
      aria-hidden={interactive ? undefined : true}
      aria-labelledby="entry-curtain-title"
    >
      <div className="entry-curtain__content">
        <p className="entry-curtain__kicker">{t("entryCurtain.kicker")}</p>
        <h1 id="entry-curtain-title" className="entry-curtain__title">
          {t("entryCurtain.title")}
        </h1>
        <p className="entry-curtain__body">{t("entryCurtain.body")}</p>
        <button
          type="button"
          ref={ctaRef}
          className="entry-curtain__cta"
          onClick={handleDismiss}
          disabled={!interactive}
        >
          {t("entryCurtain.cta")}
        </button>
      </div>
    </div>
  );
}
