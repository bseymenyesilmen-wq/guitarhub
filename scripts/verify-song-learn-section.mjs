import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pagePath = join(root, "app", "sarki-ogren", "page.tsx");
const nav = readFileSync(join(root, "app", "components", "AppNav.tsx"), "utf8");
const home = readFileSync(join(root, "app", "page.tsx"), "utf8");
const page = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";

const required = [
  [nav, "href: \"/sarki-ogren\""],
  [home, "href: \"/sarki-ogren\""],
  [page, "export default function SarkiOgren"],
  [page, "Şarkı Öğren"],
  [page, "Loop"],
  [page, "Hız"],
  [page, "Solo"],
  [page, "Mute"],
  [page, "Mixer"],
  [page, "Transpose"],
  [page, "Metronom"],
  [page, "Tuner"],
  [page, "Kendi tabın"],
  [page, "Telifli/paralı servisleri kopyalamadan"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing Şarkı Öğren snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Şarkı Öğren section is wired with original practice-player controls.");
