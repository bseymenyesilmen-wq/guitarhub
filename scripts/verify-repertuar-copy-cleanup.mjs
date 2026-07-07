import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repertuar = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");

const required = [
  "<h1 className=\"gh-title relative z-10 text-4xl font-black sm:text-5xl\">Repertuvarım</h1>",
  "<h2 className=\"gh-section-title text-2xl font-black\">{selectedSetlist.name}</h2>",
  "draggable",
  "reorderSetlistSong",
];
const forbidden = [
  "Setlist klasörleri",
  "Konser setlist, Acılı setlist veya prova klasörleri oluştur",
  "Şarkı Ara ekranından parçaları istediğin setliste at",
  "Şarkı Yaz’dan kaydedilenler",
  "Setlist içi",
  "Basılı tutup sürükle-bırak ile sırala",
];

const missing = required.filter((snippet) => !repertuar.includes(snippet));
const bad = forbidden.filter((snippet) => repertuar.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing cleaned repertuar snippets:\n${missing.join("\n")}`);
  if (bad.length) console.error(`Forbidden repertuar helper copy remains:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Repertuvar marked helper copy is removed.");
