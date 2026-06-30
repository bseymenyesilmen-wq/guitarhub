import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicTheory = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");
const fretboard = readFileSync(join(__dirname, "..", "app", "components", "Fretboard.tsx"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "gam-kutuphanesi", "page.tsx"), "utf8");
const haystack = `${musicTheory}\n${fretboard}\n${page}`;

const required = [
  "export type ScaleViewMode",
  "getScalePositions",
  "positionIndex",
  "viewMode",
  "Vertical",
  "Diagonal",
  "1. Pozisyon",
  "overflow-hidden",
  "minmax(0, 1fr)",
  "text-white",
  "showGhostNotes",
  "diagonalWindow",
];

const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing scale position/mode snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

if (fretboard.includes("overflow-x-auto") || fretboard.includes("min-w-[980px]")) {
  console.error("Fretboard still uses horizontal scrolling/min-width layout.");
  process.exit(1);
}

console.log("Scale vertical/diagonal compact position modes are present.");
