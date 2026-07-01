import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "const isForeign = isLikelyForeignSong(artist, title)",
  "const recommendations: SongSearchListItem[] = isForeign ? [...existing] : []",
  "...(isForeign ? FOREIGN_PLAY_NEXT_QUERIES : TURKISH_PLAY_NEXT_QUERIES)",
];
const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing Turkish Play Next snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Turkish-only Play Next hooks are present.");
