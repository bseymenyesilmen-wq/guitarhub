import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "const ITUNES_SEARCH_URL",
  "type ITunesSearchResponse",
  "function highResolutionItunesArtwork",
  "async function findInternetCoverForSong",
  "itunesCoverCache",
  "country: \"TR\"",
  "entity: \"song\"",
  "async function withInternetOrFallbackCover",
  "async function withInternetOrFallbackCovers",
  "findInternetCoverForSong(song.artist, song.title)",
  "await withInternetOrFallbackCovers",
  "data:image/svg+xml;utf8,",
  "recommendation.cover",
];
const missing = required.filter((snippet) => !`${route}\n${page}`.includes(snippet));
if (missing.length) {
  console.error(`Missing internet/fallback cover snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Internet cover lookup with generated fallback is present.");
