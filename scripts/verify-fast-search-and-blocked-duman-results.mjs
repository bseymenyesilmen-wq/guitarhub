import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "const BLOCKED_SONG_RESULTS",
  "function isBlockedSongResult",
  "!isBlockedSongResult(song)",
  "const SEARCH_COVER_TIMEOUT_MS = 1_000",
  "const DETAIL_COVER_TIMEOUT_MS = 6_000",
  "type CoverLookupOptions",
  "allowItunes?: boolean",
  "if (options.allowItunes === false) return deezerCover",
  "const concurrency = 24",
  "const searchQueries = options.allowItunes === false ? queries.slice(0, 1) : queries",
  "const apiBackedSongs = dedupeSongs(songs)",
  "if (apiBackedSongs.length >= 20) return apiBackedSongs.slice(0, 180)",
  "const UAKOR_ARTIST_CATALOG_TIMEOUT_MS = 1_500",
  "function withTimeout<T>",
  "SEARCH_PROVIDER_TIMEOUT_MS",
  "withTimeout(searchUakorArtistCatalogApi(query).catch(() => []), [], UAKOR_ARTIST_CATALOG_TIMEOUT_MS)",
  "const UAKOR_API_SEARCH_TIMEOUT_MS = 700",
  "withTimeout(searchUakorApi(query).catch(() => []), [], UAKOR_API_SEARCH_TIMEOUT_MS)",
  "const songs = await withInternetOrFallbackCovers(groupedSongs, { allowItunes: false, timeoutMs: SEARCH_COVER_TIMEOUT_MS })",
];

const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing fast search / blocked Duman snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

for (const badTitle of ["Duman Üstü", "Duman Duman", "Duman"]) {
  if (!route.includes(`"${badTitle}"`)) {
    console.error(`Blocked title missing: ${badTitle}`);
    process.exit(1);
  }
}

console.log("Fast search cover mode and blocked Duman titles are present.");
