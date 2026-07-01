import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const types = readFileSync(join(__dirname, "..", "lib", "songSearch.ts"), "utf8");
const haystack = `${page}\n${route}\n${types}`;

const required = [
  "SongSearchListItem",
  "SongArtistResult",
  "songs: SongSearchListItem[]",
  "artists: SongArtistResult[]",
  "source?: string",
  "async function searchSongs",
  "async function fetchSongByUrl",
  "parseSongLink",
  "artistOnly",
  "setSongResults",
  "Sanatçılar",
  "Şarkılar",
  "Sanatçı veya şarkı ara",
  "selectSong",
  "Sanatçının şarkıları listelenir",
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing artist/song search snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const forbidden = [
  "Aramak için bir şarkı adı yazmalısın.",
  "const firstSongLink = $searchPage",
];
const bad = forbidden.filter((snippet) => haystack.includes(snippet));
if (bad.length) {
  console.error(`Old direct-first-result search snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Artist-first song search UI/API hooks are present.");
