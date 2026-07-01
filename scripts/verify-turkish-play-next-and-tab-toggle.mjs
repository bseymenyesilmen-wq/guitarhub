import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const types = readFileSync(join(__dirname, "..", "lib", "songSearch.ts"), "utf8");
const haystack = `${route}\n${page}\n${types}`;

const required = [
  "tab?: string",
  "splitUltimateGuitarContent",
  "tab: splitContent.tab",
  "const isForeign = isLikelyForeignSong(artist, title)",
  "const recommendations: SongSearchListItem[] = isForeign ? [...existing] : []",
  "setContentMode(payload.song.chords ? \"lyrics\" : \"tab\")",
  "contentMode === \"lyrics\"",
  "contentMode === \"tab\"",
  "Sözler",
  "Tab",
  "result.tab",
  "Görüntüle",
];
const missing = required.filter((snippet) => !haystack.includes(snippet));
if (missing.length) {
  console.error(`Missing Turkish Play Next / tab toggle snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const forbidden = [
  "const recommendations: SongSearchListItem[] = [...existing];",
  "const content = stripUltimateGuitarMarkup(tab.content ?? \"\");\n  if (!content)",
];
const bad = forbidden.filter((snippet) => haystack.includes(snippet));
if (bad.length) {
  console.error(`Old mixed recommendation/tab-only snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Turkish-only Play Next and tab toggle hooks are present.");
