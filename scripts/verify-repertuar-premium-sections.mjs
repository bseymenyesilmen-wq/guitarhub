import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repertuar = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");

const required = [
  "RepertuvarQuickCard",
  "Kendi Şarkıların",
  "Taslaklar",
  "Setlistler",
  "ownSongs.length.toString()",
  "setlists.length.toString()",
  "Şarkı Yaz'a git",
  "Taslak cihazda",
  "grid gap-4 md:grid-cols-3",
  "bg-gradient-to-br from-red-600/25",
  "Kendi besten",
  "Düzenle",
  "Besteyi Sil",
  "deleteOwnSong(song: Song)",
  'setlist_songs").delete().eq("song_id", song.id)',
  'songs").delete().eq("id", song.id)',
  "deletingOwnSongId",
  "href={`/sarki-yaz?songId=${song.id}`}",
];

const missing = required.filter((snippet) => !repertuar.includes(snippet));
if (missing.length) {
  console.error(`Missing premium repertuar snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Repertuvar premium sections are wired.");
