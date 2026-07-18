import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const page = readFileSync(join(root, "app", "page.tsx"), "utf8");
const css = readFileSync(join(root, "app", "globals.css"), "utf8");

const required = [
  [page, "Kişisel gitar merkezi", "simple homepage kicker"],
  [page, "Bugün ne çalıyoruz?", "simple greeting wording"],
  [page, "Şarkı Ara", "primary search action"],
  [page, "Repertuvarı Aç", "primary repertoire action"],
  [page, "Tuner Aç", "primary tuner action"],
  [page, "Devam Et", "continue song card"],
  [page, "Son Eklenen Şarkılar", "recent songs section"],
  [page, "Bugün Çalış", "practice section"],
];

const forbidden = [
  [page, "function StatCard", "removed homepage stat card component"],
  [page, "<StatCard", "removed homepage stat cards"],
  [page, "hidden gap-4 lg:grid lg:grid-cols-3", "removed 3 summary boxes section"],
  [page, "Kaydettiğin toplam şarkı", "removed Repertuvar summary box"],
  [page, "Gitarını hızlıca akort et", "removed Tuner summary box"],
  [page, "En yeni repertuvar kaydı", "removed Son Eklenen summary box"],
  [page, "Studio Dashboard", "removed studio dashboard copy"],
  [page, "Control Room", "removed control room section"],
  [page, "gh-studio-", "removed studio dashboard classes"],
  [page, "gh-eq-line", "removed EQ visualizer"],
  [page, "gh-vu-stack", "removed VU meters"],
  [css, ".gh-studio-page", "removed studio dashboard CSS"],
  [css, ".gh-meter-card", "removed studio meter CSS"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const presentForbidden = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing simple homepage snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (presentForbidden.length) console.error(`Forbidden studio homepage snippets:\n${presentForbidden.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Homepage is back to the simple GuitarHub layout.");
