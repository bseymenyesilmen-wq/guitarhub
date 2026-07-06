import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const types = readFileSync(join(__dirname, "..", "lib", "songSearch.ts"), "utf8");
const haystack = `${route}\n${page}\n${types}`;

const required = [
  "async function buildSystemWideRecommendations",
  "const SIMILAR_ARTISTS",
  "const FOREIGN_PLAY_NEXT_QUERIES",
  "const TURKISH_PLAY_NEXT_QUERIES",
  "isLikelyForeignSong",
  "recommendations: await buildFastDetailRecommendations",
  "FALLBACK_TURKISH_RECOMMENDATIONS",
  "FALLBACK_FOREIGN_RECOMMENDATIONS",
  "emergencyFallbackRecommendations",
  "search:duman-hayati-yasa",
  "return fullRecommendations.length ? fullRecommendations : emergencyFallbackRecommendations",
  "cover?: string",
  "backgroundImage: `url(${recommendation.cover})`",
  "Bu varyasyon için öneri yok.",
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing system-wide play next snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("System-wide Play Next hooks are present.");
