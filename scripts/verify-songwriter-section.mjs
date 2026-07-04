import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const nav = readFileSync(join(__dirname, "..", "app", "components", "AppNav.tsx"), "utf8");
const page = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");

const required = [
  'href: "/sarki-yaz"',
  'label: "Şarkı Yaz"',
  "mobileLabel",
  "grid-cols-6",
  "Şarkı Yaz",
  "Şarkı Oluştur",
  "Chord Progression",
  "Hüzünlü",
  "Mutlu",
  "Karanlık",
  "Pop",
  "Rock",
  "Şarkı defteri",
  "Akor ve sözleri tek alana yaz",
  "Progression'u deftere ekle",
  "Taslağı kaydet",
  "guitarhub-songwriter-draft",
  "Repertuvar önizlemesi",
  "whiteSpace: \"pre\"",
];

const forbidden = [
  "type LyricLine",
  "Söz satırı",
  "Akor satırı",
  "Satır ekle",
  "draft.lines.map",
  "updateLine",
  "addLine",
];

const haystack = `${nav}\n${page}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => haystack.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing songwriter notebook snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Old row editor clutter still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter section uses a clean notebook editor.");
