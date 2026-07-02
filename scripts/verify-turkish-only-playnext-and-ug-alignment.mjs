import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");
const viewer = readFileSync(join(__dirname, "..", "app", "components", "ChordTextViewer.tsx"), "utf8");
const searchPage = readFileSync(join(__dirname, "..", "app", "sarki-ara", "page.tsx"), "utf8");

const routeRequired = [
  "const TURKISH_ARTIST_MARKERS",
  "function isKnownTurkishArtist",
  "function isTurkishSongContext",
  "function isTurkishRecommendation",
  "async function searchProviderRecommendationCandidates",
  "function isUnknownArtistName",
  "function sortRecommendationCandidates",
  "const candidates = await searchProviderRecommendationCandidates(seed, currentProvider)",
  "if (!isForeign && !isTurkishRecommendation(candidate)) continue",
  "Pilli Bebek",
  "Halil Sezai",
  "Dedublüman",
  "Son Feci Bisiklet",
];

const routeForbidden = [
  "const recommendations: SongSearchListItem[] = isForeign ? [...existing] : []",
];

const viewerRequired = [
  "sourceProvider?: string",
  "isMonospaceSource",
  "Ultimate Guitar",
  "ui-monospace",
  "Arial, Helvetica, sans-serif",
];

const pageRequired = [
  "sourceProvider={result.provider}",
];

const missing = [
  ...routeRequired.filter((snippet) => !route.includes(snippet)).map((snippet) => `route:${snippet}`),
  ...viewerRequired.filter((snippet) => !viewer.includes(snippet)).map((snippet) => `viewer:${snippet}`),
  ...pageRequired.filter((snippet) => !searchPage.includes(snippet)).map((snippet) => `page:${snippet}`),
];
const forbidden = routeForbidden.filter((snippet) => route.includes(snippet));

if (missing.length || forbidden.length) {
  console.error(`Turkish-only Play Next / UG alignment regression:\nmissing=${missing.join("\n")}\nforbidden=${forbidden.join("\n")}`);
  process.exit(1);
}
console.log("Turkish-only Play Next and Ultimate Guitar alignment hooks are present.");
