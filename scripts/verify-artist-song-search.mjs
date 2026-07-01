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
  "provider?: string",
  "query?: string",
  "const REPERTUARIM_URL",
  "const ULTIMATE_GUITAR_URL",
  "const UAKOR_URL",
  "const AKORLAR_URL",
  "async function searchUltimateGuitar",
  "async function searchUakor",
  "async function searchAkorlar",
  "async function fetchUakorSongByUrl",
  "async function fetchAkorlarSongByUrl",
  "async function fetchUltimateGuitarSongByUrl",
  "extractUakorPreContent",
  "extractUgContent",
  "cleanPreContent",
  "setSongResults",
  "Sanatçılar",
  "Şarkılar",
  "Sanatçı veya şarkı ara",
  "selectSong",
  "body: JSON.stringify({ query: query.trim() })",
  "Akor boşlukları korunur",
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
  "const [title, setTitle]",
  "const [artist, setArtist]",
  "artistOnly",
];
const bad = forbidden.filter((snippet) => haystack.includes(snippet));
if (bad.length) {
  console.error(`Old search snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

const inputCount = (page.match(/<input/g) ?? []).length;
if (inputCount !== 1) {
  console.error(`Expected exactly one search input, found ${inputCount}`);
  process.exit(1);
}

console.log("Single-bar multi-source song search hooks are present.");
