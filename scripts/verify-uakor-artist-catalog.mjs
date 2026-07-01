import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "function extractUakorPlainAkorLinks",
  "function titleFromUakorSlug",
  "const isArtistCatalogPage = url.includes(\"/sanatci/\")",
  "extractUakorPlainAkorLinks(html)",
  "artist: isArtistCatalogPage ? query : parsed.artist",
  "source: `${UAKOR_URL}${href}`",
  "return dedupeSongs(songs).slice(0, 180)",
  "groupSongVariants(sortByQuery(filterByExplicitFields(allSongs, title, artist), query)).slice(0, 180)",
];
const forbidden = ["AKORLAR_URL", "searchAkorlar", "provider: \"akorlar\""];
const missing = required.filter((snippet) => !route.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => route.includes(snippet));
if (missing.length || presentForbidden.length) {
  console.error(`uAkor artist catalog integration problem:\nmissing=${missing.join("\n")}\nforbidden=${presentForbidden.join("\n")}`);
  process.exit(1);
}
console.log("uAkor artist catalog extraction hooks are present.");
