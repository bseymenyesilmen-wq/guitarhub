import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const widget = readFileSync(join(__dirname, "..", "app", "components", "ChatbotWidget.tsx"), "utf8");

const required = [
  "function makeClientId",
  "crypto.randomUUID",
  "Math.random().toString(36)",
  "type=\"submit\"",
  "type=\"button\"",
  "chatError",
  "Yoda gönderemedi",
];

const missing = required.filter((snippet) => !widget.includes(snippet));
if (missing.length) {
  console.error(`Missing Yoda send reliability snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Yoda send reliability fallback is wired.");
