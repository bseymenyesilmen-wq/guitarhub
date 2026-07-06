import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const searchPage = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const required = [
  "function variationLabel",
  "Varyasyon seç",
  "Bu şarkı için {providerChoices.length} varyasyon var",
  "{variationLabel(index)}",
  "${song.variants.length} varyasyon",
  "Çalma Modu",
  "playMode",
  "setPlayMode(true)",
  "setPlayMode(false)",
  "ekrana sığdırılmış",
  "Oto Kaydır",
  "A-",
  "A+",
  "style={{ fontSize: `${playFontSize}rem` }}",
];

const forbidden = [
  "Bu şarkı birkaç sitede var",
  "Kaynak seç",
  "variant.provider ?? \"Kaynak\"",
  "${song.variants.length} kaynak",
  "Kaynak: ${result.provider}",
];

const missing = required.filter((snippet) => !searchPage.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => searchPage.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing variation/playmode snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Forbidden source snippets still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Song search variations and play mode are wired.");
