import { useEffect, useState } from "react";

// TG018 Pass A / Correction Matrix §J — shared bounded-window pagination
// primitive. Both the map-top Passport navbar and the dossier's internal
// page nav show a fixed-size visible slice of a larger ordered total and
// must step that slice by exactly one position per arrow click (never a
// visibleCount-sized jump). This hook owns only that window bookkeeping —
// no selection, no stamping, no case/page identity, no visual rendering.
// The two surfaces keep their own distinct markup/CSS (matrix §J: "visual
// wrappers may remain distinct"); only the windowing math is shared.
export interface UseWindowedIndexResult {
  windowStart: number;
  atStart: boolean;
  atEnd: boolean;
  goPrevious: () => void;
  goNext: () => void;
}

// `follow`, when given, is an externally-driven index (e.g. the dossier's
// own current page) that the window must always keep in view — shifting by
// the minimum amount needed rather than resetting. A move to an adjacent
// index (arrow navigation) therefore shifts the window by at most one
// position; a direct jump to a distant index repositions it in one step.
// Omitted entirely for a window with no such external driver (the map
// navbar's arrows are the only thing that ever moves its window).
export function useWindowedIndex(
  total: number,
  visibleCount: number,
  follow?: number
): UseWindowedIndexResult {
  const maxStart = Math.max(0, total - visibleCount);
  const [windowStart, setWindowStart] = useState(0);

  // A resize or total/visibleCount change can only ever shrink/grow the
  // valid range — clamp into it without resetting position.
  useEffect(() => {
    setWindowStart((start) => Math.min(Math.max(start, 0), maxStart));
  }, [maxStart]);

  useEffect(() => {
    if (follow === undefined) return;
    setWindowStart((start) => {
      if (follow < start) return Math.max(0, follow);
      if (follow > start + visibleCount - 1) return Math.min(maxStart, follow - visibleCount + 1);
      return start;
    });
  }, [follow, visibleCount, maxStart]);

  const goPrevious = () => setWindowStart((start) => Math.max(0, start - 1));
  const goNext = () => setWindowStart((start) => Math.min(maxStart, start + 1));

  return {
    windowStart,
    atStart: windowStart === 0,
    atEnd: windowStart >= maxStart,
    goPrevious,
    goNext,
  };
}
