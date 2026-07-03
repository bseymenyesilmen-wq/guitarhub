import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "page.tsx"), "utf8");
const widget = readFileSync(join(__dirname, "..", "app", "components", "ChatbotWidget.tsx"), "utf8");

const required = [
  "actionLabel?: string",
  "href?: string",
  "<Link href={href}",
  "href=\"/repertuar\"",
  "href=\"#favoriler\"",
  "href={songs[0] ? `/sarki/${songs[0].id}` : \"/sarki-ara\"}",
  "id=\"favoriler\"",
  "window.addEventListener(\"guitarhub:open-yoda\", openYoda)",
  "window.removeEventListener(\"guitarhub:open-yoda\", openYoda)",
];

const forbidden = [
  "label=\"Yoda\" value=\"Hazır\"",
  "openYodaChat",
  "onClick={openYodaChat}",
];

const haystack = `${page}\n${widget}`;
const missing = required.filter((snippet) => !haystack.includes(snippet));
const presentForbidden = forbidden.filter((snippet) => haystack.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing tappable dashboard snippets:\n${missing.join("\n")}`);
  if (presentForbidden.length) console.error(`Removed Yoda stat snippets still present:\n${presentForbidden.join("\n")}`);
  process.exit(1);
}

console.log("Homepage dashboard cards are tappable without Yoda stat.");
