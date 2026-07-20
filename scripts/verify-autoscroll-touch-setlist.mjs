import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const search = readFileSync(join(root, "app", "sarki-ara", "page.tsx"), "utf8");
const repertuar = readFileSync(join(root, "app", "repertuar", "page.tsx"), "utf8");

const required = [
  [search, "autoScrollRemainderRef", "auto-scroll fractional accumulator"],
  [search, "const scrollStep = Math.floor(autoScrollRemainderRef.current)", "auto-scroll converts accumulated low speeds to pixels"],
  [search, "if (scrollStep < 1) return", "auto-scroll waits until level 1/2 has enough movement"],
  [search, "playTextRef.current.scrollTop += scrollStep", "auto-scroll applies integer movement"],
  [repertuar, "import type { PointerEvent }", "typed pointer events for mobile drag"],
  [repertuar, "data-setlist-song-id={item.id}", "drop targets mark setlist song cards"],
  [repertuar, "findSetlistSongDropTarget", "touch drag finds card under finger"],
  [repertuar, "startTouchSetlistDrag", "touch drag start handler"],
  [repertuar, "moveTouchSetlistDrag", "touch drag move handler"],
  [repertuar, "endTouchSetlistDrag", "touch drag end handler"],
  [repertuar, "touch-none select-none", "mobile drag handle prevents page scrolling while dragging"],
  [repertuar, "☰", "visible mobile drag handle"],
  [repertuar, "void reorderSetlistSong(draggedId, targetId)", "touch drag reuses reorder persistence"],
  [repertuar, "draggable", "desktop drag remains"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(`Missing auto-scroll/touch setlist snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Auto-scroll low speeds and touch setlist dragging are wired.");
