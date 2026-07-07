import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const files = {
  search: readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8"),
  detail: readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8"),
  nav: readFileSync(join(__dirname, "..", "app", "components", "AppNav.tsx"), "utf8"),
  yoda: readFileSync(join(__dirname, "..", "app", "components", "ChatbotWidget.tsx"), "utf8"),
  repertuar: readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8"),
};

const checks = [
  [files.search, "bg-[radial-gradient(circle_at_top_left", "search premium background"],
  [files.search, "Tek varyasyon", "song cards variation badge"],
  [files.search, "Sahne Modu · ekrana dokun gizle/göster", "search play stage mode"],
  [files.search, "Kontroller için ekrana dokun", "search hidden controls hint"],
  [files.detail, "Sahne Modu · ekrana dokun gizle/göster", "detail play stage mode"],
  [files.detail, "playControlsVisible", "detail controls toggle state"],
  [files.nav, "backdrop-blur-2xl", "premium mobile nav blur"],
  [files.nav, "scale-[1.03] bg-red-600", "active nav pill"],
  [files.yoda, "Yoda · Müzik Asistanı", "premium Yoda title"],
  [files.yoda, "Akor sor", "Yoda quick music action"],
  [files.yoda, "shadow-red-950", "Yoda glow"],
  [files.repertuar, "setlistAccent", "setlist accent colors"],
  [files.repertuar, "bg-[radial-gradient(circle_at_top_left", "repertuar premium background"],
  [files.repertuar, "rounded-[1.4rem] border p-4", "playlist setlist cards"],
];

const missing = checks.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n"));
  process.exit(1);
}

const forbidden = [
  [files.search, "Aramak istediğin sanatçıyı veya şarkıyı yaz.", "old empty search placeholder"],
  [files.search, "Kaynak seç", "old source language"],
  [files.nav, "bg-zinc-950/95 px-2", "old mobile nav"],
  [files.yoda, "Yoda Chatbot", "old Yoda title"],
];

const presentForbidden = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (presentForbidden.length) {
  console.error(presentForbidden.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n"));
  process.exit(1);
}

console.log("Premium UI refresh markers are wired.");
