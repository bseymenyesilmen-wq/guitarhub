import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const music = readFileSync(join(root, "lib", "music.ts"), "utf8");
const sarkiAra = readFileSync(join(root, "app", "sarki-ara", "page.tsx"), "utf8");
const sarkiDetay = readFileSync(join(root, "app", "sarki", "[id]", "page.tsx"), "utf8");

const required = [
  [music, "export function transposeCapo"],
  [music, "((originalCapo - steps) % 12 + 12) % 12"],
  [music, "transposeCapo(0, 1)"],
  [music, "return \"11\""],
  [sarkiAra, "transposeCapo(result.capo, transposeSteps)"],
  [sarkiAra, "capo: transposedCapo"],
  [sarkiDetay, "transposeCapo(song?.capo, shift)"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing Repertuarım-style capo transpose snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Capo transpose uses Repertuarım-style 12-step wraparound.");
