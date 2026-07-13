import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");
const layout = read("app", "layout.tsx");
const splash = read("app", "components", "WelcomeSplash.tsx");
const css = read("app", "globals.css");

const required = [
  [layout, "import { WelcomeSplash }", "layout imports splash"],
  [layout, "<WelcomeSplash />", "layout renders splash"],
  [splash, "GuitarHub’a", "title uses GuitarHub’a"],
  [splash, "Hoşgeldin", "title-case welcome"],
  [splash, "Adamım!", "title-case adamım"],
  [splash, "Babayaga", "creator name"],
  [splash, "Tarafından", "title-case tarafından"],
  [splash, "Yaratıldı.", "title-case yaratıldı"],
  [splash, "window.setTimeout(() => setVisible(true), 0)", "shows on every page load"],
  [splash, "gh-welcome-splash", "splash class"],
  [css, ".gh-welcome-splash", "splash CSS"],
  [css, "@keyframes gh-welcome-word", "word animation"],
  [css, "@keyframes gh-welcome-card", "card animation"],
  [css, "gh-welcome-splash--closing", "closing animation"],
];
const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const forbidden = [
  [splash, "sessionStorage", "session-only gate"],
  [splash, "SPLASH_SESSION_KEY", "session-only key"],
];
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing welcome splash snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden welcome splash snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}
console.log("Animated welcome splash is wired on every page load.");
