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
  "provider?: string",
  "query?: string",
  "title?: string",
  "artist?: string",
  "const REPERTUARIM_URL",
  "const ULTIMATE_GUITAR_URL",
  "const ULTIMATE_GUITAR_API_URL",
  "const UAKOR_URL",
  "const AKORLAR_URL",
  "buildUltimateGuitarHeaders",
  "getUltimateGuitarJson",
  "stripUltimateGuitarMarkup",
  "async function searchUltimateGuitar",
  "async function searchUakor",
  "async function searchAkorlar",
  "async function fetchUakorSongByUrl",
  "async function fetchAkorlarSongByUrl",
  "async function fetchUltimateGuitarSongByUrl",
  "stripUltimateGuitarMarkup",
  "setSongResults",
  "Sanatçılar",
  "Şarkılar",
  "placeholder=\"Şarkı adı\"",
  "placeholder=\"Sanatçı\"",
  "body: JSON.stringify({ title: title.trim(), artist: artist.trim() })",
  "Sanatçı yazınca şarkıları listeler",
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing song search snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const forbidden = [
  "Aramak için bir şarkı adı yazmalısın.",
  "const firstSongLink = $searchPage",
  "placeholder=\"Şarkı adı (isteğe bağlı)\"",
  "body: JSON.stringify({ query: query.trim() })",
  "const [query, setQuery]",
  "artistOnly",
];
const bad = forbidden.filter((snippet) => haystack.includes(snippet));
if (bad.length) {
  console.error(`Old search snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

const inputCount = (page.match(/<input/g) ?? []).length;
if (inputCount !== 2) {
  console.error(`Expected artist + song inputs, found ${inputCount}`);
  process.exit(1);
}

console.log("Two-field multi-source song search hooks are present.");
