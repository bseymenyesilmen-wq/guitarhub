import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "page.tsx"), "utf8");

const required = [
  "TAB_LIBRARY",
  "query",
  "instrumentFilter",
  "filteredTabs",
  "Favoriler",
  "Geçmiş",
  "Playlist",
  "Enstrüman filtresi",
  "Sanatçı sayfası",
  "Şarkı sayfası",
  "Revizyon geçmişi",
  "Kullanıcı katkıları",
  "addToHistory",
  "toggleFavorite",
  "addToPlaylist",
  "GuitarHub kaynaklı demo tab",
  "Songsterr verisi çekilmez",
];

const missing = required.filter((snippet) => !page.includes(snippet));
if (missing.length) {
  console.error(`Missing learning library snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Şarkı Öğren library/search/favorites/history/playlist foundation is present.");
