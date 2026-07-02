import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");

const required = [
  "handlePlayerShortcut",
  "window.addEventListener(\"keydown\"",
  "event.code === \"Space\"",
  "event.key.toLowerCase() === \"s\"",
  "event.key.toLowerCase() === \"l\"",
  "event.key.toLowerCase() === \"m\"",
  "event.altKey",
  "event.key.toLowerCase() === \"n\"",
  "event.key.toLowerCase() === \"c\"",
  "event.key === \"Backspace\"",
  "event.key === \"ArrowRight\"",
  "event.key === \"ArrowLeft\"",
  "setCurrentMeasure",
  "setMetronomeEnabled",
  "setCountInEnabled",
  "setMutedTrackIds",
  "setSoloTrackId",
  "Yeşil imleç",
  "currentMeasure === index",
  "Metronom:",
  "Count-in:",
];

const missing = required.filter((snippet) => !detail.includes(snippet));
if (missing.length) {
  console.error(`Missing player shortcut snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Song learning keyboard shortcuts and player state are wired.");
