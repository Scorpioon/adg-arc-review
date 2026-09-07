import { useCallback, useEffect, useState } from "react";
import { CASE_PARAM_KEY as PARAM } from "../lib/deepLink";

function readCaseParam(): string | null {
  return new URLSearchParams(window.location.search).get(PARAM);
}

// Minimal deep-link stub: reads/writes ?case=<slug> via the History API.
// Deliberately not a router — App remains the single owner of navigation.
export function useCaseParam(): [string | null, (slug: string | null) => void] {
  const [caseSlug, setCaseSlug] = useState<string | null>(() => readCaseParam());

  useEffect(() => {
    const onPopState = () => setCaseSlug(readCaseParam());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setCase = useCallback((slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set(PARAM, slug);
    } else {
      url.searchParams.delete(PARAM);
    }
    window.history.pushState({}, "", url);
    setCaseSlug(slug);
  }, []);

  return [caseSlug, setCase];
}
