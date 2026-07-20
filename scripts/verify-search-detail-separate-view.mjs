import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

const search = read("app", "sarki-ara", "page.tsx");

const required = [
  [search, "!result && (", "search form/list hidden while song detail is open"],
  [search, "setProviderChoices(null);", "provider choices close when song detail opens"],
  [search, "returnToSearchResults", "back button restores last search"],
  [search, "slowScrollToElement(searchResultsRef.current, 1400)", "search button scrolls to result list"],
  [search, "durationMs = 1300, topOffset = 24", "search scroll lands slightly lower"],
];

const forbidden = [
  [search, "slowScrollToElement(songDetailRef.current", "song click must not scroll down to inline detail"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing separate song-detail snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden separate song-detail snippets:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Song search opens details as a separate view without inline detail scroll.");
