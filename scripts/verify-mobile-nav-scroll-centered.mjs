import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const nav = readFileSync(join(__dirname, "..", "app", "components", "AppNav.tsx"), "utf8");

const required = [
  "useRef<HTMLDivElement | null>",
  "useRef<HTMLAnchorElement | null>",
  "activeMobileItemRef",
  "container.scrollTo({ left: Math.max(0, nextScrollLeft), behavior: \"smooth\" })",
  "overflow-x-auto overscroll-x-contain",
  "flex min-w-max gap-1",
  "w-[5.65rem] shrink-0",
  "mobileLabel: \"Repertuvar\"",
  "mobileLabel: \"Ara\"",
  "mobileLabel: \"Akorlar\"",
  "mobileLabel: \"Gamlar\"",
  "ref={active ? activeMobileItemRef : null}",
];

const forbidden = ["grid grid-cols-7", "px-[calc((100vw-5.35rem)/2)]"];
const missing = required.filter((snippet) => !nav.includes(snippet));
const bad = forbidden.filter((snippet) => nav.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing centered scroll nav snippets:\n${missing.join("\n")}`);
  if (bad.length) console.error(`Forbidden squeezed nav snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Mobile bottom nav is scrollable again and centers the active Ara item.");
