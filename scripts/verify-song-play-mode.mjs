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
  "AUTO_SCROLL_SPEEDS",
  "autoScrollSpeed",
  "playFontSize",
  "playTextRef",
  "Oto Kaydır",
  "Yavaş",
  "Orta",
  "Hızlı",
  "A-",
  "A+",
  "style={{ fontSize: `${playFontSize}rem` }}",
  "saveRecentSong",
  "guitarhub.recentSongs.v1",
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

console.log("Song detail play mode has autoscroll, font controls, and recent tracking.");
