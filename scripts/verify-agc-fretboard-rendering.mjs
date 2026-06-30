import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "gam-kutuphanesi", "page.tsx"), "utf8");
const fretboard = readFileSync(join(__dirname, "..", "app", "components", "Fretboard.tsx"), "utf8");
const haystack = `${page}\n${fretboard}`;

const required = [
  'type FretboardOrientation = "horizontal" | "vertical"',
  'const FRET_MARKS = new Set([3, 5, 7, 9, 15, 17, 19, 21])',
  'const DOUBLE_FRET_MARKS = new Set([12])',
  'agcRootNote',
  'agcScaleNote',
  'bg-[#333]',
  'bg-[#ffc107]',
  'bg-[#ff8300]',
  'Fretboard yönü',
  'Horizontal',
  'orientation === "vertical"',
  'data-agc-fretboard',
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing All-Guitar-Chords fretboard snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("All-Guitar-Chords-like fretboard rendering hooks are present.");
