import { execFileSync } from "node:child_process";

const script = String.raw`
import { getScalePositions, SCALE_FORMULAS } from './lib/music-theory';

const expectedMinorPentRoots = {
  C: 8,
  'C#': 9,
  D: 10,
  'D#': 11,
  E: 12,
  F: 1,
  'F#': 2,
  G: 3,
  'G#': 4,
  A: 5,
  'A#': 6,
  B: 7,
};

for (const [root, expected] of Object.entries(expectedMinorPentRoots)) {
  const first = getScalePositions(root, 'pentatonic-minor', 'vertical')[0]?.startFret;
  if (first !== expected) throw new Error(root + ' minor pentatonic 1st position expected low-E root ' + expected + ', got ' + first);
}

const roots = Object.keys(expectedMinorPentRoots);
for (const root of roots) {
  for (const scale of SCALE_FORMULAS.filter((item) => item.category === 'Common')) {
    const first = getScalePositions(root, scale.id, 'vertical')[0]?.startFret;
    const expected = expectedMinorPentRoots[root];
    if (first !== expected) throw new Error(root + ' ' + scale.id + ' first position expected ' + expected + ', got ' + first);
    if (first > 12) throw new Error(root + ' ' + scale.id + ' first position must stay at/before 12th fret, got ' + first);
  }
}

console.log('Verified low-E first-position roots before/at 12th fret for all roots and Common scales.');
`;

execFileSync('npx', ['tsx', '-e', script], { stdio: 'inherit' });
