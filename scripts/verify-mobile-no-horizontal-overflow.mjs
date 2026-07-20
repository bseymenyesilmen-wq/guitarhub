import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

const search = read("app", "sarki-ara", "page.tsx");
const nav = read("app", "components", "AppNav.tsx");
const css = read("app", "globals.css");

const required = [
  [search, "w-full overflow-x-hidden", "song search page blocks horizontal overflow"],
  [search, "line-clamp-2", "long song titles wrap/clamp"],
  [search, "break-words", "long song titles break safely"],
  [search, "group flex w-full min-w-0", "song cards cannot widen page"],
  [search, "min-w-0 overflow-hidden rounded-[1.75rem]", "result panels clip rounded corners"],
  [nav, "overflow-x-auto", "bottom nav is intentionally horizontally scrollable"],
  [nav, "container.scrollTo({ left: Math.max(0, nextScrollLeft), behavior: \"smooth\" })", "active nav item is centered without layout padding"],
  [css, "overflow-x: hidden", "global horizontal overflow guard"],
  [css, "box-sizing: border-box", "global box sizing guard"],
];

const forbidden = [
  [nav, "grid grid-cols-7", "squeezed non-scroll bottom nav"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing no-horizontal-overflow snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden horizontal-overflow snippets:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Mobile horizontal overflow and long song titles are guarded.");
