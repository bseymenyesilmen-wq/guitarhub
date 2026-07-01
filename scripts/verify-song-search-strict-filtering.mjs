import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "function matchesWantedArtist",
  "function matchesWantedTitle",
  "function filterByExplicitFields",
  "searchSongs(query, body?.title?.trim() ?? \"\", artist)",
  "actual === normalizeText(\"Bilinmeyen Sanatçı\")",
  "const artists = title",
];
const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing strict filtering snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Strict artist/title filtering hooks are present.");
