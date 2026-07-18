import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

const globals = read("app", "globals.css");
const nav = read("app", "components", "AppNav.tsx");
const yoda = read("app", "components", "ChatbotWidget.tsx");
const home = read("app", "page.tsx");
const scales = read("app", "gam-kutuphanesi", "page.tsx");

const required = [
  [globals, "html {\n  overflow-x: hidden;", "global horizontal overflow guard"],
  [globals, "-webkit-text-size-adjust: 100%", "iOS text size guard"],
  [globals, "-webkit-tap-highlight-color: transparent", "mobile tap highlight polish"],
  [nav, "max-w-[calc(100vw-1rem)]", "bottom nav constrained to viewport"],
  [nav, "overscroll-x-contain", "bottom nav scroll containment"],
  [nav, "flex min-w-max gap-1", "mobile nav remains horizontally scrollable"],
  [yoda, "bottom-[calc(env(safe-area-inset-bottom)+5.6rem)]", "Yoda floats above mobile nav and safe area"],
  [yoda, "h-[min(540px,calc(100dvh-8.5rem))]", "Yoda panel fits short phones"],
  [yoda, "w-[calc(100vw-1.5rem)]", "Yoda panel width fits phones"],
  [home, "Repertuvarı Aç", "homepage keeps primary actions"],
  [home, "Son Eklenen Şarkılar", "homepage keeps recent songs after summary cards removed"],
  [scales, "overflow-x-hidden p-3 pb-32", "scale page mobile overflow guard"],
];

const forbidden = [
  [home, "<StatCard", "homepage summary card component removed"],
  [home, "Kaydettiğin toplam şarkı", "Repertuvar summary box removed"],
  [home, "Gitarını hızlıca akort et", "Tuner summary box removed"],
  [home, "En yeni repertuvar kaydı", "Son Eklenen summary box removed"],
  [yoda, "h-[540px] w-[calc(100vw-2rem)]", "old fixed-height Yoda mobile panel"],
  [nav, "max-w-xl overflow-x-auto rounded", "old nav max width can overflow narrow phones"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing mobile/tablet snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden mobile/tablet snippets:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Mobile/tablet polish is wired.");
