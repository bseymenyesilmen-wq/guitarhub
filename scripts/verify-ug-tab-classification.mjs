import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "function isUltimateGuitarTabBlock",
  "const lyricsBlocks: string[] = []",
  "const tabBlocks: string[] = []",
  "if (isUltimateGuitarTabBlock(cleanedBlock))",
  "lyricsBlocks.push(cleanedBlock)",
  "const lyricsAndChords = cleanPreContent([outsideContent, ...lyricsBlocks]",
];
const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing real tab classifier snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const forbidden = [
  "const tabBlocks = [...normalized.matchAll(/\\[tab\\]([\\s\\S]*?)\\[\\/tab\\]/gi)].map((match) => stripUltimateGuitarMarkup(match[1]));",
  "const lyricsAndChords = stripUltimateGuitarMarkup(normalized.replace(/\\[tab\\][\\s\\S]*?\\[\\/tab\\]/gi, \"\\n\"));",
];
const bad = forbidden.filter((snippet) => route.includes(snippet));
if (bad.length) {
  console.error(`Old blanket [tab] splitter remains:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Ultimate Guitar real tab classifier hooks are present.");
