import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const writer = readFileSync(join(__dirname, "..", "app", "sarki-yaz", "page.tsx"), "utf8");
const detail = readFileSync(join(__dirname, "..", "app", "sarki", "[id]", "page.tsx"), "utf8");

const required = [
  "new URLSearchParams(window.location.search).get(\"songId\")",
  "songId",
  "editingSongId",
  "loadExistingSongDraft",
  "Repertuvarda Güncelle",
  ".update({",
  "eq(\"id\", editingSongId)",
  "Şarkı Yaz'da Düzenle",
  "href={`/sarki-yaz?songId=${song.id}`}",
  "isOwnSong",
  "GUITARHUB_OWN_SONG",
];

const forbidden = [
  "Kapo Sihirbazı",
  "Şarkıyı kolaylaştır",
  "findSimplifiedSongOption",
  "simplifiedOption",
];

const haystack = `${writer}\n${detail}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => haystack.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing own-song edit snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Removed simplifier snippets still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Own songs can be reopened in songwriter editor.");
