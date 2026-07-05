import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8");

const required = [
  "playMode",
  "Çalma Modu",
  "Çalma modundan çık",
  "Prova/çalma modu",
  "text-2xl leading-10",
  "setPlayMode(true)",
  "setPlayMode(false)",
  "Temiz ekran",
];

const missing = required.filter((snippet) => !detail.includes(snippet));
if (missing.length) {
  console.error(`Missing play mode snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Song detail play mode is wired.");
