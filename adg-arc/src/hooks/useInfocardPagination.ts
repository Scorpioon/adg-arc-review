import { useCallback, useEffect, useMemo, useState } from "react";
import type { CaseRecord } from "../data/cases";

export type InfocardPageId =
  | "cover"
  | "building-facts"
  | "building-highlight"
  | "building-prose"
  | "architecture-movement"
  | "architecture-prose"
  | "typography"
  | "dialogue"
  | "specimen";

export interface InfocardPageDescriptor {
  id: InfocardPageId;
}

// TG018 Pass C / correction matrix §G: internal navigation now numbers every
// actual page/ficha (one number per descriptor below), never a fixed
// five-chapter grouping — the former `chapter`/`jumpToChapter` concept this
// hook exposed is removed rather than left dead, since `InfocardDossier`'s
// numeric nav now indexes this list directly (see `goToPage`). 1a/1b/1c all
// belonged to "chapter 1"; that grouping added nothing the descriptor order
// itself doesn't already say. 1b is still omitted entirely when there is no
// approved highlighted phrase, rather than rendered as an empty page.
function buildPageDescriptors(activeCase: CaseRecord | undefined): InfocardPageDescriptor[] {
  if (!activeCase) return [];

  const descriptors: InfocardPageDescriptor[] = [{ id: "cover" }, { id: "building-facts" }];

  if (activeCase.infocard.highlightedPhrase !== null) {
    descriptors.push({ id: "building-highlight" });
  }

  descriptors.push(
    { id: "building-prose" },
    // Pass F1C: Arquitectura is a movement-only composition, then a
    // running-text composition — two distinct pages, never merged onto one
    // (prompt 047 §F); TG018 now also gives each its own nav number rather
    // than sharing a single chapter dot.
    { id: "architecture-movement" },
    { id: "architecture-prose" },
    { id: "typography" },
    { id: "dialogue" },
    { id: "specimen" }
  );

  return descriptors;
}

export interface UseInfocardPaginationResult {
  descriptors: InfocardPageDescriptor[];
  currentPage: InfocardPageDescriptor | undefined;
  pageIndex: number;
  pageCount: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  goPrevious: () => void;
  goNext: () => void;
  // TG018 Pass C: replaces `jumpToChapter` — the numeric nav pips now index
  // real pages directly, so jumping means jumping to a 0-based page index.
  // Clamped the same way `goPrevious`/`goNext` already are.
  goToPage: (index: number) => void;
}

export function useInfocardPagination(
  activeCase: CaseRecord | undefined
): UseInfocardPaginationResult {
  const descriptors = useMemo(() => buildPageDescriptors(activeCase), [activeCase]);
  const [pageIndex, setPageIndex] = useState(0);

  // A newly selected case always lands back on its cover page.
  useEffect(() => {
    setPageIndex(0);
  }, [activeCase?.slug]);

  // Defends against the descriptor list shrinking (e.g. the optional
  // highlighted-phrase page dropping out) out from under the current index.
  useEffect(() => {
    setPageIndex((prev) => Math.min(prev, Math.max(descriptors.length - 1, 0)));
  }, [descriptors.length]);

  const pageCount = descriptors.length;
  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  const goPrevious = useCallback(() => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goNext = useCallback(() => {
    setPageIndex((prev) => Math.min(prev + 1, pageCount - 1));
  }, [pageCount]);

  const goToPage = useCallback(
    (index: number) => {
      setPageIndex(Math.min(Math.max(index, 0), pageCount - 1));
    },
    [pageCount]
  );

  return {
    descriptors,
    currentPage: descriptors[pageIndex],
    pageIndex,
    pageCount,
    canGoPrevious,
    canGoNext,
    goPrevious,
    goNext,
    goToPage,
  };
}
