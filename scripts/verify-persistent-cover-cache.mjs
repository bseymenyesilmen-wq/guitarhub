import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const gitignore = readFileSync(join(__dirname, "..", ".gitignore"), "utf8");

const required = [
  'import { mkdir, readFile, writeFile } from "fs/promises"',
  'import path from "path"',
  'const COVER_CACHE_FILE = path.join(process.cwd(), ".cache", "song-covers.json")',
  'type PersistedCoverCache',
  'function songCoverCacheKey(artist: string, title: string)',
  'async function readPersistentCoverCache()',
  'async function writePersistentCoverCache()',
  'async function getCachedSongCover(artist: string, title: string)',
  'async function setCachedSongCover(artist: string, title: string, cover: string)',
  'const cachedCover = await getCachedSongCover(song.artist, song.title)',
  'await setCachedSongCover(artist, title, cover)',
  'const cover = cachedCover || internetCover || providerCover || fallbackCoverForSong(song.artist, song.title)',
];

const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing persistent cover cache snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
if (!gitignore.includes(".cache/")) {
  console.error("Missing .cache/ in .gitignore");
  process.exit(1);
}
console.log("Persistent song cover cache is present.");
