import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");
const songwriter = read("app", "sarki-yaz", "page.tsx");
const repertuar = read("app", "repertuar", "page.tsx");

const required = [
  [songwriter, "function saveDraftManually()", "manual draft save"],
  [songwriter, "Taslak bu cihazda kaydedildi", "manual draft message"],
  [songwriter, "function clearNotebookIfDefault()", "default notebook clears on focus"],
  [songwriter, "onFocus={clearNotebookIfDefault}", "textarea clears on focus"],
  [songwriter, "placeholder=\"Akorları ve sözlerini buraya yaz\"", "plain notebook placeholder"],
  [songwriter, "window.localStorage.removeItem(STORAGE_KEY)", "saved compositions clear local draft"],
  [repertuar, "Bestelerim", "simple own compositions heading"],
  [repertuar, "Besteyi Sil", "delete own composition button"],
  [repertuar, '.from("songs").delete().eq("id", song.id).eq("user_id", userId)', "own song delete scoped to user"],
  [repertuar, "do not block deleting the user's own song", "link cleanup does not block delete"],
  [repertuar, "Listeler", "simpler setlist heading"],
];
const forbidden = [
  [songwriter, "Otomatik kaydedildi", "auto save copy"],
  [songwriter, "setTimeout(() => {\n      window.localStorage.setItem(STORAGE_KEY", "auto save timer"],
  [repertuar, "RepertuvarQuickCard", "quick card component"],
  [repertuar, "Taslaklar", "draft quick card"],
  [repertuar, "Setlistler\" value", "setlist quick card"],
  [repertuar, "Kendi Şarkıların\" value", "own songs quick card"],
];
const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing songwriting/repertuar snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden old songwriting/repertuar snippets:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}
console.log("Songwriting and repertuar polish is wired.");
