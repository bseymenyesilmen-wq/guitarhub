import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const viewer = readFileSync(join(__dirname, "..", "app", "components", "ChordTextViewer.tsx"), "utf8");

const required = [
  "onChordClick",
  "function isChordToken",
  "button",
  "onClick={() => onChordClick?.(token)}",
  "aria-label={`Akor ${token}`}",
];
const missing = required.filter((snippet) => !viewer.includes(snippet));
if (missing.length) {
  console.error(`Missing clickable chord snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Clickable chord viewer hooks are present.");
