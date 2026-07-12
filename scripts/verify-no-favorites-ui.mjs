import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const home = read("app", "page.tsx");
const search = read("app", "sarki-ara", "page.tsx");
const detail = read("app", "sarki", "[id]", "page.tsx");
const chords = read("app", "akor-kutuphanesi", "page.tsx");

const required = [
  [home, "function SongRow({ song, onRemove }", "home removable song rows"],
  [home, "repertuvardan kaldırılsın mı", "home remove confirmation"],
  [home, "Kaldır", "home remove button"],
  [home, "Bugün Çalış", "home replacement for favorites"],
  [home, "Tuner ile akort et", "practice card tuner action"],
  [search, "Repertuvara Ekle", "search keeps repertoire add"],
  [detail, "Çalma Modu", "detail keeps play mode"],
];
const forbidden = [
  [home, "Favori", "home favorite copy"],
  [search, "Favorilere Ekle", "search favorite add button"],
  [search, "Favoride", "search favorited state"],
  [detail, "Favorile", "detail favorite button"],
  [detail, "Favoride", "detail favorited state"],
  [chords, "★", "chord star favorites"],
  [chords, "☆", "chord star add"],
  [chords, "favoriteChords", "chord favorite storage"],
  [chords, "Çalışılacak akorlar", "chord favorite strip"],
];
const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
const oldPageExists = existsSync(join(root, "app", "sarki-ara", "page-eski.tsx"));
if (missing.length || bad.length || oldPageExists) {
  if (missing.length) console.error(`Missing no-favorites snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden favorite snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (oldPageExists) console.error("Old search page with favorite checkbox still exists");
  process.exit(1);
}
console.log("Favorite UI is removed and remove actions are wired.");
