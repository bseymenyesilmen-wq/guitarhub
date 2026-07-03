import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");

const required = [
  "countInActive",
  "setCountInActive",
  "countInBeat",
  "setCountInBeat",
  "metronomeBeat",
  "setMetronomeBeat",
  "togglePlayback",
  "startCountIn",
  "window.setInterval",
  "window.clearInterval",
  "setCountInBeat(4)",
  "setCountInBeat((beat) =>",
  "setPlaying(true)",
  "setCountInActive(false)",
  "const beatMs = Math.max(260, 60000 / Math.max(40, tab?.bpm || 90))",
  "setMetronomeBeat((beat) => (beat % 4) + 1)",
  "Count-in sayımı",
  "Metronom vuruşu",
  "Hazırlan: {countInBeat}",
  "Vuruş {metronomeBeat}/4",
];

const missing = required.filter((snippet) => !detail.includes(snippet));
if (missing.length) {
  console.error(`Missing metronome/count-in snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Metronome and count-in timer are wired.");
