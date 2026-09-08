import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "adgarc.entryCurtain.dismissed.v1";

function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismissed(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Fail-soft (ADGARC_DEC_005): a storage failure keeps the in-memory
    // dismissal for this mounted session only — the app stays usable.
  }
}

interface UseEntryCurtainOptions {
  // Whether a valid ?case=<slug> already resolved when the app mounted.
  // Read once, at mount, matching the contract's "no valid selected case is
  // resolved on entry" — selecting/clearing a case later in the same
  // session must not resurface or re-hide the curtain.
  hasValidCase: boolean;
}

// TG009: session-scoped editorial entry curtain state. Automatic display is
// decided once at mount from the initial deep-link resolution and any prior
// sessionStorage dismissal (ADGARC_DEC_005's appearance/persistence rules).
// `open` is the ephemeral visibility flag (also flipped by manual
// Introducción re-entry); `dismissed`/`markDismissed` track the persisted
// sessionStorage flag independently, since manual re-entry must not clear it.
export function useEntryCurtain({ hasValidCase }: UseEntryCurtainOptions) {
  const [dismissed, setDismissed] = useState(() => readDismissed() || hasValidCase);
  const [open, setOpen] = useState(() => !dismissed);

  useEffect(() => {
    // Valid deep-link bypass counts as dismissed for the rest of this
    // browser session (ADGARC_DEC_005 "Direct-link / QR rule").
    if (hasValidCase) persistDismissed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markDismissed = useCallback(() => {
    setDismissed(true);
    persistDismissed();
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const reopen = useCallback(() => setOpen(true), []);

  return { open, dismissed, markDismissed, close, reopen };
}
