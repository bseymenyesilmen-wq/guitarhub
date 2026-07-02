import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationPath = join(root, "supabase", "migrations", "20260702_learning_tabs.sql");
const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";
const types = readFileSync(join(root, "lib", "types.ts"), "utf8");
const page = readFileSync(join(root, "app", "sarki-ogren", "page.tsx"), "utf8");

const required = [
  [migration, "create table if not exists public.learning_tabs"],
  [migration, "create table if not exists public.learning_tab_tracks"],
  [migration, "create table if not exists public.learning_tab_revisions"],
  [migration, "create table if not exists public.learning_playlists"],
  [migration, "create table if not exists public.learning_playlist_items"],
  [migration, "create table if not exists public.learning_favorites"],
  [migration, "create table if not exists public.learning_history"],
  [migration, "Users can read published learning tabs"],
  [migration, "Users can manage own learning playlists"],
  [types, "export type LearningTab"],
  [types, "export type LearningTabTrack"],
  [types, "export type LearningPlaylist"],
  [page, "loadLearningData"],
  [page, "supabase.from(\"learning_tabs\")"],
  [page, "setStorageMode(\"supabase\")"],
  [page, "setStorageMode(\"demo\")"],
  [page, "Kalıcı Supabase modu"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing learning Supabase snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Learning Supabase schema and page integration are present.");
