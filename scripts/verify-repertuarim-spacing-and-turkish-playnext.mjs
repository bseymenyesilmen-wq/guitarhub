import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const viewer = readFileSync(join(__dirname, "..", "app", "components", "ChordTextViewer.tsx"), "utf8");
const route = readFileSync(join(__dirname, "..", "app", "api", "song-search", "route.ts"), "utf8");

const viewerRequired = [
  'fontFamily: "Arial, Helvetica, sans-serif"',
  'whiteSpace: "pre"',
  'style={{ font: "inherit" }}',
];
const viewerForbidden = ["ui-monospace", "SFMono-Regular", "Courier New"];
const viewerMissing = viewerRequired.filter((snippet) => !viewer.includes(snippet));
const viewerBad = viewerForbidden.filter((snippet) => viewer.includes(snippet));
if (viewerMissing.length || viewerBad.length) {
  console.error(`Repertuarım spacing viewer problem:\nmissing=${viewerMissing.join("\n")}\nforbidden=${viewerBad.join("\n")}`);
  process.exit(1);
}

const routeRequired = [
  "function rotateRecommendationSeeds",
  "Dolu Kadehi Ters Tut",
  "Son Feci Bisiklet",
  "Kaan Tangöze",
  "Halil Sezai",
  "Pilli Bebek",
  "Oguzhan Koc",
  "const querySeeds = rotateRecommendationSeeds",
];
const routeMissing = routeRequired.filter((snippet) => !route.includes(snippet));
if (routeMissing.length) {
  console.error(`Turkish Play Next rotation problem:\n${routeMissing.join("\n")}`);
  process.exit(1);
}

console.log("Repertuarım spacing and Turkish Play Next rotation hooks are present.");
