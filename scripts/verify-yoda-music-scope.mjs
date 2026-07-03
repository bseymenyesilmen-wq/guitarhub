import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const chatbot = readFileSync(join(__dirname, "..", "lib", "chatbot.ts"), "utf8");
const route = readFileSync(join(__dirname, "..", "app", "api", "chatbot", "route.ts"), "utf8");
const widget = readFileSync(join(__dirname, "..", "app", "components", "ChatbotWidget.tsx"), "utf8");

const required = [
  "export const OUT_OF_SCOPE_REPLY",
  "Yaratıcım bu konuları cevaplamamı engelledi",
  "Müzik, şarkı, gitar, akor, gam veya GuitarHub hakkında sorarsan seve seve yardımcı olurum",
  "export function isMusicRelatedMessage",
  "MUSIC_KEYWORDS",
  "MUSIC_QUESTION_PATTERNS",
  "isMusicRelatedMessage(message)",
  "OUT_OF_SCOPE_REPLY",
  "şarkı sözü",
  "beste",
  "prodüksiyon",
  "mix mastering",
  "müzik hakkında her şeyi sorabilirsin",
  "Yoda cevaplıyor",
];

const missing = required.filter((snippet) => !`${chatbot}\n${route}\n${widget}`.includes(snippet));
if (missing.length) {
  console.error(`Missing Yoda music scope snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Yoda music scope guard is wired.");
