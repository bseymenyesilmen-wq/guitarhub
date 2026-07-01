import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const required = [
  "function isSectionMarkerOnlyBlock",
  "function isTabLegendBlock",
  "if (isSectionMarkerOnlyBlock(cleanedBlock) || isTabLegendBlock(cleanedBlock)) continue;",
];
const missing = required.filter((snippet) => !route.includes(snippet));
if (missing.length) {
  console.error(`Missing empty section/tab legend cleanup snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Empty section and tab legend cleanup hooks are present.");
