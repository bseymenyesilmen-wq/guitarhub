import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const looper = readFileSync(join(__dirname, "..", "app", "looper", "page.tsx"), "utf8");
const nav = readFileSync(join(__dirname, "..", "app", "components", "AppNav.tsx"), "utf8");

const required = [
  [nav, 'href: "/looper", label: "Looper"', "looper nav item"],
  [looper, 'type LooperStatus = "empty" | "count-in" | "recording" | "playing" | "stopped" | "overdub-armed" | "overdubbing"', "looper states"],
  [looper, "COUNT_IN_OPTIONS = [1, 2, 4]", "count-in options"],
  [looper, "Tap Tempo", "tap tempo UI"],
  [looper, "metronomeVolume", "metronome volume"],
  [looper, "navigator.mediaDevices.getUserMedia", "microphone recording"],
  [looper, "new MediaRecorder", "MediaRecorder layer capture"],
  [looper, "nextLoopDelayMs", "next-cycle overdub scheduling"],
  [looper, "overdub-armed", "overdub armed status"],
  [looper, "loopDuration * 1000", "overdub records one loop length"],
  [looper, "Volume", "layer volume control"],
  [looper, "Mute", "layer mute control"],
  [looper, "Solo", "layer solo control"],
  [looper, "Delete", "layer delete control"],
  [looper, "UNDO", "undo button"],
  [looper, "REDO", "redo button"],
  [looper, "CLEAR", "clear button"],
  [looper, "My Loops", "saved loops section"],
  [looper, "saveLoopBlobs", "IndexedDB blob save"],
  [looper, "SpeechRecognition", "voice command support"],
  [looper, "tr-TR", "Turkish speech recognition"],
  [looper, "kayıt başlat", "Turkish record command"],
  [looper, "overdub başlat", "Turkish overdub command"],
  [looper, "son katmanı sil", "Turkish undo command"],
  [looper, "wakeLock", "stage mode wake lock"],
  [looper, "Sahne Modu", "stage mode UI"],
  [looper, "● RECORD", "large record button"],
  [looper, "⊕ OVERDUB", "large overdub button"],
  [looper, "▶ PLAY", "large play button"],
  [looper, "■ STOP", "large stop button"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
if (missing.length) {
  console.error(`Missing looper snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Professional GuitarHub looper feature is wired.");
