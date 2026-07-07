import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");

const visibleFiles = {
  gam: read("app", "gam-kutuphanesi", "page.tsx"),
  chordSheet: read("app", "components", "ChordBottomSheet.tsx"),
  chordDiagram: read("app", "components", "ChordDiagram.tsx"),
  theory: read("lib", "music-theory.ts"),
  scaleData: read("lib", "all-guitar-scales-data.ts"),
};

const required = [
  [visibleFiles.gam, "Root nota, gam türü, görünüm ve pozisyon seçerek", "new scale intro"],
  [visibleFiles.theory, "name: position.name.replace(/^All-Guitar-Chords", "chord position display name sanitized"],
  [visibleFiles.scaleData, "Sık kullanılan, pratik gam kalıbı.", "common scale copy cleaned"],
  [visibleFiles.scaleData, "Daha özel renkler", "rare scale copy cleaned"],
  [visibleFiles.scaleData, "Egzotik renkler", "exotic scale copy cleaned"],
];
const forbidden = [
  [visibleFiles.gam, "Gerçek gitar fretboard", "scale eyebrow removed"],
  [visibleFiles.gam, "All-Guitar-Chords", "scale page provenance removed"],
  [visibleFiles.gam, "gitar klavyesi: 0-21", "fretboard bottom explanation removed"],
  [visibleFiles.scaleData, "All-Guitar-Chords Common gamı", "common provenance removed"],
  [visibleFiles.scaleData, "All-Guitar-Chords Rare gamı", "rare provenance removed"],
  [visibleFiles.scaleData, "All-Guitar-Chords Exotic gamı", "exotic provenance removed"],
  [visibleFiles.chordSheet, "All-Guitar-Chords", "chord sheet visible provenance removed"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error("Missing:\n" + missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n"));
  if (bad.length) console.error("Forbidden:\n" + bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n"));
  process.exit(1);
}
console.log("Visible All-Guitar provenance text is cleaned from chord/scale UI.");
