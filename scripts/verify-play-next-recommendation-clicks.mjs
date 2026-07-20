import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const search = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const api = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  [search, "providerPriority", "provider priority helper"],
  [search, "prioritySongVariants", "recommendation variants are ordered"],
  [search, "provider.includes(\"repertuarim\")", "Repertuarım first priority"],
  [search, "provider.includes(\"uakor\")", "uAkor second priority"],
  [search, "provider.includes(\"ultimate\")", "Ultimate Guitar fallback priority"],
  [search, "for (const variant of prioritySongVariants(song))", "recommendation tries every variant"],
  [search, "openSongViaSearchFallback(song: SongSearchListItem): Promise<boolean>", "recommendation search fallback"],
  [search, "openSongBySource(song: SongSearchListItem, allowSearchFallback = true): Promise<boolean>", "source fetch fallback wrapper"],
  [search, "fetchSongSearchPayload({ title: song.title, artist: song.artist })", "fallback searches by title and artist"],
  [search, "openRecommendation", "recommendation click handler"],
  [search, "openingRecommendationSource", "recommendation loading state"],
  [search, "Açılıyor...", "visible recommendation feedback"],
  [search, "key={recommendationKey(recommendation)}", "stable unique recommendation key"],
  [search, "disabled={isOpening || loading}", "prevents dead repeated taps while opening"],
  [api, "emergencyFallbackRecommendations", "API always has fallback recommendation path"],
  [api, "source: \"search:", "fallback recommendations can be reopened via search"],
];

const forbidden = [
  [search, "key={recommendation.source}", "source-only key can collide"],
  [search, "onClick={() => selectSong(recommendation)}", "recommendation click without fallback/loading"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing play-next fallback snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden play-next snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Play Next recommendations have source fallback and tap feedback.");
