import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "const UAKOR_API_URL = \"https://api.uakor.com/api\"",
  "type UakorApiChord",
  "async function getUakorJson",
  "async function searchUakorApi",
  "function uakorSearchQueryVariants",
  "query.replace(/\\bi/g, \"İ\")",
  "async function searchUakorArtistCatalogApi",
  "`${UAKOR_API_URL}/search?${queryParams.toString()}`",
  "`${UAKOR_API_URL}/artists/search?${queryParams.toString()}`",
  "`${UAKOR_API_URL}/artists/${encodeURIComponent(artist.slug ?? \"\")}/chords`",
  "`${UAKOR_URL}/akor/${slugify(query)}`",
  "`${UAKOR_URL}/akor/${slugify(query)}-akor`",
  "source: `${UAKOR_URL}/akor/${chord.slug}`",
  "const [apiSongs, artistCatalogSongs] = await Promise.all",
  "...apiSongs,",
  "songs.push(...apiSongs, ...artistCatalogSongs)",
];
const forbidden = ["AKORLAR_URL", "searchAkorlar", "provider: \"akorlar\""];
const missing = required.filter((snippet) => !route.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => route.includes(snippet));
if (missing.length || presentForbidden.length) {
  console.error(`uAkor public API search integration problem:\nmissing=${missing.join("\n")}\nforbidden=${presentForbidden.join("\n")}`);
  process.exit(1);
}
console.log("uAkor public API search and artist catalog hooks are present.");
