import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");
const repertuar = read("app", "repertuar", "page.tsx");
const chatbot = read("lib", "chatbot.ts");
const api = read("app", "api", "chatbot", "route.ts");

const required = [
  [repertuar, 'placeholder="Setlist adı"', "plain setlist input placeholder"],
  [repertuar, 'Yeni setlist oluştur', "clear create setlist button"],
  [repertuar, 'Henüz setlist yok. Yeni setlist oluşturup şarkılarını buraya ekleyebilirsin.', "simple empty setlist copy"],
  [repertuar, 'Yeni setlist oluşturunca şarkılarını burada göreceksin.', "simple first setlist copy"],
  [chatbot, 'Yoda artık genel yardımcı gibi davranır', "general-purpose Yoda prompt"],
  [chatbot, 'müzik dışı genel bir konu sorarsa da cevap ver', "non-music questions allowed"],
  [chatbot, 'bildiğim kadarıyla net cevaplayayım', "open fallback reply"],
  [api, 'const hermesReply = await callHermes(message, history, conversationId)', "API sends general messages to Hermes"],
];
const forbidden = [
  [repertuar, 'Konser setlist', "example setlist copy"],
  [repertuar, 'Acılı setlist', "example setlist copy"],
  [repertuar, 'Mesela', "example empty state copy"],
  [chatbot, 'OUT_OF_SCOPE_REPLY', "out-of-scope constant"],
  [chatbot, 'Yaratıcım bu konuları', "creator-blocked non-music reply"],
  [api, 'isMusicRelatedMessage(message) && !isGreeting', "API non-music prefilter"],
  [api, 'OUT_OF_SCOPE_REPLY', "API out-of-scope reply"],
];
const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing setlist/Yoda snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden old setlist/Yoda snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}
console.log("Setlist creation copy and open Yoda scope are wired.");
