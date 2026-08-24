#!/usr/bin/env node
/**
 * Performance budgets.
 *
 * Run after `next build`. Exits non-zero when a budget is exceeded, so CI
 * fails on a regression rather than letting the bundle creep upward release
 * by release.
 *
 *   node tests/scripts/check-budgets.mjs
 *
 * Budgets are deliberately set a little above today's measurements: tight
 * enough to catch a real regression, loose enough not to trip on noise.
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";

const BUDGETS = {
  /** Total client JS shipped from .next/static/chunks. */
  totalClientJsKb: 1400,
  /** Any single chunk — a spike here usually means an accidental import. */
  largestChunkKb: 320,
  /** Any single file in public/. */
  largestImageKb: 250,
  /** Total weight of public/. */
  totalPublicKb: 600,
  /** Self-hosted font files. */
  largestFontKb: 90,
};

const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;

function walk(dir, filter = () => true) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path, filter));
    else if (filter(path)) out.push({ path, size: statSync(path).size });
  }
  return out;
}

const failures = [];
const notes = [];

function check(label, actual, budget, unit = "KB") {
  const status = actual > budget ? "FAIL" : "ok";
  const line = `  ${status === "ok" ? "✓" : "✗"} ${label.padEnd(34)} ${String(actual).padStart(8)} / ${budget} ${unit}`;
  if (status === "FAIL") failures.push(`${label}: ${actual}${unit} exceeds budget of ${budget}${unit}`);
  notes.push(line);
}

// ---------------------------------------------------------------- bundle size
const chunkDir = ".next/static/chunks";
if (!existsSync(chunkDir)) {
  console.error("No build output found. Run `npm run build` first.");
  process.exit(1);
}

const chunks = walk(chunkDir, (p) => extname(p) === ".js");
const totalJs = kb(chunks.reduce((sum, c) => sum + c.size, 0));
const largest = chunks.sort((a, b) => b.size - a.size)[0];

console.log("Bundle");
check("total client JS", totalJs, BUDGETS.totalClientJsKb);
check("largest single chunk", kb(largest?.size ?? 0), BUDGETS.largestChunkKb);
console.log(notes.splice(0).join("\n"));

// -------------------------------------------------------------------- images
const assets = walk("public");
const images = assets.filter((a) => /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(a.path));
const biggestImage = images.sort((a, b) => b.size - a.size)[0];

console.log("\nStatic assets");
check("largest image", kb(biggestImage?.size ?? 0), BUDGETS.largestImageKb);
check("total public/", kb(assets.reduce((s, a) => s + a.size, 0)), BUDGETS.totalPublicKb);
console.log(notes.splice(0).join("\n"));

if (biggestImage) {
  console.log(`    largest: ${biggestImage.path} (${kb(biggestImage.size)} KB)`);
}

// --------------------------------------------------------------------- fonts
const fonts = walk("src/fonts", (p) => /\.(woff2?|ttf|otf)$/i.test(p));
const biggestFont = fonts.sort((a, b) => b.size - a.size)[0];

console.log("\nFonts");
check("largest font file", kb(biggestFont?.size ?? 0), BUDGETS.largestFontKb);
console.log(notes.splice(0).join("\n"));

const nonWoff2 = fonts.filter((f) => !f.path.endsWith(".woff2"));
if (nonWoff2.length) {
  failures.push(`fonts not served as woff2: ${nonWoff2.map((f) => f.path).join(", ")}`);
}

// ------------------------------------------------------- duplicate dependencies
console.log("\nDuplicate dependencies");
try {
  const raw = execSync("npm ls --all --json --omit=dev", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const versions = new Map();

  (function collect(node) {
    for (const [name, dep] of Object.entries(node.dependencies ?? {})) {
      if (dep.version) {
        if (!versions.has(name)) versions.set(name, new Set());
        versions.get(name).add(dep.version);
      }
      collect(dep);
    }
  })(JSON.parse(raw));

  const duplicates = [...versions.entries()].filter(([, v]) => v.size > 1);
  if (duplicates.length === 0) {
    console.log("  ✓ no package resolved to multiple versions in the production tree");
  } else {
    for (const [name, v] of duplicates) {
      console.log(`  ✗ ${name}: ${[...v].join(", ")}`);
    }
    failures.push(`${duplicates.length} package(s) resolved to multiple versions: ${duplicates.map(([n]) => n).join(", ")}`);
  }
} catch {
  console.log("  ! could not read the dependency tree (skipped)");
}

// -------------------------------------------------------------------- verdict
console.log("");
if (failures.length) {
  console.error("Performance budgets exceeded:\n" + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log("All performance budgets met.");
