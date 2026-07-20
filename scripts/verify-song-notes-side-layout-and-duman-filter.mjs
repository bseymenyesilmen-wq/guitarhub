import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const searchPage = readFileSync(join(root, "app", "sarki-ara", "page.tsx"), "utf8");
const savedSongPage = readFileSync(join(root, "app", "sarki", "[id]", "page.tsx"), "utf8");
const route = readFileSync(join(root, "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  [route, "\"Zaman Zaman\"", "Duman Zaman Zaman blocked title"],
  [searchPage, "md:grid-cols-[minmax(0,1fr)_320px]", "search detail tablet/desktop side column"],
  [searchPage, "<aside className=\"space-y-4 md:sticky md:top-4 md:self-start\">", "search detail sticky side aside"],
  [searchPage, "<SongNotesPanel song={{ artist: result.artist, title: result.title }} />\n              <div className=\"rounded-3xl", "search notes before Play Next in side column"],
  [savedSongPage, "md:grid-cols-[minmax(0,1fr)_320px]", "saved song tablet/desktop side column"],
  [savedSongPage, "<aside className=\"md:sticky md:top-4 md:self-start\">", "saved song sticky notes aside"],
];

const forbidden = [
  [searchPage, "<div className=\"mt-4\">\n                <SongNotesPanel song={{ artist: result.artist, title: result.title }} />", "search notes below lyrics"],
  [savedSongPage, "<div className=\"mt-6\">\n              <SongNotesPanel", "saved song notes below lyrics"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing side notes snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden below-lyrics notes remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Song notes sit beside lyrics on tablet/desktop and Zaman Zaman is blocked for Duman.");
