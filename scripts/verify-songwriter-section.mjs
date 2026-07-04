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
  "Söz satırı",
  "Akor satırı",
  "Progression'u akora yaz",
  "Taslağı kaydet",
  "guitarhub-songwriter-draft",
  "Repertuvar önizlemesi",
  "whiteSpace: \"pre\"",
];

const missing = required.filter((snippet) => !`${nav}\n${page}`.includes(snippet));
if (missing.length) {
  console.error(`Missing songwriter section snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter section is wired.");
