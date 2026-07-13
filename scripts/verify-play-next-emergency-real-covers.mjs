import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "async function emergencyFallbackRecommendations",
  "return await withInternetOrFallbackCovers(",
  "{ allowItunes: true, timeoutMs: DETAIL_COVER_TIMEOUT_MS }",
  "await emergencyFallbackRecommendations(artist, title)",
  "FALLBACK_TURKISH_RECOMMENDATIONS",
  "findInternetCoverForSong(song.artist, song.title, options)",
];
const forbidden = [
  "return withFallbackCovers(\n    base",
];
const missing = required.filter((snippet) => !route.includes(snippet));
const bad = forbidden.filter((snippet) => route.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing emergency real cover snippets:\n${missing.join("\n")}`);
  if (bad.length) console.error(`Forbidden emergency SVG fallback snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}
console.log("Play Next emergency recommendations now fetch real covers before fallback SVG.");
