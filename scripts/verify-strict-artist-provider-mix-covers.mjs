import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "function matchesWantedArtist(song: SongSearchListItem, artist: string, exactArtist = false)",
  "return exactArtist ? actual === wanted",
  "const exactArtist = Boolean(artist && !title)",
  "matchesWantedArtist(song, artist, exactArtist)",
  "async function searchProviderRecommendationCandidates(query: string, currentProvider = \"\")",
  "function providerPriorityForRecommendations",
  "currentProvider && provider === currentProvider",
  "groupSongVariants(providerOrdered)",
  "await buildSystemWideRecommendations(artist, parsed.title, [], \"uakor\")",
  "await buildSystemWideRecommendations(tab.artist_name || fallbackArtist || \"\", tab.song_name || \"\", existingRecommendations, \"ultimate-guitar\")",
  "await buildSystemWideRecommendations(artist, scrapedTitle, [], \"repertuarim\")",
  "song.cover ? { backgroundImage: `url(${song.cover})` }",
  "variant.cover ? { backgroundImage: `url(${variant.cover})` }",
];
const missing = required.filter((snippet) => !`${route}\n${page}`.includes(snippet));
if (missing.length) {
  console.error(`Missing strict artist/provider mix/cover UI snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Strict artist search, mixed-provider recommendations, and cover UI hooks are present.");
