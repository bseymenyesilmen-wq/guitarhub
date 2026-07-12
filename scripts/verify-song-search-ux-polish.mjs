import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "function coverStyle(cover: string | undefined, title: string, artist: string)",
  "data:image/svg+xml",
  "style={coverStyle(recommendation.cover, recommendation.title, recommendation.artist)}",
  "style={coverStyle(song.cover, song.title, song.artist)}",
  "aria-label=\"Şarkı aramaya dön\"",
  "Şarkı araya dön",
  "onClick={resetSongView}",
];
const missing = required.filter((snippet) => !page.includes(snippet));
if (missing.length) {
  console.error(`Missing search UX snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Song search back button and cover fallback are wired.");
