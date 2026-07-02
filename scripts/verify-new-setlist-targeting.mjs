import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "const shouldCreateNewSetlist = !targetSetlistId && Boolean(trimmedSetlistName)",
  "let setlistId = shouldCreateNewSetlist ? null : targetSetlistId ?? selectedSetlistId",
  "if (shouldCreateNewSetlist && trimmedSetlistName)",
  "if (shouldCreateNewSetlist && trimmedSetlistName) {",
];

const missing = required.filter((snippet) => !page.includes(snippet));
if (missing.length) {
  console.error(`New setlist targeting bug still present. Missing:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("New setlist targeting prefers typed setlist name over selected setlist.");
