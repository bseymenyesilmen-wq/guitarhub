import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "function fallbackCoverForSong",
  "data:image/svg+xml;utf8,",
  "function withFallbackCover",
  "function withFallbackCovers",
  "cover: fallbackCoverForSong(song.artist, song.title)",
  "return withFallbackCovers(dedupeBySongIdentity(recommendations)",
  "const songs = withFallbackCovers(groupSongVariants",
  "recommendation.cover",
];
const missing = required.filter((snippet) => !`${route}\n${page}`.includes(snippet));
if (missing.length) {
  console.error(`Missing fallback cover snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Fallback covers for coverless song recommendations are present.");
