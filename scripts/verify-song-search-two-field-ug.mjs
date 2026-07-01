import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  'const [title, setTitle] = useState("")',
  'const [artist, setArtist] = useState("")',
  'placeholder="Şarkı adı"',
  'placeholder="Sanatçı"',
  'body: JSON.stringify({ title: title.trim(), artist: artist.trim() })',
  'Sanatçı yazınca şarkıları listeler',
  'ULTIMATE_GUITAR_URL = "https://www.ultimate-guitar.com"',
  'ULTIMATE_TABS_URL = "https://tabs.ultimate-guitar.com"',
  'searchUltimateGuitar',
  'fetchUltimateGuitarSongByUrl',
];
const haystack = `${page}\n${route}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing two-field/UG snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const inputCount = (page.match(/<input/g) ?? []).length;
if (inputCount !== 2) {
  console.error(`Expected artist + song inputs, found ${inputCount}`);
  process.exit(1);
}

console.log("Two-field song search and Ultimate Guitar hooks are present.");
