import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");

const required = [
  "CAGED_SHAPES",
  "transposeCagedShape",
  "validateChordPosition",
  "function cagedPositions",
  "if (quality === \"power5\") return powerChordPositions(root);",
  "return cagedPositions(root, quality);",
];

const missing = required.filter((snippet) => !source.includes(snippet));
if (missing.length) {
  console.error(`Missing CAGED chord generation snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("CAGED chord generation is present.");
