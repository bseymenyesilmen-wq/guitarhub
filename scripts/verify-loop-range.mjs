import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");

const required = [
  "loopStartMeasure",
  "setLoopStartMeasure",
  "loopEndMeasure",
  "setLoopEndMeasure",
  "normalizeLoopRange",
  "markLoopStart",
  "markLoopEnd",
  "Loop Başlangıç",
  "Loop Bitiş",
  "Loop aralığı",
  "event.key === \"[\"",
  "event.key === \"]\"",
  "setLoopStartMeasure(currentMeasure)",
  "setLoopEndMeasure(currentMeasure)",
  "current >= safeLoopEnd",
  "return safeLoopStart",
  "current < safeLoopStart",
  "loopStartMeasure + 1",
  "loopEndMeasure + 1",
];

const missing = required.filter((snippet) => !detail.includes(snippet));
if (missing.length) {
  console.error(`Missing loop range snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Loop range selection is wired.");
