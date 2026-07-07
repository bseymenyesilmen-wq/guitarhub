import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "<h1 className=\"gh-title relative z-10 text-4xl font-black sm:text-5xl\">Şarkı Ara</h1>",
  "placeholder=\"\"",
  ">Şarkı</span>",
  ">Sanatçı</span>",
];
const forbidden = [
  "Akor ve söz arama",
  "Şarkı, sanatçı veya ikisini birlikte ara",
  "Bulunan akor/söz seçenekleri",
  "Örnek:",
  "Senden Daha Güzel",
  "placeholder=\"Duman\"",
  "Son aramalar aşağıda chip olarak kalır",
];

const missing = required.filter((snippet) => !page.includes(snippet));
const bad = forbidden.filter((snippet) => page.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing cleaned search snippets:\n${missing.join("\n")}`);
  if (bad.length) console.error(`Forbidden search helper/example copy remains:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Song search helper/example copy is removed.");
