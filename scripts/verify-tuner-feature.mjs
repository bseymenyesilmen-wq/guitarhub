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
  [tuner, "type MicStatus = \"opening\" | \"ready\" | \"suspended\" | \"blocked\"", "explicit microphone status"],
  [tuner, "void startTuner();", "auto microphone start"],
  [tuner, "window.addEventListener(\"pointerdown\", resumeOnGesture", "mobile gesture resume"],
  [tuner, "Dokun · sesi aç", "suspended audio context UI"],
  [tuner, "Mic hazır", "ready microphone UI"],
  [tuner, "Sinyal yok", "no signal indicator"],
  [tuner, "createAnalyser", "web audio analyser"],
  [tuner, "autoCorrelate", "pitch detection"],
  [tuner, "playReferenceTone", "reference string sound"],
  [tuner, "oscillator.frequency.value = frequency", "oscillator note frequency"],
  [tuner, "autoDetect", "auto/manual string mode"],
  [tuner, "Otomatik", "automatic string label"],
  [tuner, "Manuel", "manual string label"],
  [tuner, "completedStrings", "completed strings state"],
  [tuner, "Gitar hazır", "all strings ready status"],
  [tuner, "tuningPickerOpen", "sliding tuning picker state"],
  [tuner, "setTuningPickerOpen((open) => !open)", "toggle tuning popup"],
  [tuner, "max-h-80 translate-y-0 opacity-100", "open tuning popup animation"],
  [tuner, "pointer-events-none max-h-0 -translate-y-2 opacity-0", "closed tuning popup animation"],
  [tuner, "setTuningPickerOpen(false)", "close tuning popup after selection"],
  [tuner, "relative z-20", "tuning popup overlay stacking"],
  [tuner, "D Standard", "d standard tuning"],
  [tuner, "Drop C", "drop c tuning"],
  [tuner, "DADGAD", "dadgad tuning"],
  [tuner, "Open G", "open g tuning"],
  [tuner, "Open D", "open d tuning"],
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
  [nav, "overflow-x-auto", "mobile nav horizontal scroll"],
  [nav, "w-[4.35rem] shrink-0", "mobile nav fixed item width"],
  [home, 'href="/tuner"', "home tuner action"],
];
const forbidden = [
  "Sayfa açılınca mikrofon otomatik dinler. Tel butonuna basınca referans sesi gelir; gitarını ona göre eşleştir.",
  "Mikrofonu Başlat",
  "Mikrofon izni verilmedi veya tarayıcı desteklemiyor.",
  "Gitar kafa",
  "grid-cols-7",
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const joined = `${tuner}\n${nav}`;
const bad = forbidden.filter((snippet) => joined.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing tuner snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden old tuner/nav copy remains:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Tuner dropdown cleanup and scroll-safe mobile nav are wired.");
