import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "gam-kutuphanesi", "page.tsx"), "utf8");
const fretboard = readFileSync(join(__dirname, "..", "app", "components", "Fretboard.tsx"), "utf8");
const theory = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");
const haystack = `${page}\n${fretboard}\n${theory}`;

const required = [
  'max-h-[520px]',
  'overflow-y-auto',
  'setViewMode("vertical")',
  'const displayFrets = 21',
  'positionStartFret',
  'positionEndFret',
  'getStringFretRange',
  'COMMON_SCALE_POSITION_INTERVALS',
  'index === 0 ? rootOnLowE : startFret',
  'rootOnLowE = getLowERootFret(root)',
  'C Minor Pentatonic: 1. pozisyon 8. perde',
];
const forbidden = [
  'Fretboard yönü',
  'FretboardOrientation',
  'orientation=',
  'disabled={viewMode === "full"}',
  'const fretboardStart = viewMode === "full" ? 0',
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => haystack.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Forbidden snippets still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Scale UX and verified position behavior are present.");
