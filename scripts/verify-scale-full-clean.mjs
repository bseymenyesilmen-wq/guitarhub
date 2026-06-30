import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "gam-kutuphanesi", "page.tsx"), "utf8");
const fretboard = readFileSync(join(__dirname, "..", "app", "components", "Fretboard.tsx"), "utf8");
const haystack = `${page}\n${fretboard}`;

const required = [
  'description: "0-21 gerçek gitar klavyesi"',
  'const displayFrets = 21',
  '0-21 perde sabit kalır',
  'positionStartFret',
  'positionEndFret',
  'bg-[#333]',
  'bg-[#ffc107]',
  'bg-[#ff8300]',
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing full clean scale snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const forbidden = [
  'const showGhostNotes = viewMode === "full"',
  'showGhostNotes ?',
  '>{note.note}</span>',
  '0-12 arası genel harita',
  'bg-gradient-to-r from-amber-900/50',
  'border-l-2 border-amber-100/40',
];
const bad = forbidden.filter((snippet) => haystack.includes(snippet));
if (bad.length) {
  console.error(`Forbidden noisy fretboard snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Full 0-21 clean scale-only fretboard behavior is present.");
