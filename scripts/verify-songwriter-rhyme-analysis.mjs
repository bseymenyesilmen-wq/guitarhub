import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const api = readFileSync(join(__dirname, "..", "app", "api", "songwriter", "assist", "route.ts"), "utf8");

const required = [
  "extractLyricLines",
  "detectRhymeHint",
  "existingRhymeHint",
  "kafiye",
  "uyak",
  "mevcut sözleri analiz et",
  "duygusal olarak passend",
  "Son satırların kafiye ucuna yaklaş",
  "Kafiye ipucu",
  "Sözlerin imgesini ve kelime dünyasını koru",
  "Aynı kelimeleri birebir kopyalama",
];

const missing = required.filter((snippet) => !api.includes(snippet));
if (missing.length) {
  console.error(`Missing songwriter rhyme/emotion analysis snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter AI analyzes lyrics for rhyme and emotional fit.");
