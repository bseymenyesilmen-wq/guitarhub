import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicTheory = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");
const scaleData = readFileSync(join(__dirname, "..", "lib", "all-guitar-scales-data.ts"), "utf8");

const required = [
  'import { ALL_GUITAR_SCALES } from "@/lib/all-guitar-scales-data"',
  "export const ALL_GUITAR_CHORDS_SCALE_TYPES = ALL_GUITAR_SCALES",
  'category: "Common"',
  'category: "Rare"',
  'category: "Exotic"',
  'Pentatonic Neutral',
  'Diminished Whole Tone',
  'Ethiopian (A raray)',
  'Overtone Dominant',
  'Roumanian Minor',
  'Hungarian Gypsy',
  'Persian',
  'Mixo-Blues',
  'scrapedFrom: "all-guitar-chords.com/scales"',
];

const missing = required.filter((snippet) => !musicTheory.includes(snippet) && !scaleData.includes(snippet));
if (missing.length) {
  console.error(`Missing All-Guitar-Chords scale snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const data = scaleData;
const count = (data.match(/scaleSlug:/g) || []).length;
if (count < 90) {
  console.error(`Expected at least 90 All-Guitar-Chords scales, got ${count}`);
  process.exit(1);
}

console.log(`All-Guitar-Chords scales are integrated (${count} scales).`);
