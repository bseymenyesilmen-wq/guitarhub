import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");

const required = [
  "editorOpen",
  "setEditorOpen",
  "editorText",
  "setEditorText",
  "editorStatus",
  "setEditorStatus",
  "revisionNote",
  "setRevisionNote",
  "handleSaveTabEdit",
  "learning_tab_revisions",
  "tab_snapshot",
  "revision_number",
  "Tab Editörü",
  "Revizyon notu",
  "Kaydet ve revizyon oluştur",
  "Public edit",
  "Private edit",
  "Taslak",
  "event.key.toLowerCase() === \"e\"",
  "setEditorOpen((value) => !value)",
  "setTab((current) => current ? { ...current, tab_text: editorText",
];

const missing = required.filter((snippet) => !detail.includes(snippet));
if (missing.length) {
  console.error(`Missing tab editor snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Tab editor with revision save is wired.");
