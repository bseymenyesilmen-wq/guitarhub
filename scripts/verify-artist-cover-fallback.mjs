import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "async function getCachedArtistCover(artist: string)",
  "const artistPrefix = `${normalizeText(artist)}::`",
  "Object.entries(cache).find(([key, cover]) => key.startsWith(artistPrefix) && cover && !cover.startsWith(\"data:image/svg+xml\"))",
  "const artistCover = cachedCover ? \"\" : await getCachedArtistCover(song.artist)",
  "cachedCover || internetCover || providerCover || artistCover || fallbackCoverForSong(song.artist, song.title)",
];

const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing artist cover fallback snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Artist-level cached cover fallback is present.");
