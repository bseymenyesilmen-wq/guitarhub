import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");

const required = [
  "useRef",
  "measureRailRef",
  "measureRefs",
  "setMeasureRef",
  "advanceCurrentMeasure",
  "window.setInterval",
  "window.clearInterval",
  "Math.max(260, 60000 /",
  "setPlaying(false)",
  "scrollIntoView({ behavior: \"smooth\"",
  "data-measure-index={index}",
  "ref={(element) => setMeasureRef(index, element)}",
  "Auto-scroll",
  "İlerleme",
];

const missing = required.filter((snippet) => !detail.includes(snippet));
if (missing.length) {
  console.error(`Missing auto-progress snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Auto progressing cursor and scroll are wired.");
