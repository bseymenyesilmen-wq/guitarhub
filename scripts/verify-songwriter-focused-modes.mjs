import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const writer = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");
const api = readFileSync(join(__dirname, "..", "app", "api", "songwriter", "assist", "route.ts"), "utf8");

const required = [
  "lyrics-only",
  "Sadece söz öner",
  "chords-only",
  "Sadece akor öner",
  "polish-lyrics",
  "Sözleri parlat",
  "Eğer öneri tipi \"Sadece söz öner\"",
  "Eğer öneri tipi \"Sadece akor öner\"",
  "Eğer öneri tipi \"Sözleri parlat\"",
  "Sadece istenen alanı güçlendir",
];

const haystack = `${writer}\n${api}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing songwriter focused suggestion snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter focused suggestion modes are wired.");
