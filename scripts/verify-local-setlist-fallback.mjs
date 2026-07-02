import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sarkiAra = readFileSync(join(root, "app", "sarki-ara", "page.tsx"), "utf8");
const repertuar = readFileSync(join(root, "app", "repertuar", "page.tsx"), "utf8");

const required = [
  [sarkiAra, "const LOCAL_SETLISTS_KEY"],
  [sarkiAra, "type LocalSetlist"],
  [sarkiAra, "function readLocalSetlists()"],
  [sarkiAra, "function writeLocalSetlists"],
  [sarkiAra, "const [setlistStorageMode, setSetlistStorageMode]"],
  [sarkiAra, "Setlist tabloları henüz Supabase'de yok. Şimdilik bu cihazda kaydediyorum."],
  [sarkiAra, "addToLocalSetlist"],
  [repertuar, "const LOCAL_SETLISTS_KEY"],
  [repertuar, "function readLocalSetlists()"],
  [repertuar, "const [storageMode, setStorageMode]"],
  [repertuar, "Yerel cihaz modu"],
  [repertuar, "localStorage"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing local setlist fallback snippets:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("Local setlist fallback is present.");
