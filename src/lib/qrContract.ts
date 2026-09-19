import qrContractHashes from "../data/qrContractHashes.json";

// TG014 — QR Contract v1: single canonical authority for the printed-plaque
// physical-visit proof. Runtime product source holds only SHA-256 hashes of
// the private per-case tokens (never the raw tokens themselves — those are
// print-production material kept outside this subtree, see
// work_materials/source_materials/qr/ADGARC_QR_CONTRACT_v1_PRIVATE.json).
// This module supersedes the retired legacy physical-entry query signal
// (TG010): that path granted physical-visit state from a fixed, guessable
// query value with no proof at all, which the v1 contract will not permit
// to keep working.

// Canonical query-param key for the physical-visit proof token, additive to
// deepLink.ts's own CASE_PARAM_KEY ("case") — a printed plaque URL is
// `?case=<slug>&visit=<token>`, never a second/duplicate param name.
export const VISIT_PARAM_KEY = "visit";

// Versioned localStorage namespace for locally persisted physical-visit
// proof, parallel to usePassport.ts's own "adgarc.passport.v1" key — a
// distinct key because proof-of-presence and passport-stamp state are
// related but not the same fact (opening != visiting != stamping).
export const PHYSICAL_PROOF_STORAGE_KEY = "adgarc.physicalProof.v1";

const HEX_64_RE = /^[0-9a-f]{64}$/;

// Derived once from the shipped public-safe manifest (its own JSON-inferred
// shape — never a second, hand-maintained slug->hash map or a redeclared
// type that could silently drift from the actual file).
const PHYSICAL_PROOF_HASHES: ReadonlyMap<string, string> = new Map(
  qrContractHashes.cases.map((entry) => [entry.slug, entry.sha256.toLowerCase()])
);

export function hasPhysicalProofHash(slug: string): boolean {
  return PHYSICAL_PROOF_HASHES.has(slug);
}

async function sha256Hex(input: string): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Validates a raw `visit` token against the exact case slug it was scanned
// for. Fails closed (returns false) on: no Web Crypto available, the slug
// has no registered physical-proof hash, a malformed/empty token, or a
// hash mismatch. Never throws — every failure path is a plain `false`.
export async function validatePhysicalProofToken(slug: string, token: string): Promise<boolean> {
  if (!slug || !token) return false;
  const expected = PHYSICAL_PROOF_HASHES.get(slug);
  if (!expected || !HEX_64_RE.test(expected)) return false;

  try {
    const digest = await sha256Hex(token);
    if (!digest) return false;
    return digest === expected;
  } catch {
    return false;
  }
}
