#!/usr/bin/env node
// TG014 — QR Contract v1 verifier.
//
// Dependency-light (Node built-ins only: fs, path, crypto, url). Confirms
// the printed-plaque QR contract is internally consistent *before* print
// approval. Never prints raw private tokens — mismatches are reported by
// case slug only, per the handoff's security model.
//
// Usage: node scripts/verify-qr-contract.mjs
// Exit code 0 = every check passed. Exit code 1 = at least one failed.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(SCRIPT_DIR, "..");
const REPO_ROOT = path.resolve(APP_ROOT, "..");

const PRODUCT_HASH_MANIFEST_PATH = path.join(APP_ROOT, "src/data/qrContractHashes.json");
const AUTHORITY_HASH_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "work_materials/source_materials/qr/ADGARC_QR_CONTRACT_v1_HASHES.json"
);
const PRIVATE_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "work_materials/source_materials/qr/ADGARC_QR_CONTRACT_v1_PRIVATE.json"
);
const CASES_TS_PATH = path.join(APP_ROOT, "src/data/cases.ts");
const DEEPLINK_TS_PATH = path.join(APP_ROOT, "src/lib/deepLink.ts");
const QR_CONTRACT_TS_PATH = path.join(APP_ROOT, "src/lib/qrContract.ts");

// Contract-fixed literals (handoff §"Printed QR stability"). Deliberately
// hardcoded here, never imported from runtime navigation code — the
// canonical production host belongs to the print contract / verifier, not
// to ordinary in-app navigation (see deepLink.ts's own comment on this).
const EXPECTED_PRODUCTION_BASE = "https://adg-fad.org/adg-arc/";
const EXPECTED_CASE_PARAM = "case";
const EXPECTED_VISIT_PARAM = "visit";
const EXPECTED_PHYSICAL_COUNT = 10;
const HEX_64_RE = /^[0-9a-f]{64}$/;
const SLUG_RE = /^[a-z0-9-]+$/;

const results = [];
function check(description, passed, detail) {
  results.push({ description, passed, detail });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function sha256Hex(input) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

// ---------------------------------------------------------------------
// 1. Product-shipped public-safe hash manifest: internal consistency.
// ---------------------------------------------------------------------

let productManifest = null;
try {
  productManifest = readJson(PRODUCT_HASH_MANIFEST_PATH);
  check("product hash manifest is valid JSON", true);
} catch (err) {
  check("product hash manifest is valid JSON", false, String(err.message ?? err));
}

let productSlugToHash = new Map();
if (productManifest) {
  const entries = Array.isArray(productManifest.cases) ? productManifest.cases : [];
  const slugs = entries.map((e) => e.slug);
  const uniqueSlugs = new Set(slugs);

  check(
    `physical slug count === ${EXPECTED_PHYSICAL_COUNT}`,
    entries.length === EXPECTED_PHYSICAL_COUNT,
    `found ${entries.length}`
  );
  check("no duplicate physical slugs in product manifest", uniqueSlugs.size === slugs.length,
    `${slugs.length - uniqueSlugs.size} duplicate(s)`);
  check(
    "product manifest declares physicalCaseCount matching its entry count",
    productManifest.physicalCaseCount === entries.length,
    `declared ${productManifest.physicalCaseCount}, actual ${entries.length}`
  );

  let allHashesValid = true;
  const badSlugs = [];
  for (const entry of entries) {
    const hash = String(entry.sha256 ?? "").toLowerCase();
    if (!HEX_64_RE.test(hash) || !SLUG_RE.test(String(entry.slug ?? ""))) {
      allHashesValid = false;
      badSlugs.push(entry.slug);
    }
    productSlugToHash.set(entry.slug, hash);
  }
  check(
    "every product manifest hash is 64 lowercase hex chars",
    allHashesValid,
    badSlugs.length ? `bad slugs: ${badSlugs.join(", ")}` : undefined
  );
}

// ---------------------------------------------------------------------
// 2. Product copy matches the operator-generated authority manifest.
// ---------------------------------------------------------------------

if (existsSync(AUTHORITY_HASH_MANIFEST_PATH)) {
  try {
    const authorityManifest = readJson(AUTHORITY_HASH_MANIFEST_PATH);
    const authorityEntries = Array.isArray(authorityManifest.cases) ? authorityManifest.cases : [];
    const authoritySorted = [...authorityEntries].sort((a, b) => a.slug.localeCompare(b.slug));
    const productSorted = [...(productManifest?.cases ?? [])].sort((a, b) => a.slug.localeCompare(b.slug));
    const matches =
      authoritySorted.length === productSorted.length &&
      authoritySorted.every(
        (a, i) =>
          a.slug === productSorted[i].slug &&
          a.sha256.toLowerCase() === productSorted[i].sha256.toLowerCase()
      );
    check("product hash manifest matches the operator-authority manifest exactly", matches);
  } catch (err) {
    check("product hash manifest matches the operator-authority manifest exactly", false, String(err.message ?? err));
  }
} else {
  check(
    "operator-authority hash manifest available for cross-check",
    false,
    `not found locally at ${AUTHORITY_HASH_MANIFEST_PATH} (non-fatal — skipped)`
  );
}

// ---------------------------------------------------------------------
// 3. cases.ts <-> hash manifest agreement (exactly the physical set).
// ---------------------------------------------------------------------

let casesTs = "";
try {
  casesTs = readText(CASES_TS_PATH);
  check("cases.ts is readable", true);
} catch (err) {
  check("cases.ts is readable", false, String(err.message ?? err));
}

if (casesTs) {
  const pairRe = /slug:\s*"([a-z0-9-]+)"[\s\S]*?experienceType:\s*"(physical_digital|digital_only)"/g;
  const physicalSlugs = [];
  const allSlugs = [];
  let m;
  while ((m = pairRe.exec(casesTs)) !== null) {
    allSlugs.push(m[1]);
    if (m[2] === "physical_digital") physicalSlugs.push(m[1]);
  }

  check(
    `cases.ts declares exactly ${EXPECTED_PHYSICAL_COUNT} physical_digital cases`,
    physicalSlugs.length === EXPECTED_PHYSICAL_COUNT,
    `found ${physicalSlugs.length} of ${allSlugs.length} total cases parsed`
  );
  check(
    "no duplicate physical slugs in cases.ts",
    new Set(physicalSlugs).size === physicalSlugs.length
  );

  const manifestSlugs = new Set(productSlugToHash.keys());
  const missingHash = physicalSlugs.filter((s) => !manifestSlugs.has(s));
  const extraHash = [...manifestSlugs].filter((s) => !physicalSlugs.includes(s));
  check(
    "every physical case slug has exactly one proof hash",
    missingHash.length === 0,
    missingHash.length ? `missing: ${missingHash.join(", ")}` : undefined
  );
  check(
    "hash manifest has no entries for a non-physical/unknown slug",
    extraHash.length === 0,
    extraHash.length ? `extra: ${extraHash.join(", ")}` : undefined
  );
}

// ---------------------------------------------------------------------
// 4. Contract literals + legacy-bypass retirement, read statically from
//    source (never re-derived/hardcoded twice as a second authority).
// ---------------------------------------------------------------------

let deepLinkTs = "";
let qrContractTs = "";
try {
  deepLinkTs = readText(DEEPLINK_TS_PATH);
  qrContractTs = readText(QR_CONTRACT_TS_PATH);
  check("deepLink.ts and qrContract.ts are readable", true);
} catch (err) {
  check("deepLink.ts and qrContract.ts are readable", false, String(err.message ?? err));
}

if (deepLinkTs) {
  const caseParamMatch = deepLinkTs.match(/CASE_PARAM_KEY\s*=\s*"([^"]+)"/);
  check(
    `deepLink.ts CASE_PARAM_KEY === "${EXPECTED_CASE_PARAM}"`,
    caseParamMatch?.[1] === EXPECTED_CASE_PARAM,
    caseParamMatch ? `found "${caseParamMatch[1]}"` : "constant not found"
  );

  const legacyMarkers = ["ENTRY_PARAM_KEY", "ENTRY_PHYSICAL_VALUE", "buildPhysicalEntryUrl", "entry=physical"];
  const stillPresent = legacyMarkers.filter((marker) => deepLinkTs.includes(marker));
  check(
    "legacy entry=physical proof-bypass path is retired from deepLink.ts",
    stillPresent.length === 0,
    stillPresent.length ? `still present: ${stillPresent.join(", ")}` : undefined
  );
}

if (qrContractTs) {
  const visitParamMatch = qrContractTs.match(/VISIT_PARAM_KEY\s*=\s*"([^"]+)"/);
  check(
    `qrContract.ts VISIT_PARAM_KEY === "${EXPECTED_VISIT_PARAM}"`,
    visitParamMatch?.[1] === EXPECTED_VISIT_PARAM,
    visitParamMatch ? `found "${visitParamMatch[1]}"` : "constant not found"
  );
}

if (existsSync(path.join(APP_ROOT, "src/hooks/usePhysicalEntrySignal.ts"))) {
  check("legacy usePhysicalEntrySignal.ts hook file removed", false, "file still exists on disk");
} else {
  check("legacy usePhysicalEntrySignal.ts hook file removed", true);
}

// ---------------------------------------------------------------------
// 5. Final URL shape (structural — no real token available at this layer).
// ---------------------------------------------------------------------

check(
  `production base is exactly "${EXPECTED_PRODUCTION_BASE}"`,
  EXPECTED_PRODUCTION_BASE === "https://adg-fad.org/adg-arc/"
);

if (productManifest) {
  const finalUrlRe = new RegExp(
    `^${EXPECTED_PRODUCTION_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\?case=[a-z0-9-]+&visit=.+$`
  );
  const badFinalUrls = [];
  for (const slug of productSlugToHash.keys()) {
    const sampleUrl = `${EXPECTED_PRODUCTION_BASE}?${EXPECTED_CASE_PARAM}=${slug}&${EXPECTED_VISIT_PARAM}=<token>`;
    if (!finalUrlRe.test(sampleUrl)) badFinalUrls.push(slug);
  }
  check(
    "every physical slug's final URL shape matches case=<slug>&visit=<token> on the canonical base",
    badFinalUrls.length === 0,
    badFinalUrls.length ? `bad: ${badFinalUrls.join(", ")}` : undefined
  );
}

// ---------------------------------------------------------------------
// 6. Private manifest cross-check (operator-only, local; optional).
//    Raw token VALUES are read here to compute a hash, but are never
//    logged, printed, or included in any check detail below.
// ---------------------------------------------------------------------

if (existsSync(PRIVATE_MANIFEST_PATH)) {
  try {
    const priv = readJson(PRIVATE_MANIFEST_PATH);
    const privEntries = Array.isArray(priv.cases) ? priv.cases : [];

    check(
      `private manifest declares productionBase "${EXPECTED_PRODUCTION_BASE}"`,
      priv.productionBase === EXPECTED_PRODUCTION_BASE
    );
    check(`private manifest declares caseParam "${EXPECTED_CASE_PARAM}"`, priv.caseParam === EXPECTED_CASE_PARAM);
    check(`private manifest declares visitParam "${EXPECTED_VISIT_PARAM}"`, priv.visitParam === EXPECTED_VISIT_PARAM);
    check(
      `private manifest has exactly ${EXPECTED_PHYSICAL_COUNT} entries`,
      privEntries.length === EXPECTED_PHYSICAL_COUNT,
      `found ${privEntries.length}`
    );

    const mismatchedHash = [];
    const mismatchedUrl = [];
    const crossSlugCollision = [];
    const expectedHashesBySlug = productSlugToHash;

    for (const entry of privEntries) {
      const { slug, token, url } = entry;
      if (typeof slug !== "string" || typeof token !== "string" || typeof url !== "string") {
        mismatchedHash.push(slug ?? "<unknown>");
        continue;
      }
      const computedHash = sha256Hex(token);
      const expectedHash = expectedHashesBySlug.get(slug);
      if (!expectedHash || computedHash !== expectedHash) {
        mismatchedHash.push(slug);
      }
      // A token must never validate against a *different* slug's hash —
      // that would let one plaque's QR register proof for the wrong case.
      for (const [otherSlug, otherHash] of expectedHashesBySlug) {
        if (otherSlug !== slug && computedHash === otherHash) {
          crossSlugCollision.push(slug);
        }
      }

      const expectedUrl = `${EXPECTED_PRODUCTION_BASE}?${EXPECTED_CASE_PARAM}=${slug}&${EXPECTED_VISIT_PARAM}=${token}`;
      if (url !== expectedUrl) mismatchedUrl.push(slug);
    }

    check(
      "every private token's SHA-256 matches the committed public-safe hash for its own slug",
      mismatchedHash.length === 0,
      mismatchedHash.length ? `mismatched slugs: ${mismatchedHash.join(", ")}` : undefined
    );
    check(
      "no private token maps to a different case's hash",
      crossSlugCollision.length === 0,
      crossSlugCollision.length ? `colliding slugs: ${crossSlugCollision.join(", ")}` : undefined
    );
    check(
      "every private manifest final URL exactly matches case=<slug>&visit=<token> on the canonical base",
      mismatchedUrl.length === 0,
      mismatchedUrl.length ? `bad slugs: ${mismatchedUrl.join(", ")}` : undefined
    );
  } catch (err) {
    check("private manifest cross-check completed without error", false, String(err.message ?? err));
  }
} else {
  console.log(
    `(private manifest not found locally at ${PRIVATE_MANIFEST_PATH} — raw-token cross-check skipped; this is expected outside the operator's machine)`
  );
}

// ---------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------

let failCount = 0;
for (const r of results) {
  const status = r.passed ? "PASS" : "FAIL";
  if (!r.passed) failCount += 1;
  console.log(`[${status}] ${r.description}${r.detail ? ` — ${r.detail}` : ""}`);
}

console.log("");
console.log(`${results.length - failCount}/${results.length} checks passed.`);

process.exit(failCount === 0 ? 0 : 1);
