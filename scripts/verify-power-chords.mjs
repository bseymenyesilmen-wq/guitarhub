import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");

const required = [
  'power5: { label: "5"',
  'const POWER_CHORDS = NOTE_NAMES.map((root) =>',
  'buildChord(`${root}5`, root, "power5", "5 / Power Chord")',
  '...CORE_CHORDS, ...POWER_CHORDS, ...SLASH_CHORDS',
];

const missing = required.filter((snippet) => !source.includes(snippet));
if (missing.length) {
  console.error(`Missing power chord implementation snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Power chord implementation is present.");
