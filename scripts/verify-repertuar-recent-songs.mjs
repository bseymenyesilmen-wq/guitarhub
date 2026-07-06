import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repertuar = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");
const detail = readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8");

const forbidden = [
  "guitarhub.recentSongs.v1",
  "RECENT_SONGS_KEY",
  "readRecentSongs",
  "saveRecentSong",
  "recentSongs",
  "Son açılanlar",
  "En son baktığın şarkılar",
];

for (const marker of forbidden) {
  if (repertuar.includes(marker) || detail.includes(marker)) {
    throw new Error(`Recent opened songs should be removed: ${marker}`);
  }
}

console.log("Repertuar recent opened songs section is removed.");
