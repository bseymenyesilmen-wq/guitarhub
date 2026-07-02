import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "const DETAIL_RECOMMENDATION_TIMEOUT_MS = 900",
  "function fastFallbackRecommendations",
  "async function buildFastDetailRecommendations",
  "withTimeout(buildSystemWideRecommendations(artist, title, existing, currentProvider), fastFallbackRecommendations(existing, artist, title), DETAIL_RECOMMENDATION_TIMEOUT_MS)",
  "recommendations: await buildFastDetailRecommendations(artist, scrapedTitle, [], \"repertuarim\")",
  "recommendations: await buildFastDetailRecommendations(artist, parsed.title, [], \"uakor\")",
  "recommendations: await buildFastDetailRecommendations(tab.artist_name || fallbackArtist || \"\", tab.song_name || \"\", existingRecommendations, \"ultimate-guitar\")",
];

const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing fast detail snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Fast song detail recommendation timeout is present.");
