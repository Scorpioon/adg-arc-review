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

const PHYSICAL_ENTRY_SCHEMA = "adgarc.physicalEntry.v1";

export interface PhysicalEntryManifestEntry {
  slug: string;
  title: string;
  url: string;
}

export interface PhysicalEntryManifest {
  schema: typeof PHYSICAL_ENTRY_SCHEMA;
  productVersion: string;
  baseUrl: string;
  entries: PhysicalEntryManifestEntry[];
}

// Physical-entry manifest (handoff Scope F): derived directly from the
// canonical case dataset and its `experienceType` classification — never a
// second, manually maintained slug list. No QR image generation here.
export function buildPhysicalEntryManifest(
  source: CaseRecord[] = cases,
  origin: string = window.location.origin
): PhysicalEntryManifest {
  return {
    schema: PHYSICAL_ENTRY_SCHEMA,
    productVersion: PRODUCT_VERSION,
    baseUrl: resolveBaseUrl(origin),
    entries: source
      .filter((c) => c.experienceType === "physical_digital")
      .map((c) => ({
        slug: c.slug,
        title: c.identity.name,
        url: buildCaseDeepLink(c.slug, origin),
      })),
  };
}
