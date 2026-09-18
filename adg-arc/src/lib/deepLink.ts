import { cases, type CaseRecord } from "../data/cases";
import { PRODUCT_VERSION } from "../config/devtools";

// TG006H Scope E: single canonical query-param key for case selection/deep
// linking. Re-exported here (not duplicated) so useCaseParam.ts and this
// module's URL builders always agree on the same literal.
export const CASE_PARAM_KEY = "case";

// TG006H Scope A/E: the single build-time base-path authority is
// vite.config.ts's `base` (sourced from the VITE_BASE env var, default "/");
// at runtime that same value is exposed as `import.meta.env.BASE_URL`
// (e.g. "/" locally, "/<repo>/" under GitHub project Pages). Every URL this
// module builds resolves against that one value — never a second,
// hand-maintained repo-name constant.
export function resolveBaseUrl(origin: string = window.location.origin): string {
  return new URL(import.meta.env.BASE_URL, origin).toString();
}

// Canonical deep-link helper (handoff Scope E): absolute, base-aware,
// `?case=<slug>` URL for a given case slug. Uses the URL/URLSearchParams
// APIs for encoding and adds no tracking params.
export function buildCaseDeepLink(slug: string, origin: string = window.location.origin): string {
  const url = new URL(import.meta.env.BASE_URL, origin);
  url.searchParams.set(CASE_PARAM_KEY, slug);
  return url.toString();
}

const QR_DEBUG_SCHEMA = "adgarc.qrDebugManifest.v1";

export interface QrDebugManifestEntry {
  slug: string;
  title: string;
  caseUrl: string;
}

export interface QrDebugManifest {
  schema: typeof QR_DEBUG_SCHEMA;
  productVersion: string;
  baseUrl: string;
  entries: QrDebugManifestEntry[];
}

// TG014 (QR Contract v1): debug-only listing of the physical-set case deep
// links, for DevTools' operator-facing QR review pane. Derived directly
// from the canonical case dataset and its `experienceType` classification —
// never a second, manually maintained slug list. Never includes a `visit=`
// token: runtime product source holds only SHA-256 proof hashes (see
// ../lib/qrContract.ts), never the raw per-case tokens needed to construct a
// working printed-plaque URL — those stay in the operator-only private
// manifest outside this subtree. Supersedes the retired TG010
// `buildPhysicalEntryManifest` / legacy physical-entry query signal pair,
// which emitted a working proof-bypass URL with no validation at all.
export function buildQrDebugManifest(
  source: CaseRecord[] = cases,
  origin: string = window.location.origin
): QrDebugManifest {
  return {
    schema: QR_DEBUG_SCHEMA,
    productVersion: PRODUCT_VERSION,
    baseUrl: resolveBaseUrl(origin),
    entries: source
      .filter((c) => c.experienceType === "physical_digital")
      .map((c) => ({
        slug: c.slug,
        title: c.identity.name,
        caseUrl: buildCaseDeepLink(c.slug, origin),
      })),
  };
}
