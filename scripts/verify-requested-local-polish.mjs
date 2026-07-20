import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

const yoda = read("app", "components", "ChatbotWidget.tsx");
const home = read("app", "page.tsx");
const nav = read("app", "components", "AppNav.tsx");
const search = read("app", "sarki-ara", "page.tsx");
const tuner = read("app", "tuner", "page.tsx");
const songwriter = read("app", "sarki-yaz", "page.tsx");
const songApi = read("app", "api", "song-search", "route.ts");
const theory = read("lib", "music-theory.ts");

const required = [
  [yoda, "usePathname", "Yoda can detect auth routes"],
  [yoda, "hideOnAuthScreen", "Yoda hidden on login/register/reset"],
  [yoda, "pathname === \"/giris\"", "Yoda hidden on login"],
  [yoda, "if (hideOnAuthScreen) return null", "Yoda not rendered on auth screens"],
  [theory, "if (hour >= 11 && hour < 18) return \"İyi günler\"", "homepage noon greeting simplified"],
  [home, "w-full max-w-6xl overflow-hidden rounded-[2rem]", "homepage shell clips square overflow"],
  [nav, "overflow-hidden rounded-[1.5rem]", "mobile top nav clips square overflow"],
  [search, "SEARCH_RESULTS_STATE_KEY", "song search result state persistence"],
  [search, "readSearchResultsState", "restore last song search"],
  [search, "writeSearchResultsState", "persist last song search"],
  [search, "slowScrollToElement", "slow custom scroll helper"],
  [search, "const AUTO_SCROLL_INTERVAL_MS = 120", "stage auto-scroll interval slow but responsive"],
  [search, "AUTO_SCROLL_STEP_MULTIPLIER = 0.55", "stage auto-scroll low levels move"],
  [search, "const [autoScrollLevel, setAutoScrollLevel] = useState(1)", "stage auto-scroll default is slow"],
  [search, "durationMs = 1300, topOffset = 24", "search result scroll lands slightly lower"],
  [search, "searchResultsRef", "search result scroll target"],
  [search, "songDetailRef", "song detail scroll target"],
  [search, "returnToSearchResults", "detail back restores last search"],
  [search, "slowScrollToElement(searchResultsRef.current, 1400)", "search scrolls slowly to results"],
  [search, "slowScrollToElement(providerChoicesRef.current, 1200)", "variant scroll slowed"],
  [songApi, "forcedCoverForSong", "specific bad-cover override"],
  [songApi, "normalizeText(artist) === \"duman\" && normalizeText(title) === \"balik\"", "Duman Balık cover override"],
  [tuner, "<h1 className=\"gh-title relative z-10 text-4xl", "tuner hero without neon kicker"],
  [songwriter, "SUGGESTION_TYPES", "songwriter suggestion types still exist"],
];

const forbidden = [
  [theory, "İyi öğlenler", "old noon greeting"],
  [tuner, "Neon pedal tuner", "removed tuner kicker"],
  [tuner, "absolute left-[13%] top-8", "removed upper Gevşet label"],
  [tuner, "absolute right-[15%] top-8", "removed upper Sık label"],
  [songwriter, "Sözleri güçlendir", "removed songwriter polish option from UI"],
  [songwriter, "polish-lyrics", "removed songwriter polish option value from UI"],
  [search, "scrollIntoView({ behavior: \"smooth\"", "old fast native result scroll"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing requested polish snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden requested polish snippets:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Requested local polish fixes are wired without publishing.");
