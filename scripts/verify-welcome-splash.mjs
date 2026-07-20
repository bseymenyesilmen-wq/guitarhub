import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const layout = readFileSync(join(root, "app", "layout.tsx"), "utf8");
const splash = readFileSync(join(root, "app", "components", "WelcomeSplash.tsx"), "utf8");

const required = [
  [layout, "import { WelcomeSplash }", "layout imports splash"],
  [layout, "<WelcomeSplash />", "layout renders splash after refresh"],
  [splash, "Babayaga", "Babayaga credit"],
  [splash, "Tarafından", "created by credit"],
  [splash, "Yaratıldı.", "created credit final word"],
  [splash, "gh-welcome-splash", "splash class"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(`Missing welcome splash snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Welcome splash with Babayaga credit is restored.");
