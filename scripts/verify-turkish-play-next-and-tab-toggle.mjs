import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "const isForeign = isLikelyForeignSong(artist, title)",
  "function isTurkishRecommendation",
  "function searchProviderRecommendationCandidates",
  "if (!isForeign && !isTurkishRecommendation(candidate)) continue",
  "...(isForeign ? FOREIGN_PLAY_NEXT_QUERIES : TURKISH_PLAY_NEXT_QUERIES)",
];
const forbidden = [
  "const recommendations: SongSearchListItem[] = isForeign ? [...existing] : []",
];
const missing = required.filter((snippet) => !route.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => route.includes(snippet));
if (missing.length || presentForbidden.length) {
  console.error(`Missing/old Turkish Play Next snippets:\nmissing=${missing.join("\n")}\nforbidden=${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Turkish-only Play Next hooks are present.");
