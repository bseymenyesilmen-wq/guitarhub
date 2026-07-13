import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const widget = readFileSync(join(__dirname, "..", "app", "components", "ChatbotWidget.tsx"), "utf8");
const chatbot = readFileSync(join(__dirname, "..", "lib", "chatbot.ts"), "utf8");
const api = readFileSync(join(__dirname, "..", "app", "api", "chatbot", "route.ts"), "utf8");

const required = [
  [widget, "Duman tarzı akor yürüyüşü öner", "remaining useful prompt"],
  [chatbot, "sadece site linki verme", "Yoda should answer music questions directly"],
  [chatbot, "emin değilsen belirsizliği söyle", "uncertainty for song facts"],
  [chatbot, "cevabı sadece oraya yollamak değil", "fallback does not only route to library"],
  [chatbot, "Yoda artık genel yardımcı gibi davranır", "general Yoda scope"],
  [api, "callHermes(message, history, conversationId)", "general messages reach backend"],
];
const forbidden = [
  [widget, "Akor sor</button>", "Akor sor quick button"],
  [widget, "Söz yaz</button>", "Söz yaz quick button"],
  [chatbot, "Bunun için **${route.label}** bölümünü kullanabilirsin", "route-only generic fallback"],
  [chatbot, "OUT_OF_SCOPE_REPLY", "out-of-scope export"],
  [chatbot, "Yaratıcım bu konuları", "non-music block copy"],
  [api, "isMusicRelatedMessage(message) && !isGreeting", "API non-music prefilter"],
];
const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing Yoda snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden Yoda snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}
console.log("Yoda music and general scope is polished.");
