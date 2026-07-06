import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const searchPage = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const repertuarPage = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");
const songDetailPage = readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8");

const required = [
  "guitarhub.songSearchHistory.v1",
  "Daha önce arananlar",
  "readRecentSearches",
  "writeRecentSearches",
  "saveRecentSearch(trimmedTitle, trimmedArtist)",
  "void searchSong(item.title, item.artist)",
  "Temizle",
];

for (const marker of required) {
  if (!searchPage.includes(marker)) {
    throw new Error(`Missing song search history marker: ${marker}`);
  }
}

const forbiddenSearch = [
  "Aramak istediğin sanatçıyı veya şarkıyı yaz.",
  "rounded-lg border border-dashed border-zinc-700 p-8",
];
for (const marker of forbiddenSearch) {
  if (searchPage.includes(marker)) {
    throw new Error(`Old empty search placeholder still present: ${marker}`);
  }
}

const forbiddenRecentSongs = [
  "Son açılanlar",
  "En son baktığın şarkılar",
  "guitarhub.recentSongs.v1",
  "recentSongs",
  "saveRecentSong",
];
for (const marker of forbiddenRecentSongs) {
  if (repertuarPage.includes(marker) || songDetailPage.includes(marker)) {
    throw new Error(`Recent opened songs UI/tracking should be removed: ${marker}`);
  }
}

console.log("Song search history UI is wired and recent opened songs are removed.");
