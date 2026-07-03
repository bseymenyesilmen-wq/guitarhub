import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "chatbot", "route.ts"), "utf8");
const widget = readFileSync(join(__dirname, "..", "app", "components", "ChatbotWidget.tsx"), "utf8");

const required = [
  "createTimeoutSignal",
  "signal: createTimeoutSignal(8000)",
  "const controller = new AbortController()",
  "window.setTimeout(() => controller.abort(), 15000)",
  "signal: controller.signal",
  "finally",
  "window.clearTimeout(timeoutId)",
  "Yoda cevap veremedi kanka. Tekrar dener misin?",
];

const missing = required.filter((snippet) => !`${route}\n${widget}`.includes(snippet));
if (missing.length) {
  console.error(`Missing Yoda send timeout snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Yoda send timeout handling is wired.");
