import { useEffect, useRef } from "react";
import type { CaseRecord } from "../data/cases";
import { ENTRY_PARAM_KEY, ENTRY_PHYSICAL_VALUE } from "../lib/deepLink";

interface UsePhysicalEntrySignalOptions {
  activeCase: CaseRecord | undefined;
  onValidPhysicalEntry: (slug: string) => void;
}

// TG010: consumes the transient `?entry=physical` signal exactly once per
// page load that carries it (DEC-006). Reads `window.location.href` in a
// mount-only effect gated by a `consumed` ref; regardless of whether the
// case turns out to be valid/physical, strips only `entry` via
// `history.replaceState` — never `pushState` (no extra back-button entry
// for the signal itself) and never through useCaseParam's setter (no extra
// history entry, case remount, or map/camera touch as a side effect of
// consuming it). Only calls `onValidPhysicalEntry(slug)` when the case
// resolved at mount is `physical_digital`.
export function usePhysicalEntrySignal({ activeCase, onValidPhysicalEntry }: UsePhysicalEntrySignalOptions): void {
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get(ENTRY_PARAM_KEY) !== ENTRY_PHYSICAL_VALUE) return;

    consumedRef.current = true;
    url.searchParams.delete(ENTRY_PARAM_KEY);
    window.history.replaceState({}, "", url);

    if (activeCase?.experienceType === "physical_digital") {
      onValidPhysicalEntry(activeCase.slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
