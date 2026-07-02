import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sarkiAra = readFileSync(join(root, "app", "sarki-ara", "page.tsx"), "utf8");
const repertuar = readFileSync(join(root, "app", "repertuar", "page.tsx"), "utf8");
const types = readFileSync(join(root, "lib", "types.ts"), "utf8");
const migration = readFileSync(join(root, "supabase", "migrations", "20260702_setlists.sql"), "utf8");

const required = [
  [types, "export type Setlist"],
  [types, "export type SetlistSong"],
  [migration, "create table if not exists public.setlists"],
  [migration, "create table if not exists public.setlist_songs"],
  [migration, "enable row level security"],
  [migration, "create policy \"Users can manage own setlists\""],
  [sarkiAra, "const [setlistModalOpen, setSetlistModalOpen] = useState(false)"],
  [sarkiAra, "async function openSetlistModal()"],
  [sarkiAra, '.from("setlists")'],
  [sarkiAra, '.from("setlist_songs")'],
  [sarkiAra, "Yeni setlist oluştur"],
  [sarkiAra, "Setliste ekle"],
  [repertuar, "const [setlists, setSetlists]"],
  [repertuar, '.from("setlists")'],
  [repertuar, "Yeni Setlist"],
  [repertuar, "Konser setlist"],
  [repertuar, "Yukarı"],
  [repertuar, "Aşağı"],
  [repertuar, "setlist_songs"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing setlist repertoire snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Setlist repertoire flow is present.");
