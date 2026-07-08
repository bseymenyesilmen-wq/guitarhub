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
  [scalePage, "viewMode === \"full\" ? 21 : viewMode === \"diagonal\" ? 8", "non-full views use compact fret windows"],
  [scalePage, "fretboardStartFret", "fretboard starts at selected position"],
  [scalePage, "startFret={fretboardStartFret}", "fretboard receives compact start fret"],
  [scalePage, "max-h-[360px]", "scale list is shorter on mobile"],
  [scalePage, "[&::-webkit-scrollbar]:hidden", "mobile category scrollbar hidden"],
  [fretboard, "const boardMinWidth = Math.max(340, 44 + frets.length * 42);", "fretboard has controlled inner width"],
  [fretboard, "min-w-0 rounded-2xl", "fretboard shell can shrink"],
  [fretboard, "overflow-x-auto", "full fretboard scrolls internally"],
  [fretboard, "style={{ minWidth: boardMinWidth }}", "scroll width is scoped to fretboard"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(`Missing scale mobile optimization snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Scale library is optimized for mobile width and fretboard scrolling.");
