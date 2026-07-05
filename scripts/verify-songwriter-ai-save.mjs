import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const writer = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");
const api = readFileSync(join(__dirname, "..", "app", "api", "songwriter", "assist", "route.ts"), "utf8");
const repertuar = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");

const required = [
  "Repertuvara Kaydet",
  "saveToRepertuar",
  "GUITARHUB_OWN_SONG",
  "artist: \"Kendi Şarkım\"",
  "router.push(`/sarki/${created.id}`)",
  "Öneri tipi",
  "SUGGESTION_TYPES",
  "Devamını yaz",
  "Sadece söz öner",
  "Sadece akor öner",
  "Sözleri parlat",
  "Daha hüzünlü yap",
  "suggestionType",
  "suggestionTypeLabel",
  "getSystemSuggestion",
  "Öneriyi uygula",
  "applySuggestion",
  "/api/songwriter/assist",
  "suggestedChords",
  "suggestedLyrics",
  "mood",
  "HermesSongwriterResponse",
  "Şarkı sözü ve akor önerisi üret",
  "Kendi Şarkıların",
  "ownSongs",
  "notes", 
];

const haystack = `${writer}\n${api}\n${repertuar}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing songwriter AI/save snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter AI suggestions and own-song save are wired.");
