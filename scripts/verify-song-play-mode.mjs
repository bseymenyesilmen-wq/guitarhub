import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8");

const required = [
  "playMode",
  "Çalma Modu",
  "Prova/çalma modu",
  "ekrana sığdırılmış",
  "AUTO_SCROLL_INTERVAL_MS",
  "autoScrollEnabled",
  "autoScrollLevel",
  "playFontSize",
  "playTextRef",
  "PLAY_MODE_FONT_FAMILY.proportional",
  "PLAY_MODE_FONT_FAMILY.monospace",
  "isTechnicalTabContent(transposedChords)",
  "fontFamily:",
  "tabSize: 4",
  "whiteSpace: \"pre\"",
  "Oto Kaydır",
  "Hız {autoScrollLevel}",
  "min=\"1\"",
  "max=\"10\"",
  "type=\"range\"",
  "A-",
  "A+",
  "style={{",
  "min-h-0 flex-1 overflow-auto",
  "setPlayMode(true)",
  "setPlayMode(false)",
  "Çık",
];

const missing = required.filter((snippet) => !detail.includes(snippet));
if (missing.length) {
  console.error(`Missing play mode snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const forbidden = ["font-mono leading", "AUTO_SCROLL_SPEEDS", "AutoScrollSpeed", "autoScrollSpeed", "<select value={autoScroll"];
for (const snippet of forbidden) {
  if (detail.includes(snippet)) {
    console.error(`Forbidden old play mode snippet still present: ${snippet}`);
    process.exit(1);
  }
}

console.log("Song detail play mode preserves chord alignment and has 1-10 speed control.");
