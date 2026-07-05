import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const writer = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");
const api = readFileSync(join(__dirname, "..", "app", "api", "songwriter", "assist", "route.ts"), "utf8");

const required = [
  "MOOD_OPTIONS",
  "Duygu",
  "moodPreset",
  "Hüzünlü",
  "Mutlu",
  "Romantik",
  "Öfkeli",
  "Umutlu",
  "Karanlık",
  "Arabesk",
  "Rock",
  "Pop",
  "Lo-fi",
  "Başka öneri üret",
  "Seçilen duygu",
  "moodPresetLabel",
  "Duygu seçimi",
  "Bu duyguya göre söz ve akor öner",
];

const haystack = `${writer}\n${api}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing songwriter mood/regenerate snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter mood presets and regeneration are wired.");
