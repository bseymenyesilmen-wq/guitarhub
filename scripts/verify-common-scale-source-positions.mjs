import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const theory = readFileSync(join(__dirname, "..", "lib", "music-theory.ts"), "utf8");

const requiredSnippets = [
  "COMMON_SCALE_POSITION_INTERVALS",
  "COMMON_SCALE_POSITION_SOURCES",
  "www.guitarscale.org/c-major.html",
  "www.guitarscale.org/c-pentatonic-minor.html",
  "www.fretjam.com/major-scale-positions.html",
  "www.fretjam.com/natural-minor-scale-positions.html",
  "source-backed Common scale positions",
];
const missing = requiredSnippets.filter((snippet) => !theory.includes(snippet));
if (missing.length) {
  console.error(`Missing Common scale source snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

const script = String.raw`
import { getScalePositions, SCALE_FORMULAS } from './lib/music-theory';

const commonIds = SCALE_FORMULAS.filter((scale) => scale.category === 'Common').map((scale) => scale.id);
const expectedCommonIds = [
  'major','harmonic-minor','melodic-minor','natural-minor','pentatonic-major','pentatonic-minor','pentatonic-blues','pentatonic-neutral','ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian','diatonic','diminished','diminished-half','diminished-whole','diminished-whole-tone','dominant-7th','lydian-augmented','lydian-minor','lydian-diminished'
];
if (commonIds.join(',') !== expectedCommonIds.join(',')) throw new Error('Common id list changed: ' + commonIds.join(','));

const expectedStarts = {
  major: '8,10,12,13,3,5,7',
  ionian: '8,10,12,13,3,5,7',
  'natural-minor': '8,10,11,13,3,4,6',
  aeolian: '8,10,11,13,3,4,6',
  dorian: '8,10,11,13,3,5,6',
  phrygian: '8,9,11,13,3,4,6',
  lydian: '8,10,12,2,3,5,7',
  mixolydian: '8,10,12,13,3,5,6',
  locrian: '8,9,11,13,2,4,6',
  'pentatonic-minor': '8,11,13,3,6',
  'pentatonic-major': '8,10,12,3,5',
  'pentatonic-blues': '8,11,13,2,3,6',
};
for (const [scaleId, starts] of Object.entries(expectedStarts)) {
  const actual = getScalePositions('C', scaleId, 'vertical').map((position) => position.startFret).join(',');
  if (actual !== starts) throw new Error(scaleId + ': expected ' + starts + ', got ' + actual);
}
for (const scaleId of commonIds) {
  const positions = getScalePositions('C', scaleId, 'vertical');
  if (positions[0].startFret !== 8) throw new Error(scaleId + ': first Common position must start on C root 8th fret, got ' + positions[0].startFret);
  if (positions.some((position) => position.startFret < 0 || position.startFret > 21)) throw new Error(scaleId + ': position outside 0-21');
}
console.log('Verified source-backed Common scale positions for ' + commonIds.length + ' scales.');
`;
execFileSync('npx', ['tsx', '-e', script], { stdio: 'inherit' });
