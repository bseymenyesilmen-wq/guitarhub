import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "function extractUakorPreload",
  "__CHORD_PRELOAD__",
  "type UakorPreload",
  "`${UAKOR_URL}/arama?q=${encodeURIComponent(query)}`",
  "`${UAKOR_URL}/akor/${slugify(query)}-akor`",
  "provider: \"uakor\"",
  "provider: \"akorlar\"",
  "groupSongVariants",
];
const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing uAkor/Akorlar integration snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("uAkor/Akorlar provider integration hooks are present.");
