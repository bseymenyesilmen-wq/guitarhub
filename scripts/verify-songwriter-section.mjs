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
  "Şarkı defteri",
  "Akor ve söz defteri",
  "Repertuvara Kaydet",
  "guitarhub-songwriter-draft",
];

const forbidden = [
  "Chord Progression",
  "Progression'u deftere ekle",
  "Repertuvar önizlemesi",
  "PROGRESSIONS",
  "selectedProgression",
  "insertProgression",
  "whiteSpace: \"pre\"",
  "type LyricLine",
  "Söz satırı",
  "Satır ekle",
  "draft.lines.map",
  "updateLine",
  "addLine",
];

const haystack = `${nav}\n${page}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => haystack.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing simplified songwriter snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Removed songwriter clutter still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter section is a clean draft notebook.");
