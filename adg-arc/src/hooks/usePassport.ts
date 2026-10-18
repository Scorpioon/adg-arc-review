import { useCallback, useMemo, useRef, useState } from "react";
import { activeCases } from "../data/cases";

const STORAGE_KEY = "adgarc.passport.v1";

function readStoredSlugs(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function persistSlugs(slugs: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Fail-soft (DEC-006): a storage failure keeps the in-memory Set update
    // for this mounted session only — passport progress stays usable.
  }
}

export interface StampResult {
  stamped: boolean;
  count: number;
  total: number;
}

export interface PassportState {
  visited: Set<string>;
  count: number;
  total: number;
  reset: () => void;
}

// TG010/TG039: single passport-progress authority (DEC-006, FB-126). The
// eligible set is derived fresh from `activeCases` on every call — never a
// second hardcoded count/list, and never narrowed to the physical-only
// cohort (cases.ts's `experienceType` governs physical-proof gating in
// App.tsx's `canStampCase`, a separate concern from Passport membership).
//
// TG046 P1 (FB-113/archival-safety finding): storage now holds the full
// *known* set of every slug ever stamped, unfiltered — never just the
// active ones. Previously `visited` itself was the persisted state, already
// filtered to `eligibleSlugs` before being written back; the next `stamp()`
// after any case left the active roster silently rewrote localStorage with
// that filtered set, permanently erasing the older stamp. `visited` is now
// a derived, active-only view for display/count, so existing consumers
// (App.tsx, PassportPane, PassportMapNavbar) see unchanged behavior while
// `known` — and the archived stamps inside it — survive roster changes.
export function usePassport(): PassportState & { stamp: (slug: string) => StampResult } {
  const eligibleSlugs = useMemo(() => new Set(activeCases.map((c) => c.slug)), []);
  const total = eligibleSlugs.size;

  const [known, setKnown] = useState<Set<string>>(() => new Set(readStoredSlugs()));
  // Synchronous mirror of `known` — `stamp()` must return an up-to-date
  // count/stamped decision immediately, not after React's batched/async
  // commit of the `setKnown` updater.
  const knownRef = useRef(known);
  knownRef.current = known;

  const visited = useMemo(
    () => new Set([...known].filter((slug) => eligibleSlugs.has(slug))),
    [known, eligibleSlugs]
  );

  const stamp = useCallback(
    (slug: string): StampResult => {
      const current = knownRef.current;
      const activeCount = (set: Set<string>) =>
        [...set].filter((s) => eligibleSlugs.has(s)).length;
      if (!eligibleSlugs.has(slug) || current.has(slug)) {
        return { stamped: false, count: activeCount(current), total };
      }
      const next = new Set(current);
      next.add(slug);
      knownRef.current = next;
      setKnown(next);
      persistSlugs([...next]);
      return { stamped: true, count: activeCount(next), total };
    },
    [eligibleSlugs, total]
  );

  const reset = useCallback(() => {
    knownRef.current = new Set();
    setKnown(new Set());
    persistSlugs([]);
  }, []);

  return { visited, count: visited.size, total, stamp, reset };
}
