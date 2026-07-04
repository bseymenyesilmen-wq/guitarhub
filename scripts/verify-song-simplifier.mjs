import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const music = readFileSync(join(__dirname, "..", "lib", "music.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8");

const required = [
  "export type SimplifiedSongOption",
  "export function findSimplifiedSongOption",
  "scoreChordDifficulty",
  "easyChordCount",
  "hardChords",
  "transposeCapo(capo, steps)",
  "findSimplifiedSongOption(sourceText, song?.capo)",
  "Kapo Sihirbazı",
  "Kolaylaştır",
  "setShift(simplifiedOption.steps)",
  "Önerilen ton",
  "Kolay akor",
  "Zor akor",
];

const missing = required.filter((snippet) => !`${music}\n${page}`.includes(snippet));
if (missing.length) {
  console.error(`Missing capo wizard snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Song simplifier capo wizard is wired.");
