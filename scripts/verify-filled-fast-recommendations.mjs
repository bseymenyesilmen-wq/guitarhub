import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "const QUICK_RECOMMENDATION_TIMEOUT_MS = 650",
  "const quickCandidatesPromise = artist ? searchProviderRecommendationCandidates(artist, currentProvider).catch(() => []) : Promise.resolve([])",
  "const quickCandidates = await withTimeout(quickCandidatesPromise, [], QUICK_RECOMMENDATION_TIMEOUT_MS)",
  "const quickFallback = fastFallbackRecommendations([...existing, ...quickCandidates], artist, title)",
  "if (quickFallback.length >= 3) return quickFallback",
  "withTimeout(fullRecommendationsPromise, quickFallback, DETAIL_RECOMMENDATION_TIMEOUT_MS)",
];

const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing non-blocking filled recommendation snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Non-blocking filled Play Next recommendations are present.");
