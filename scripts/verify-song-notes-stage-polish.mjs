import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (path) => readFileSync(join(root, path), "utf8");

const notesLib = read("lib/song-notes.ts");
const notesPanel = read("app/components/SongNotesPanel.tsx");
const search = read("app/sarki-ara/page.tsx");
const detail = read("app/sarki/[id]/page.tsx");

const required = [
  [notesLib, "guitarhub.songNotes.v1", "localStorage song notes key"],
  [notesLib, "makeSongNoteKey", "stable song note key"],
  [notesLib, "writeSongNote", "song note save helper"],
  [notesPanel, "Şarkı Notları", "notes panel title"],
  [notesPanel, "Notu Kaydet", "notes save button"],
  [search, "<SongNotesPanel song={{ artist: result.artist, title: result.title }} />", "search notes panel"],
  [detail, "<SongNotesPanel song={{ id: song.id, artist: song.artist, title: song.title }} />", "saved detail notes panel"],
  [detail, "Sahne Modu", "stage CTA copy"],
  [detail, "Sahne Modu · ekrana dokun gizle/göster", "stage full-screen copy"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(`Missing song notes/stage snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Song notes and stage polish are wired.");
