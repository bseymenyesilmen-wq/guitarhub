import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const writer = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");

const required = [
  "max-w-6xl",
  "rounded-[1.75rem] border border-white/10 bg-zinc-950/70 p-4",
  "grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]",
  "Kısa bilgi",
  "AI ayarları",
  "+ {sectionBlock.replace",
  "rows={20}",
  "min-h-10",
  "Repertuvara Kaydet",
];

const forbidden = [
  "text-4xl font-black tracking-tight sm:text-6xl",
  "Bölümü deftere ekle {sectionBlock}",
  "Sözlerini ve akorlarını tek defter alanında yaz. Repertuvardaki gibi akor satırını sözün üstüne koy, taslağı bu cihazda sakla.",
];

const missing = required.filter((snippet) => !writer.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => writer.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing compact songwriter snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Non-compact snippets still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter page is compact.");
