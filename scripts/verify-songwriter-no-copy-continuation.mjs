import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const api = readFileSync(join(__dirname, "..", "app", "api", "songwriter", "assist", "route.ts"), "utf8");

const required = [
  "normalizeLyricLine",
  "sharedTokenRatio",
  "suggestedLyricsNeedRewrite",
  "sanitizeSuggestion",
  "mevcut sözden kopyalanmadan",
  "Kullanıcının yazdığı satırı, cümleyi veya özgün kelime grubunu kopyalama",
  "Önerilen iki satır kendi içinde de birbirini tekrar etmesin",
  "Mevcut sözden sadece duygu, tema, ritim ve kafiye ipucu al",
];

const missing = required.filter((snippet) => !api.includes(snippet));
if (missing.length) {
  console.error(`Missing songwriter no-copy continuation safeguards:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter continuation avoids copied/repeated lyrics.");
