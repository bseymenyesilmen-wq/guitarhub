import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repertuar = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");

const required = [
  "Bestelerim",
  "Kendi besten",
  "Düzenle",
  "Besteyi Sil",
  "deleteOwnSong(song: Song)",
  'setlist_songs").delete().eq("song_id", song.id)',
  'songs").delete().eq("id", song.id).eq("user_id", userId)',
  "deletingOwnSongId",
  "href={`/sarki-yaz?songId=${song.id}`}",
  "Listeler",
];
const forbidden = ["RepertuvarQuickCard", "Taslaklar", "Şarkı Yaz’dan kaydedilen bestelerin", "Konser/prova klasörlerin"];
const missing = required.filter((snippet) => !repertuar.includes(snippet));
const bad = forbidden.filter((snippet) => repertuar.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing repertuar snippets:\n${missing.join("\n")}`);
  if (bad.length) console.error(`Forbidden repertuar clutter remains:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Repertuvar premium sections are wired.");
