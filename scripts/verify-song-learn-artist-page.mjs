import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const artistPath = join(root, "app", "sanatci", "[artistSlug]", "page.tsx");
const artistPage = existsSync(artistPath) ? readFileSync(artistPath, "utf8") : "";
const learnList = readFileSync(join(root, "app", "sarki-ogren", "page.tsx"), "utf8");
const detailPage = readFileSync(join(root, "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");

const required = [
  [artistPage, "useParams"],
  [artistPage, "loadArtistTabs"],
  [artistPage, "supabase.from(\"learning_tabs\")"],
  [artistPage, "artist_slug"],
  [artistPage, "Enstrüman filtresi"],
  [artistPage, "Sanatçı Tabları"],
  [artistPage, "Son eklenen"],
  [artistPage, "A-Z"],
  [artistPage, "Tab veya şarkı ara"],
  [artistPage, "href={`/sarki-ogren/${tab.id}`}"],
  [learnList, "href={`/sanatci/${tab.artistSlug}`}"],
  [detailPage, "href={`/sanatci/${tab?.artist_slug}`}"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing song learn artist page snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Şarkı Öğren artist page is wired.");
