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

  const ext = path.extname(file).toLowerCase();
  if (ext === ".js" || ext === ".mjs") {
    const content = fs.readFileSync(file, "utf8");
    for (const marker of FORBIDDEN_DEVTOOLS_JS_MARKERS) {
      if (content.includes(marker)) {
        violations.push(`${relative}: forbidden DevTools JS marker "${marker}"`);
      }
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
