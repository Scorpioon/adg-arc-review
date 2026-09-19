import { useT } from "../i18n/context";

interface GestureCoachmarkProps {
  onDismiss: () => void;
}

// TG006I Scope A — non-modal one-time gesture coachmark (ADGARC-FB-003
// extension, ADGARC-FB-008). Rendered by App only for touch-first device
// classes and only until dismissed/acknowledged (see useGestureCoachmark).
// Deliberately not a dialog: no role="dialog", no focus trap, no backdrop —
// it must never block interaction with the map beneath it or with a direct
// `?case=` arrival, which App only mounts this alongside when no case is
// selected (see App.tsx). z-index sits below the case-sheet's mobile
// full-screen surface in global.css, so it can never cover a case reading
// view even if that render-gating were ever relaxed.
export default function GestureCoachmark({ onDismiss }: GestureCoachmarkProps) {
  const t = useT();
  return (
    <div className="gesture-coachmark" role="status" aria-live="polite">
      <p className="gesture-coachmark__text">{t("coachmark.text")}</p>
      <button
        type="button"
        className="gesture-coachmark__dismiss"
        onClick={onDismiss}
      >
        {t("coachmark.dismiss")}
      </button>
    </div>
  );
}
