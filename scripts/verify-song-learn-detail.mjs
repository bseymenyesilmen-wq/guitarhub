import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const detailPath = join(root, "app", "sarki-ogren", "[tabId]", "page.tsx");
const detail = existsSync(detailPath) ? readFileSync(detailPath, "utf8") : "";
const list = readFileSync(join(root, "app", "sarki-ogren", "page.tsx"), "utf8");

const required = [
  [detail, "useParams"],
  [detail, "loadTabDetail"],
  [detail, "supabase.from(\"learning_tabs\")"],
  [detail, "learning_tab_tracks(*)"],
  [detail, "learning_tab_revisions(*)"],
  [detail, "recordHistory"],
  [detail, "learning_history"],
  [detail, "toggleFavorite"],
  [detail, "learning_favorites"],
  [detail, "Büyük Tab Player"],
  [detail, "Enstrüman Trackleri"],
  [detail, "Revizyon Geçmişi"],
  [detail, "Kısayollar"],
  [detail, "Space = Play/Pause"],
  [detail, "Favoriye Ekle"],
  [detail, "Playlist'e Ekle"],
  [list, "href={`/sarki-ogren/${tab.id}`}"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing song learn detail snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Şarkı Öğren detail page is wired.");
