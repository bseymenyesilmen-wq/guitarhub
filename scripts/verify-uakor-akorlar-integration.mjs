import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "function extractUakorPreload",
  "__CHORD_PRELOAD__",
  "type UakorPreload",
  "function normalizeEscapedLineBreaks",
  "normalizeEscapedLineBreaks(preload.data.content)",
  "`${UAKOR_URL}/arama?q=${encodeURIComponent(query)}`",
  "`${UAKOR_URL}/akor/${slugify(query)}-akor`",
  "provider: \"uakor\"",
  "groupSongVariants",
];
const forbidden = [
  "AKORLAR_URL",
  "searchAkorlar",
  "fetchAkorlarSongByUrl",
  "parseAkorlarSongLink",
  "provider: \"akorlar\"",
  "Akorlar.com",
  "ALLORIGINS_RAW_URL",
  "JINA_READER_URL",
  "execFile",
];
const missing = required.filter((snippet) => !route.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => route.includes(snippet));
if (missing.length || presentForbidden.length) {
  console.error(`uAkor-only integration problem:\nmissing=${missing.join("\n")}\nforbidden=${presentForbidden.join("\n")}`);
  process.exit(1);
}
console.log("uAkor-only provider integration hooks are present.");
