import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");

const tuner = read("app", "tuner", "page.tsx");
const nav = read("app", "components", "AppNav.tsx");
const home = read("app", "page.tsx");

const required = [
  [tuner, "export default function TunerPage", "tuner route component"],
  [tuner, "navigator.mediaDevices.getUserMedia", "microphone capture"],
  [tuner, "createAnalyser", "web audio analyser"],
  [tuner, "autoCorrelate", "pitch detection"],
  [tuner, "Standart", "standard tuning"],
  [tuner, "Yarım ses düşük", "half step tuning"],
  [tuner, "Drop D", "drop d tuning"],
  [tuner, "Gevşet · kalınlaştır", "flat/sharp guidance"],
  [tuner, "Sık · incelt", "tighten guidance"],
  [tuner, "Mikrofonu Başlat", "start microphone button"],
  [tuner, "style={{ transform: `translateX(-50%) rotate(${needle}deg)` }}", "interactive needle"],
  [tuner, "Giriş seviyesi", "input level meter"],
  [nav, 'href: "/tuner", label: "Tuner"', "nav tuner link"],
  [nav, "grid-cols-7", "mobile nav 7 columns"],
  [home, 'href="/tuner"', "home tuner action"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(`Missing tuner snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Interactive tuner route and navigation are wired.");
