import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const viewer = readFileSync(join(__dirname, "..", "app", "components", "ChordTextViewer.tsx"), "utf8");
const types = readFileSync(join(__dirname, "..", "lib", "songSearch.ts"), "utf8");
const haystack = `${page}\n${route}\n${viewer}\n${types}`;

const required = [
  "recommendations?: SongSearchListItem[]",
  "recommended?: UltimateGuitarTab[]",
  "recommendations: await buildFastDetailRecommendations",
  "Play next",
  "Sıradaki şarkılar",
  "selectSong(recommendation)",
  "lg:grid-cols-[minmax(0,1fr)_320px]",
  "whiteSpace: \"pre\"",
  "\"Arial, Helvetica, sans-serif\"",
  "sourceProvider?: string",
  "data-tab-viewer",
  "overflow-x-auto",
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing sidebar/tab snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const forbidden = [
  "style={{ fontFamily: \"Arial, Helvetica, sans-serif\" }}",
  "splitKeepingSpaces(item.line).map",
];
const bad = forbidden.filter((snippet) => haystack.includes(snippet));
if (bad.length) {
  console.error(`Old overlapping viewer snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Song detail sidebar and tab-safe viewer hooks are present.");
