import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repertuar = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");
const detail = readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8");

const required = [
  "guitarhub.recentSongs.v1",
  "type RecentSong",
  "readRecentSongs",
  "recentSongs",
  "setRecentSongs(readRecentSongs())",
  "Son açılanlar",
  "En son baktığın şarkılar",
  "Henüz son açılan şarkı yok",
  "saveRecentSong",
];

const haystack = `${repertuar}\n${detail}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing repertuar recent song snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Repertuar recent songs are wired.");
