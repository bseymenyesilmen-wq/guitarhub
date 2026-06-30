import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicTheory = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");
const diagram = readFileSync(join(__dirname, "..", "app", "components", "ChordDiagram.tsx"), "utf8");

const required = [
  "function sortByUsage",
  "function usageScore",
  "position.hint &&",
  "hint: \"\"",
];

const missing = required.filter((snippet) => !(musicTheory.includes(snippet) || diagram.includes(snippet)));
if (missing.length) {
  console.error(`Missing chord usage sorting / hidden hint snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Chord usage sorting and hidden AGC hint behavior are present.");
