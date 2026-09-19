import { useCallback, useMemo, useRef, useState } from "react";
import { hasPhysicalProofHash, PHYSICAL_PROOF_STORAGE_KEY } from "../lib/qrContract";

function readStoredSlugs(): string[] {
  try {
    const raw = window.localStorage.getItem(PHYSICAL_PROOF_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    // Malformed JSON => safe empty state, never a thrown error.
    return [];
  }
}

function persistSlugs(slugs: string[]): void {
  try {
    window.localStorage.setItem(PHYSICAL_PROOF_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Fail-soft, mirroring usePassport.ts: a storage failure keeps the
    // in-memory proof for this mounted session only.
  }
}

export interface PhysicalProofState {
  hasProof: (slug: string) => boolean;
  recordProof: (slug: string) => boolean;
}

// TG014 — local, device-only physical-visit proof (QR Contract v1).
// Deliberately separate from usePassport.ts: proof-of-presence (this hook)
// gates whether the dossier's final Touch to Check control is enabled;
// stamping the passport (usePassport.ts) remains a distinct, explicit user
// action. Only slugs with a registered physical-proof hash can ever be
// recorded here — an unknown or digital-only slug is silently ignored.
export function usePhysicalProof(): PhysicalProofState {
  const [proven, setProven] = useState<Set<string>>(
    () => new Set(readStoredSlugs().filter(hasPhysicalProofHash))
  );
  // Synchronous mirror, same rationale as usePassport's visitedRef: a
  // `recordProof` call immediately after mount must not race React's
  // batched commit of the previous `setProven` update.
  const provenRef = useRef(proven);
  provenRef.current = proven;

  const hasProof = useCallback((slug: string) => provenRef.current.has(slug), []);

  const recordProof = useCallback((slug: string): boolean => {
    if (!hasPhysicalProofHash(slug)) return false;
    if (provenRef.current.has(slug)) return true;
    const next = new Set(provenRef.current);
    next.add(slug);
    provenRef.current = next;
    setProven(next);
    persistSlugs([...next]);
    return true;
  }, []);

  return useMemo(() => ({ hasProof, recordProof }), [hasProof, recordProof]);
}
