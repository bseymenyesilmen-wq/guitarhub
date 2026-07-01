import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const types = readFileSync(join(__dirname, "..", "lib", "songSearch.ts"), "utf8");

const required = [
  "variants?: SongSearchListItem[]",
  "function groupSongVariants",
  "providerChoices",
  "Kaynak seç",
  "song.variants?.length",
  "selectSong(variant)",
];
const combined = `${route}\n${page}\n${types}`;
const missing = required.filter((snippet) => !combined.includes(snippet));
if (missing.length) {
  console.error(`Missing provider choice snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Provider choice hooks are present.");
