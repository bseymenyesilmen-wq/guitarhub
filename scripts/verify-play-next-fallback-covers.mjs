import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "const ITUNES_SEARCH_URL",
  "const DEEZER_SEARCH_URL",
  "type ITunesSearchResponse",
  "type DeezerSearchResponse",
  "function highResolutionItunesArtwork",
  "function highResolutionDeezerArtwork",
  "function isWeakProviderCover",
  "function buildInternetCoverQueries",
  "async function findItunesCoverForSong",
  "async function findDeezerCoverForSong",
  "async function findInternetCoverForSong",
  "itunesCoverCache",
  "deezerCoverCache",
  "country: \"TR\"",
  "entity: \"song\"",
  "media: \"music\"",
  "if (!queryVariant.attribute) query.delete(\"attribute\")",
  "`artist:\"${artist}\" track:\"${title}\"`",
  "highResolutionDeezerArtwork(result?.album?.cover_big || result?.album?.cover_medium || \"\")",
  "const deezerCover = await findDeezerCoverForSong(artist, title)",
  "const itunesCover = await findItunesCoverForSong(artist, title)",
  "return deezerCover || itunesCover",
  "const songs = await withInternetOrFallbackCovers(groupedSongs)",
  "async function withInternetOrFallbackCover",
  "const internetCover = await findInternetCoverForSong(song.artist, song.title)",
  "const providerCover = isWeakProviderCover(song.cover) ? \"\" : song.cover",
  "cover: internetCover || providerCover || fallbackCoverForSong(song.artist, song.title)",
  "const concurrency = 4",
  "recommendation.cover",
];
const missing = required.filter((snippet) => !`${route}\n${page}`.includes(snippet));
if (missing.length) {
  console.error(`Missing stronger internet/album cover snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Apple/iTunes + Deezer album cover lookup with throttled provider fallback is present.");
