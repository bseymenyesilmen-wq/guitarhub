import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "async function withCachedOrFallbackCover",
  "async function withCachedOrFallbackCovers",
  "const cachedCover = await getCachedSongCover(song.artist, song.title)",
  "return { ...song, cover: cachedCover || providerCover || artistCover || fallbackCoverForSong(song.artist, song.title), variants }",
  "async function fastFallbackRecommendations",
  "return await withInternetOrFallbackCovers(",
  "const quickFallback = await fastFallbackRecommendations([...existing, ...quickCandidates], artist, title)",
  "const quickFallback = await fastFallbackRecommendations([...existing, ...quickCandidates], artist, title)",
];

const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing cached Play Next fallback snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Cached Play Next fallback covers are present.");
