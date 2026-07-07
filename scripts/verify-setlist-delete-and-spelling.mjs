import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repertuar = readFileSync(join(__dirname, "..", "app", "repertuar", "page.tsx"), "utf8");
const chordSheet = readFileSync(join(__dirname, "..", "app", "components", "ChordBottomSheet.tsx"), "utf8");
const home = readFileSync(join(__dirname, "..", "app", "page.tsx"), "utf8");
const nav = readFileSync(join(__dirname, "..", "app", "components", "AppNav.tsx"), "utf8");

const required = [
  [repertuar, "async function deleteSetlist", "delete setlist handler"],
  [repertuar, '.from("setlist_songs").delete().eq("setlist_id", setlist.id)', "delete child setlist songs first"],
  [repertuar, '.from("setlists").delete().eq("id", setlist.id)', "delete setlist row"],
  [repertuar, "readLocalSetlists().filter((item) => item.id !== setlist.id)", "local setlist delete"],
  [repertuar, "Setlisti Sil", "setlist delete button"],
  [repertuar, "Repertuvarım", "correct repertuvar heading"],
  [home, "Repertuvar", "home repertuvar spelling"],
  [nav, 'label: "Repertuvar"', "nav repertuvar spelling"],
  [chordSheet, "Bare {position.barre.fret}. perde", "visible bare spelling"],
];
const forbidden = [
  [repertuar, "Repertuarım", "old repertuar heading"],
  [home, "Repertuarı Aç", "old home button spelling"],
  [home, "Repertuar akışı", "old section spelling"],
  [nav, 'label: "Repertuar"', "old nav spelling"],
  [chordSheet, "Barre {position.barre.fret}. perde", "old visible barre spelling"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing setlist/spelling snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden old spelling remains:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Setlist delete and Turkish spelling cleanup are wired.");
