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

export type InfocardChapter = 1 | 2 | 3 | 4 | 5;

export interface InfocardPageDescriptor {
  id: InfocardPageId;
  chapter: InfocardChapter | null;
}

// Cover is outside the numbered chapter system (DEC-010 §D2). 1a/1b/1c all
// carry chapter 1; 1b is omitted entirely when there is no approved
// highlighted phrase, rather than rendered as an empty page.
function buildPageDescriptors(activeCase: CaseRecord | undefined): InfocardPageDescriptor[] {
  if (!activeCase) return [];

  const descriptors: InfocardPageDescriptor[] = [
    { id: "cover", chapter: null },
    { id: "building-facts", chapter: 1 },
  ];

  if (activeCase.infocard.highlightedPhrase !== null) {
    descriptors.push({ id: "building-highlight", chapter: 1 });
  }

  descriptors.push(
    { id: "building-prose", chapter: 1 },
    // Pass F1C: Arquitectura is one chapter dot but two internal steps — a
    // movement-only composition, then a running-text composition — never
    // merged onto a single page (prompt 047 §F).
    { id: "architecture-movement", chapter: 2 },
    { id: "architecture-prose", chapter: 2 },
    { id: "typography", chapter: 3 },
    { id: "dialogue", chapter: 4 },
    { id: "specimen", chapter: 5 }
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
  jumpToChapter: (chapter: InfocardChapter) => void;
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

  const jumpToChapter = useCallback(
    (chapter: InfocardChapter) => {
      const target = descriptors.findIndex((descriptor) => descriptor.chapter === chapter);
      if (target !== -1) setPageIndex(target);
    },
    [descriptors]
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
    jumpToChapter,
  };
}
