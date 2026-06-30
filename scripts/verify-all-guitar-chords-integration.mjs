import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicTheory = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");
const agcData = readFileSync(join(__dirname, "..", "lib", "all-guitar-chords-data.ts"), "utf8");

const requiredMusicTheorySnippets = [
  'import { ALL_GUITAR_CHORD_POSITIONS } from "@/lib/all-guitar-chords-data";',
  'const sitePositions = ALL_GUITAR_CHORD_POSITIONS[name];',
  'positions: sitePositions ?? positions.slice(0, 5)',
  '"11", "13"',
];
const requiredDataSnippets = [
  'export const ALL_GUITAR_CHORD_POSITIONS',
  '"A7": [',
  '"Aadd9": [',
  'All-Guitar-Chords Varyasyon 1',
  'Çal:',
];

const missing = [
  ...requiredMusicTheorySnippets.filter((snippet) => !musicTheory.includes(snippet)),
  ...requiredDataSnippets.filter((snippet) => !agcData.includes(snippet)),
];

if (missing.length) {
  console.error(`Missing All-Guitar-Chords integration snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("All-Guitar-Chords integration is present.");
