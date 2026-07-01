import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "function compactChordLyricsContent",
  ".replace(/\\n{3,}/g, \"\\n\\n\")",
  "const lyricsAndChords = cleanChordLyricsContent",
  "lyricsBlocks.map(cleanChordLyricsContent)",
];
const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing compact lyric spacing snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Compact lyric spacing hooks are present.");
