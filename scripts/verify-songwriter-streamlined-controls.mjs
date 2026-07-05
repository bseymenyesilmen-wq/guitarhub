import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const writer = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");
const api = readFileSync(join(__dirname, "..", "app", "api", "songwriter", "assist", "route.ts"), "utf8");

const required = [
  "Devamını yaz",
  "Sadece söz öner",
  "Sadece akor öner",
  "Sözleri parlat",
  "Daha hüzünlü yap",
  "Repertuvara Kaydet",
  "Otomatik kaydedildi",
  "Bölüm Nakarat ise",
  "Bölüm Bridge ise",
];

const forbiddenWriter = [
  "value: \"chorus\"",
  "value: \"bridge\"",
  "Nakarat üret",
  "Bridge öner",
  "function saveDraft",
  "onClick={saveDraft}",
  ">\n                  Kaydet\n                </button>",
];
const forbiddenApi = [
  "case \"chorus\"",
  "case \"bridge\"",
  "Eğer öneri tipi \"Nakarat üret\"",
  "Eğer öneri tipi \"Bridge öner\"",
];

const haystack = `${writer}\n${api}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
const presentForbidden = [
  ...forbiddenWriter.filter((snippet) => writer.includes(snippet)),
  ...forbiddenApi.filter((snippet) => api.includes(snippet)),
];
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing streamlined songwriter snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Forbidden songwriter snippets still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Songwriter suggestion controls are streamlined.");
