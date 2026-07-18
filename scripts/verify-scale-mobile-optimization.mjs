import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scalePage = readFileSync(join(__dirname, "..", "app", "gam-kutuphanesi", "page.tsx"), "utf8");
const fretboard = readFileSync(join(__dirname, "..", "app", "components", "Fretboard.tsx"), "utf8");

const required = [
  [scalePage, "overflow-x-hidden p-3 pb-32", "page prevents horizontal body overflow on mobile"],
  [scalePage, "mx-auto w-full max-w-6xl", "page uses full mobile width"],
  [scalePage, "min-w-0 gap-3", "grid children can shrink on mobile"],
  [scalePage, "const displayFrets = 21", "all scale views keep full 0-21 fretboard"],
  [scalePage, "const fretboardStartFret = 0", "fretboard always starts from open position"],
  [scalePage, "startFret={fretboardStartFret}", "fretboard receives full-board start fret"],
  [scalePage, "max-h-[360px]", "scale list is shorter on mobile"],
  [scalePage, "[&::-webkit-scrollbar]:hidden", "mobile category scrollbar hidden"],
  [scalePage, "grid min-w-0 overflow-hidden gap-3", "control shell clips overflowing mobile pills"],
  [scalePage, "<h2 className=\"text-base font-black sm:text-lg\">Root nota</h2>", "root heading has no step number"],
  [scalePage, "<h2 className=\"text-base font-black sm:text-lg\">Gam / Mod</h2>", "scale heading has no step number"],
  [scalePage, "<h3 className=\"font-black\">Görünüm</h3>", "view heading has no step number"],
  [scalePage, "<h3 className=\"font-black\">Pozisyon çalış</h3>", "position heading has no step number"],
  [scalePage, "min-w-0 overflow-hidden", "control columns can shrink and clip overflow"],
  [scalePage, "w-full max-w-full gap-2 overflow-x-auto", "scroll rows stay inside card width"],
  [scalePage, "min-h-14 w-28 shrink-0 rounded-2xl", "view mode buttons have compact mobile pill width"],
  [fretboard, "const fretCellWidth = frets.length > 12 ? 42 : 34;", "full board uses controlled fret cell width"],
  [fretboard, "const boardMinWidth = Math.max(318, 42 + frets.length * fretCellWidth);", "fretboard has controlled inner width"],
  [fretboard, "min-w-0 rounded-2xl", "fretboard shell can shrink"],
  [fretboard, "overflow-x-auto", "full fretboard scrolls internally"],
  [fretboard, "style={{ minWidth: boardMinWidth }}", "scroll width is scoped to fretboard"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const forbidden = ["1. Root nota", "2. Gam / Mod", "3. Görünüm", "4. Pozisyon çalış"];
const bad = forbidden.filter((snippet) => scalePage.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing scale mobile optimization snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden numbered scale headings remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Scale library keeps a full 0-21 fretboard while staying mobile-scroll safe.");
