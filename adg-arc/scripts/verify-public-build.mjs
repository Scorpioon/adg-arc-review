import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PRODUCT_ROOT = path.resolve(SCRIPT_DIR, "..");
const DIST_ROOT = path.join(PRODUCT_ROOT, "dist");

const FORBIDDEN_PATH_FRAGMENTS = [
  "_wrkops",
  "work_materials",
  ".claude",
  "claude.md",
  "_private",
];

const FORBIDDEN_DEVTOOLS_JS_MARKERS = [
  "isContentEditable",
];

// ADGARC-FB-125 (TG051, amendment ADGARC-TG051-FB125-PUBLIC-DEVTOOLS-SCOPE-
// AMENDMENT-20261020-v1): every check above is satisfied by a PUBLIC bundle
// that still *ships* the DevTools pane. The 2026-10-20 forensic pass found
// `assets/DevTools-<hash>.js` and one dynamic-import edge from the entry
// chunk in a build this script had already passed, because a marker scan
// answers "does any chunk look like DevTools inside" and never "was a
// DevTools chunk emitted at all". These two patterns add that missing
// physical-absence assertion, alongside the existing checks rather than in
// place of any of them.
//
// Both require the emitted *asset filename* shape, so a `"devtools"`
// navigation id or a `nav.devtools` i18n label — neither of which says
// anything about module exposure — can never trip them. Case-sensitive
// `DevTools`, the component module's own name: the lowercase build-time gate
// module `src/config/devtools.ts` holds two constants and no debug UI, and a
// chunk named after it would be neither the pane nor a leak.
const DEVTOOLS_CHUNK_NAME = /^DevTools(-[A-Za-z0-9_$-]+)?\.m?js$/;
const DEVTOOLS_CHUNK_REFERENCE = /DevTools(-[A-Za-z0-9_$-]+)?\.m?js/;

function walkFiles(root) {
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  return out;
}

if (!fs.existsSync(DIST_ROOT) || !fs.statSync(DIST_ROOT).isDirectory()) {
  console.error(`verify-public-build: FAILED — dist directory missing: ${DIST_ROOT}`);
  process.exit(1);
}

const violations = [];
for (const file of walkFiles(DIST_ROOT)) {
  const relative = path.relative(DIST_ROOT, file).split(path.sep).join("/");
  const lower = relative.toLowerCase();

  for (const fragment of FORBIDDEN_PATH_FRAGMENTS) {
    if (lower.includes(fragment.toLowerCase())) {
      violations.push(`${relative}: forbidden public path fragment "${fragment}"`);
    }
  }

  if (lower.endsWith(".map")) {
    violations.push(`${relative}: source-map/debug artifact is forbidden`);
  }

  // ADGARC-FB-125: the DevTools pane's own emitted chunk, under any
  // directory — matched on the basename, since Vite's asset directory is
  // configurable and the leak is the chunk, not where it was written.
  if (DEVTOOLS_CHUNK_NAME.test(relative.slice(relative.lastIndexOf("/") + 1))) {
    violations.push(
      `${relative}: DevTools JS chunk must not be emitted in the PUBLIC build` +
        ` — gate the lazy import expression itself, do not delete the file after building`
    );
  }

  const ext = path.extname(file).toLowerCase();
  if (ext === ".js" || ext === ".mjs") {
    const content = fs.readFileSync(file, "utf8");
    for (const marker of FORBIDDEN_DEVTOOLS_JS_MARKERS) {
      if (content.includes(marker)) {
        violations.push(`${relative}: forbidden DevTools JS marker "${marker}"`);
      }
    }

    // ADGARC-FB-125: a surviving import edge is a violation in its own
    // right, whether or not the chunk it names is still on disk — which is
    // exactly what makes a post-build `rm` unable to forge a PASS. Only the
    // matched asset name is reported; no JavaScript content is printed.
    const reference = DEVTOOLS_CHUNK_REFERENCE.exec(content);
    if (reference !== null) {
      violations.push(
        `${relative}: reference to DevTools chunk "${reference[0]}" must not survive in the PUBLIC build`
      );
    }
  }
}

if (violations.length > 0) {
  console.error(`verify-public-build: FAILED — ${violations.length} violation(s) in ${DIST_ROOT}`);
  for (const violation of violations) console.error(`  - ${violation}`);
  process.exit(1);
}

console.log(`verify-public-build: PASS — ${DIST_ROOT}`);
console.log("  forbidden private/governance paths: absent");
console.log("  source maps: absent");
console.log("  DevTools-gated JS marker isContentEditable: absent");
console.log("  emitted DevTools JS chunks: absent");
console.log("  references to DevTools chunks in emitted JS/MJS: absent");
