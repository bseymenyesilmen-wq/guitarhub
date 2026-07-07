import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicTheory = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");
const fretboard = readFileSync(join(__dirname, "..", "app", "components", "Fretboard.tsx"), "utf8");
const scalesPage = readFileSync(join(__dirname, "..", "app", "gam-kutuphanesi", "page.tsx"), "utf8");

const required = [
  "scaleSlug",
  "ALL_GUITAR_CHORDS_SCALE_TYPES",
  "buildScaleFretboard",
  "startFret",
  "displayFrets",
  "positionStartFret",
  "selectedPosition?.label",
  "Root nota, gam türü, görünüm ve pozisyon seçerek",
  "Full",
  "selectedPosition?.label",
];

const haystack = `${musicTheory}\n${fretboard}\n${scalesPage}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing scale fretboard integration snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Scale fretboard position integration is present.");
