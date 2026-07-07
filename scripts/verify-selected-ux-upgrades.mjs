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
  [search, "Ekran Açık", "search wake lock button"],
  [search, "navigator as Navigator", "search wake lock API"],
  [detail, "Ekran Açık", "detail wake lock button"],
  [detail, "navigator as Navigator", "detail wake lock API"],
  [chordSheet, "Pozisyon", "simple chord position summary"],
  [songwriter, "loş beste defteri", "songwriter notebook hero"],
  [songwriter, "bg-[#f4ead5]", "paper notebook shell"],
  [songwriter, "bg-[#fff7e8]", "non-drifting paper textarea"],
  [songwriter, "Akor ve söz defteri", "notebook label"],
  [repertuar, "draggable", "drag enabled"],
  [repertuar, "reorderSetlistSong", "drop reorder function"],
  [repertuar, "Basılı tutup sürükle-bırak", "drag hint"],
];

const forbidden = [
  [search, "PLAY_THEMES", "search play theme selector removed"],
  [detail, "PLAY_THEMES", "detail play theme selector removed"],
  [search, "Tema", "search theme control removed"],
  [detail, "Tema", "detail theme control removed"],
  [chordSheet, "guitarhub.favoriteChords.v1", "favorite chord storage removed"],
  [chordSheet, "Çalışılacak akorlar", "practice chord strip removed"],
  [chordSheet, "Kolay alternatif", "easy alternative card removed"],
  [songwriter, "bg-[linear-gradient(to_bottom", "drifting ruled background removed"],
];

const missing = checks.filter(([content, snippet]) => !content.includes(snippet));
const presentForbidden = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error("Missing:\n" + missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n"));
  if (presentForbidden.length) console.error("Forbidden present:\n" + presentForbidden.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n"));
  process.exit(1);
}
console.log("Selected UX removals and notebook fix are wired.");
