import { useCallback, useMemo, useRef, useState } from "react";

// TG006B: a small typed readiness tracker driven only by real application
// milestones (ADGARC-FB-005) — no timer-based or random progress. `boot`
// completes the instant this hook first initializes (the earliest real
// signal available; ADG-ARC has no async pre-React bootstrap phase to hook
// a distinct event to). `reactMounted` is completed separately, from a
// `useEffect` in App, so it reflects React's actual first-commit lifecycle
// event rather than being folded into `boot`. The remaining milestones are
// completed by MapView from genuine MapLibre callbacks — see MapView.tsx.
//
// TG006F Scope F/G extends this hook (does not replace its semantics): a
// real loading/ready/failed status model, a normalized failure record for
// LoadingScreen/DevTools, a separate nonfatal-warning channel (never fails
// readiness on its own), and event-driven `performance.now()` timing per
// milestone. `complete`/`progress`/`ready`/`error` keep their exact prior
// call signature and meaning — no existing consumer needed to change.
export type Milestone =
  | "boot"
  | "reactMounted"
  | "mapCreated"
  | "styleLoaded"
  | "layersReady"
  | "ready";

const MILESTONES: Milestone[] = [
  "boot",
  "reactMounted",
  "mapCreated",
  "styleLoaded",
  "layersReady",
  "ready",
];

export type ReadinessStatus = "loading" | "ready" | "failed";

export interface ReadinessFailure {
  message: string;
  // The last milestone actually completed before failure — "unknown" only
  // if `fail` somehow fires before `boot` (unreachable in practice, since
  // `boot` completes synchronously at hook init).
  lastMilestone: Milestone | "unknown";
  timestamp: number;
}

export interface ReadinessWarning {
  message: string;
  timestamp: number;
}

// Most recent nonfatal warnings kept for Developer Tools review — a small
// fixed cap, not an unbounded log (no telemetry, no external reporting).
const MAX_WARNINGS = 5;

export function useReadiness() {
  const [completed, setCompleted] = useState<Set<Milestone>>(() => new Set(["boot"]));
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<ReadinessFailure | null>(null);
  const [warnings, setWarnings] = useState<ReadinessWarning[]>([]);
  const [timings, setTimings] = useState<Partial<Record<Milestone, number>>>(() => ({ boot: 0 }));

  // Origin for relative timing — the instant this hook first runs, the
  // earliest real signal available in-app (mirrors `boot`'s own reasoning
  // above). Read once via a ref so it never resets across re-renders.
  const originRef = useRef<number>(performance.now());
  const timingsRef = useRef<Partial<Record<Milestone, number>>>({ boot: 0 });

  const complete = useCallback((milestone: Milestone) => {
    setCompleted((prev) => {
      if (prev.has(milestone)) return prev;
      const next = new Set(prev);
      next.add(milestone);
      return next;
    });
    if (timingsRef.current[milestone] === undefined) {
      const elapsed = Math.round(performance.now() - originRef.current);
      timingsRef.current[milestone] = elapsed;
      setTimings({ ...timingsRef.current });
    }
  }, []);

  // Fatal: readiness cannot proceed. `error` (string) is kept exactly as
  // before for LoadingScreen; `failure` adds the normalized record
  // (last-completed milestone + timestamp) for Developer Tools, per handoff
  // Scope F "capture a useful normalized error summary".
  const fail = useCallback((message: string) => {
    // First failure wins for both fields — a second `fail()` call (should
    // one ever occur) must not silently swap out the original cause shown
    // to the user in LoadingScreen (`error`) for a different one than the
    // normalized record (`failure`) Developer Tools reads.
    setError((prev) => prev ?? message);
    setFailure((prev) => {
      if (prev) return prev;
      let last: Milestone | "unknown" = "unknown";
      for (const m of MILESTONES) {
        if (timingsRef.current[m] !== undefined) last = m;
      }
      return { message, lastMilestone: last, timestamp: Date.now() };
    });
  }, []);

  // Nonfatal: recorded for visibility (Developer Tools) but never flips
  // `status` to "failed" and never touches `error`/`ready` — a recoverable
  // MapLibre warning must not falsely fail the whole application (handoff
  // Scope F).
  const warn = useCallback((message: string) => {
    setWarnings((prev) => [{ message, timestamp: Date.now() }, ...prev].slice(0, MAX_WARNINGS));
  }, []);

  // Deterministic percentage: completed milestones / total milestones. Never
  // driven by elapsed time.
  const progress = Math.round((completed.size / MILESTONES.length) * 100);
  const ready = completed.has("ready");

  const status: ReadinessStatus = useMemo(() => {
    if (failure) return "failed";
    return ready ? "ready" : "loading";
  }, [failure, ready]);

  return { complete, fail, warn, progress, ready, error, status, failure, warnings, timings };
}
