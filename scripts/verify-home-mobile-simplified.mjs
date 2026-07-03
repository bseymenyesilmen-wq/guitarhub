import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "page.tsx"), "utf8");

const required = [
  'section className="hidden gap-4 lg:grid lg:grid-cols-4"',
  'section className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1.2fr_0.8fr]"',
  "Devam Et",
  "Son Eklenen Şarkılar",
  "id=\"favoriler\"",
];

const forbidden = [
  "const YODA_PROMPTS",
  "Yoda Yardımcı",
  "Takıldığın yerde sor",
  "Sağ alttaki Yoda butonundan",
  'section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"',
];

const missing = required.filter((snippet) => !page.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => page.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing simplified home snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Forbidden home clutter still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Mobile homepage is simplified.");
