import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

interface UseDialogA11yOptions {
  onClose: () => void;
  triggerRef: RefObject<HTMLElement>;
  // Element focused on open; defaults to the dialog's first focusable
  // descendant when omitted.
  initialFocusRef?: RefObject<HTMLElement>;
  // TG009 R1 corrective §2: gates initial-focus placement, the Escape
  // listener, and the Tab-trap. Defaults to true (every pre-existing
  // caller — AppModal/AppMenuDialog — is unaffected). EntryCurtain passes
  // false while it is mounted-but-covered under LoadingScreen, so it does
  // not own keyboard/focus behavior for a surface the user cannot yet see;
  // once it flips to true the effects below run exactly as they would have
  // on mount, so the dialog becomes fully modal at that point instead of
  // never.
  enabled?: boolean;
}

// TG006E corrective pass: the true-modal accessibility mechanics — focus
// enters on open, a global Tab-trap keeps focus inside the dialog, Escape
// closes, focus returns to the trigger on close — extracted out of AppModal
// so AppMenuDialog can share the exact same primitive instead of a second,
// parallel modal implementation (see AppModal.tsx and AppMenuModal.tsx).
export function useDialogA11y({ onClose, triggerRef, initialFocusRef, enabled = true }: UseDialogA11yOptions) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const initial = initialFocusRef?.current ?? (dialogRef.current ? getFocusable(dialogRef.current)[0] : undefined);
    initial?.focus();
    return () => {
      triggerRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = getFocusable(dialogRef.current);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(active)) {
        // Focus somehow left the dialog (e.g. a background element retained
        // it) — pull it back in rather than letting Tab continue outside.
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, enabled]);

  return dialogRef;
}
