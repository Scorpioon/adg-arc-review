import { useCallback, useState } from "react";

const STORAGE_KEY = "adgarc.ui.coachmark.gesture.v1";

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

// TG006I Scope A — one-time gesture coachmark persistence (ADGARC-FB-003
// extension / ADGARC-DEC-003). `dismiss` is called either explicitly (the
// coachmark's own dismiss button) or the first time MapView reports a real,
// user-originated map interaction (drag/zoom/rotate/pitch start — see
// MapView's onUserInteraction wiring, which only fires for events carrying
// a real `originalEvent`, never for the app's own programmatic camera
// moves) — never a fabricated timer-based dismissal. `visible` is exported
// as a plain boolean (not gated on device class here) — callers decide
// which device classes render the coachmark at all.
export function useGestureCoachmark() {
  const [dismissed, setDismissed] = useState(() => readDismissed());

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Local-dev/persistence convenience only — a storage failure just
      // means the coachmark may reappear next visit, never a hard failure.
    }
  }, []);

  return { dismissed, dismiss };
}
