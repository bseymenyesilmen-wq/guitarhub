import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const packageJson = readFileSync(join(root, "package.json"), "utf8");
const componentPath = join(root, "app", "components", "AlphaTabPlayer.tsx");
const component = existsSync(componentPath) ? readFileSync(componentPath, "utf8") : "";
const detail = readFileSync(join(root, "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");
const types = readFileSync(join(root, "lib", "types.ts"), "utf8");

const required = [
  [packageJson, "@coderline/alphatab"],
  [component, "AlphaTabApi"],
  [component, "import(\"@coderline/alphatab\")"],
  [component, "enablePlayer: true"],
  [component, "soundFont"],
  [component, "playPause"],
  [component, "playbackSpeed"],
  [component, "Guitar Pro Player"],
  [component, "fileUrl"],
  [detail, "AlphaTabPlayer"],
  [detail, "gp_file_url"],
  [detail, "setGpFileUrl"],
  [detail, "GP dosyası URL"],
  [detail, "<AlphaTabPlayer fileUrl={gpFileUrl}"],
  [types, "gp_file_url?: string | null"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing AlphaTab player snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("AlphaTab Guitar Pro player is wired.");
