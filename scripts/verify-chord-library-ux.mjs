import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "..", "app", "akor-kutuphanesi", "page.tsx"), "utf8");

const required = [
  "FLAT_NOTE_MAP",
  "...NOTE_NAMES.map((note) =>",
  "flatLabel",
  "normalizeChordSearch",
  "FAVORITE_CHORDS_KEY",
  "Çalışılacak akorlar",
  "toggleFavorite",
];

const missing = required.filter((snippet) => !source.includes(snippet));
if (missing.length) {
  console.error(`Missing flat-note/search/favorite UI snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Flat note labels, smart search, and chord favorites are present.");
