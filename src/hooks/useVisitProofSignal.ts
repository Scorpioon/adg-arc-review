import { useEffect, useRef } from "react";
import type { CaseRecord } from "../data/cases";
import { validatePhysicalProofToken, VISIT_PARAM_KEY } from "../lib/qrContract";

interface UseVisitProofSignalOptions {
  activeCase: CaseRecord | undefined;
  onValidProof: (slug: string) => void;
  onInvalidProof?: (slug: string) => void;
}

// TG014 — QR Contract v1: consumes the transient `?visit=<token>` signal a
// printed-plaque scan carries, exactly once per page load that carries it.
// Supersedes usePhysicalEntrySignal.ts / the retired legacy physical-entry
// query signal (TG010): that path stamped the passport directly from an
// unproven, fixed query value. This hook never stamps anything — it only
// ever validates and
// (on success) reports local physical-visit proof for the exact case slug
// resolved at mount; the caller is responsible for persisting that proof and
// for the separate, explicit Touch to Check action that stamps the passport.
//
// `visit` is stripped from the visible URL via `history.replaceState`
// regardless of whether the token turns out to be valid, missing Web
// Crypto, malformed, or mismatched for this case — it must never linger in
// the address bar, in browser history, or be re-processed on a later
// popstate.
export function useVisitProofSignal({
  activeCase,
  onValidProof,
  onInvalidProof,
}: UseVisitProofSignalOptions): void {
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;

    const url = new URL(window.location.href);
    const token = url.searchParams.get(VISIT_PARAM_KEY);
    if (token === null) return;

    consumedRef.current = true;
    url.searchParams.delete(VISIT_PARAM_KEY);
    window.history.replaceState({}, "", url);

    const slug = activeCase?.slug;
    if (!slug) return;

    validatePhysicalProofToken(slug, token)
      .then((valid) => {
        if (valid) {
          onValidProof(slug);
        } else {
          onInvalidProof?.(slug);
        }
      })
      .catch(() => {
        // Fail closed: any unexpected validation error is treated as an
        // invalid proof, never as a silent success.
        onInvalidProof?.(slug);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
