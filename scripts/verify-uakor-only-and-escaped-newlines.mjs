import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const viewer = readFileSync(join(__dirname, "..", "app", "components", "ChordTextViewer.tsx"), "utf8");

const routeRequired = [
  "function normalizeEscapedLineBreaks",
  "replace(/\\\\t/g, \"    \")",
  "normalizeEscapedLineBreaks(preload.data.content)",
  "provider: \"uakor\"",
];
const routeForbidden = [
  "AKORLAR_URL",
  "searchAkorlar",
  "fetchAkorlarSongByUrl",
  "provider: \"akorlar\"",
  "ALLORIGINS_RAW_URL",
  "JINA_READER_URL",
  "execFile",
];
const viewerRequired = [
  ".replace(/\\\\n/g, \"\\n\")",
  ".replace(/\\\\r/g, \"\\n\")",
];
const missing = [
  ...routeRequired.filter((snippet) => !route.includes(snippet)),
  ...viewerRequired.filter((snippet) => !viewer.includes(snippet)),
];
const forbidden = routeForbidden.filter((snippet) => route.includes(snippet));
if (missing.length || forbidden.length) {
  console.error(`uAkor newline/provider regression:\nmissing=${missing.join("\n")}\nforbidden=${forbidden.join("\n")}`);
  process.exit(1);
}
console.log("uAkor-only provider and escaped newline handling hooks are present.");
