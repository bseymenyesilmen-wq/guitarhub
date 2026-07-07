import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");

const search = read("app", "sarki-ara", "page.tsx");
const detail = read("app", "sarki", "[id]", "page.tsx");
const chordSheet = read("app", "components", "ChordBottomSheet.tsx");
const songwriter = read("app", "sarki-yaz", "page.tsx");
const repertuar = read("app", "repertuar", "page.tsx");

const checks = [
  [search, "PLAY_THEMES", "search play themes"],
  [search, "Ekran Açık", "search wake lock button"],
  [search, "navigator as Navigator", "search wake lock API"],
  [detail, "PLAY_THEMES", "detail play themes"],
  [detail, "Ekran Açık", "detail wake lock button"],
  [detail, "navigator as Navigator", "detail wake lock API"],
  [chordSheet, "guitarhub.favoriteChords.v1", "favorite chord storage"],
  [chordSheet, "Çalışılacak akorlar", "practice chord strip"],
  [chordSheet, "Kolay alternatif", "easy chord alternative"],
  [songwriter, "loş beste defteri", "songwriter notebook hero"],
  [songwriter, "bg-[#f4ead5]", "paper notebook surface"],
  [songwriter, "Akor ve söz defteri", "notebook label"],
  [repertuar, "draggable", "drag enabled"],
  [repertuar, "reorderSetlistSong", "drop reorder function"],
  [repertuar, "Basılı tutup sürükle-bırak", "drag hint"],
];

const missing = checks.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n"));
  process.exit(1);
}
console.log("Selected UX upgrades are wired.");
