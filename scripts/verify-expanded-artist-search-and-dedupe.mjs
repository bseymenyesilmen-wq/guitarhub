import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "const ARTIST_DISCOVERY_QUERIES",
  "Duman Hayati Yasa",
  "Duman Tovbe",
  "function dedupeBySongIdentity",
  "function recommendationIdentity",
  "groupSongVariants",
];
const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing expanded search / recommendation snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Expanded artist search and recommendation dedupe hooks are present.");
