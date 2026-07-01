import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");
const types = readFileSync(join(__dirname, "..", "lib", "songSearch.ts"), "utf8");

const requiredRoute = [
  "type: 300",
  "function isUltimateGuitarChordType",
  "if (!isUltimateGuitarChordType(tab.type)) return { found: false, message: NOT_FOUND_MESSAGE };",
  "const content = stripUltimateGuitarMarkup(tab.content ?? \"\");",
  "chords: content",
  "lyrics: content",
];
const missingRoute = requiredRoute.filter((snippet) => !route.includes(snippet));
if (missingRoute.length) {
  console.error(`Missing UG chords-only route snippets:\n${missingRoute.join("\n")}`);
  process.exit(1);
}

const forbiddenCombined = ["splitUltimateGuitarContent", "isUltimateGuitarTabBlock", "tab: splitContent.tab", "tab?: string"];
const combined = `${route}\n${types}`;
const badCombined = forbiddenCombined.filter((snippet) => combined.includes(snippet));
const forbiddenPage = ["contentMode", "displayedContent", "result.tab", "setContentMode", ">\n                        Tab\n"];
const badPage = forbiddenPage.filter((snippet) => page.includes(snippet));
const bad = [...badCombined, ...badPage];
if (bad.length) {
  console.error(`Tab-era snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Ultimate Guitar chords-only mode hooks are present.");
