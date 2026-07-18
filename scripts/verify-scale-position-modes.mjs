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
  "label: `${index + 1}. Pozisyon`",
  "minmax(0, 1fr)",
  "text-white",
  "diagonalWindow",
  "isInsideSelectedPosition",
  "ring-1 ring-inset ring-red-500/25",
  "const displayFrets = 21",
  "const fretboardStartFret = 0",
];

const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing scale position/mode snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Scale position modes now highlight inside the full 0-21 fretboard.");
