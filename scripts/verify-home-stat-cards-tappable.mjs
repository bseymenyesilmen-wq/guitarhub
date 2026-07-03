import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "page.tsx"), "utf8");
const widget = readFileSync(join(__dirname, "..", "app", "components", "ChatbotWidget.tsx"), "utf8");

const required = [
  "function openYodaChat()",
  "window.dispatchEvent(new CustomEvent(\"guitarhub:open-yoda\"))",
  "actionLabel?: string",
  "href?: string",
  "onClick?: () => void",
  "<Link href={href}",
  "<button type=\"button\" onClick={onClick}",
  "href=\"/repertuar\"",
  "href=\"#favoriler\"",
  "href={songs[0] ? `/sarki/${songs[0].id}` : \"/sarki-ara\"}",
  "onClick={openYodaChat}",
  "id=\"favoriler\"",
  "window.addEventListener(\"guitarhub:open-yoda\", openYoda)",
  "window.removeEventListener(\"guitarhub:open-yoda\", openYoda)",
];

const missing = required.filter((snippet) => !`${page}\n${widget}`.includes(snippet));
if (missing.length) {
  console.error(`Missing tappable dashboard snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Homepage dashboard cards are tappable.");
