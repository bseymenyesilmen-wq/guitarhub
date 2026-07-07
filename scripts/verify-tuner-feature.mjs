import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(join(__dirname, "..", ...parts), "utf8");

const tuner = read("app", "tuner", "page.tsx");
const css = read("app", "globals.css");
const nav = read("app", "components", "AppNav.tsx");
const home = read("app", "page.tsx");

const required = [
  [tuner, "export default function TunerPage", "tuner route component"],
  [tuner, "navigator.mediaDevices.getUserMedia", "microphone capture"],
  [tuner, "void startTuner();", "auto microphone start"],
  [tuner, "createAnalyser", "web audio analyser"],
  [tuner, "autoCorrelate", "pitch detection"],
  [tuner, "playReferenceTone", "reference string sound"],
  [tuner, "oscillator.frequency.value = frequency", "oscillator note frequency"],
  [tuner, "Standart", "standard tuning"],
  [tuner, "Yarım ses düşük", "half step tuning"],
  [tuner, "Drop D", "drop d tuning"],
  [tuner, "Gevşet · kalınlaştır", "flat/sharp guidance"],
  [tuner, "Sık · incelt", "tighten guidance"],
  [tuner, "gh-pedal", "animated pedal design"],
  [tuner, "gh-neon-ring", "neon tuner ring"],
  [tuner, "gh-led-sweep", "animated led sweep"],
  [tuner, "style={{ transform: `translateX(-50%) rotate(${needle}deg)` }}", "interactive needle"],
  [tuner, "Giriş seviyesi", "input level meter"],
  [css, "@keyframes gh-neon-breathe", "neon animation"],
  [css, "@keyframes gh-ring-ping", "ring pulse animation"],
  [css, "@keyframes gh-led-sweep", "led sweep animation"],
  [nav, 'href: "/tuner", label: "Tuner"', "nav tuner link"],
  [nav, "grid-cols-7", "mobile nav 7 columns"],
  [home, 'href="/tuner"', "home tuner action"],
];
const forbidden = [
  "Mikrofonu Başlat",
  "Mikrofon izni verilmedi veya tarayıcı desteklemiyor.",
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter((snippet) => tuner.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing tuner snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden old tuner copy remains:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Animated auto-mic tuner with reference tones is wired.");
