import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");

const files = {
  css: read("app", "globals.css"),
  home: read("app", "page.tsx"),
  search: read("app", "sarki-ara", "page.tsx"),
  repertuar: read("app", "repertuar", "page.tsx"),
  songwriter: read("app", "sarki-yaz", "page.tsx"),
  chords: read("app", "akor-kutuphanesi", "page.tsx"),
  scales: read("app", "gam-kutuphanesi", "page.tsx"),
  tuner: read("app", "tuner", "page.tsx"),
};

const required = [
  [files.css, ".gh-page", "global page background"],
  [files.css, ".gh-hero", "global hero card"],
  [files.css, ".gh-title", "global title style"],
  [files.css, ".gh-card", "global card style"],
  [files.home, "gh-hero", "home hero"],
  [files.search, "gh-hero", "song search hero"],
  [files.repertuar, "gh-hero", "repertuar hero"],
  [files.songwriter, "gh-hero", "songwriter hero"],
  [files.chords, "gh-hero", "chord library hero"],
  [files.scales, "gh-hero", "scale library hero"],
  [files.tuner, "gh-hero", "tuner hero"],
  [files.tuner, "gh-title", "tuner title style"],
  [files.repertuar, "gh-section-title text-2xl", "repertuar selected setlist title polish"],
  [files.songwriter, "gh-section-title text-xl", "songwriter notebook title polish"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(`Missing visual polish snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Global typography, spacing and card polish is wired.");
