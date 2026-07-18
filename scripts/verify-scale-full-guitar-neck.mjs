import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const page = readFileSync(join(root, "app", "gam-kutuphanesi", "page.tsx"), "utf8");
const fretboard = readFileSync(join(root, "app", "components", "Fretboard.tsx"), "utf8");

const required = [
  [page, "const displayFrets = 21", "positions keep full 0-21 fretboard"],
  [page, "const fretboardStartFret = 0", "fretboard always starts at open position"],
  [page, "positionEndFret = positionStartFret === null ? null", "selected position still computed"],
  [fretboard, "isInsideSelectedPosition", "selected position highlight helper"],
  [fretboard, "bg-[#333]", "original simple fretboard background"],
  [fretboard, "border-[#9b8f79]", "original fret divider color"],
  [fretboard, "from-[#787878] to-[#bbaf9b]", "original string rendering"],
  [fretboard, "FretMarker", "original fret markers"],
  [fretboard, "first:border-l-4 first:border-zinc-300", "original nut line"],
];

const forbidden = [
  [page, "viewMode === \"full\" ? 21 : viewMode === \"diagonal\" ? 8", "compact position fret window"],
  [page, "fretboardStartFret = viewMode === \"full\" ? 0", "position-start fretboard window"],
  [fretboard, "real-electric-guitar", "removed real guitar photo attempts"],
  [fretboard, "backgroundImage", "removed photo background style"],
  [fretboard, "STRING_THICKNESS", "removed later synthetic string thickness tweak"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const presentForbidden = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing original fretboard snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (presentForbidden.length) console.error(`Forbidden real-neck snippets:\n${presentForbidden.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Scale page is back to the original simple fretboard style with full-board position highlight.");
