import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const writer = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");

const required = [
  "autoSaveReady",
  "Otomatik kaydedildi",
  "window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))",
  "setAutoSaveMessage",
];

const missing = required.filter((snippet) => !writer.includes(snippet));
if (missing.length) {
  console.error(`Missing songwriter autosave snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter draft autosave is wired.");
