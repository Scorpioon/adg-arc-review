import { useCallback, useMemo, useRef, useState } from "react";
import { cases } from "../data/cases";

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

// TG010: single passport-progress authority (DEC-006). The physical set is
// derived fresh from `cases` on every call — never a second hardcoded
// count/list. `visited` mirrors localStorage["adgarc.passport.v1"], read
// once at mount and filtered against the *current* physical set so a
// stale/unknown/non-physical slug can never inflate progress.
export function usePassport(): PassportState & { stamp: (slug: string) => StampResult } {
  const physicalSlugs = useMemo(
    () => new Set(cases.filter((c) => c.experienceType === "physical_digital").map((c) => c.slug)),
    []
  );
  const total = physicalSlugs.size;

  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(readStoredSlugs().filter((slug) => physicalSlugs.has(slug)))
  );
  // Synchronous mirror of `visited` — `stamp()` must return an up-to-date
  // count/stamped decision immediately, not after React's batched/async
  // commit of the `setVisited` updater.
  const visitedRef = useRef(visited);
  visitedRef.current = visited;

  const stamp = useCallback(
    (slug: string): StampResult => {
      const current = visitedRef.current;
      if (!physicalSlugs.has(slug) || current.has(slug)) {
        return { stamped: false, count: current.size, total };
      }
      const next = new Set(current);
      next.add(slug);
      visitedRef.current = next;
      setVisited(next);
      persistSlugs([...next]);
      return { stamped: true, count: next.size, total };
    },
    [physicalSlugs, total]
  );

  const reset = useCallback(() => {
    visitedRef.current = new Set();
    setVisited(new Set());
    persistSlugs([]);
  }, []);

  return { visited, count: visited.size, total, stamp, reset };
}
