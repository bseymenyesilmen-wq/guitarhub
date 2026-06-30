import { execFileSync } from "node:child_process";

const script = String.raw`
import { getScalePositions, SCALE_FORMULAS } from './lib/music-theory';

const expected = {
  major: '8,10,12,13,3,5,7',
  'natural-minor': '8,10,11,13,3,4,6',
  dorian: '8,10,11,13,3,5,6',
  'pentatonic-minor': '8,11,13,3,6',
  'pentatonic-major': '8,10,12,3,5',
  blues: '8,11,13,2,3,6',
};

for (const [scaleId, starts] of Object.entries(expected)) {
  const actual = getScalePositions('C', scaleId, 'vertical').map((position) => position.startFret).join(',');
  if (actual !== starts) throw new Error(scaleId + ': expected ' + starts + ', got ' + actual);
}

for (const scale of SCALE_FORMULAS) {
  const positions = getScalePositions('C', scale.id, 'vertical');
  if (!positions.length) throw new Error(scale.id + ': no positions');
  if (positions[0].startFret !== 8) throw new Error(scale.id + ': first position must start from C root on low E, got ' + positions[0].startFret);
  for (const position of positions) {
    if (position.startFret < 0 || position.startFret > 21) throw new Error(scale.id + ': position out of fretboard ' + position.startFret);
    if (position.displayFrets !== 4) throw new Error(scale.id + ': vertical box should be 4 frets');
  }
}

console.log('Verified guitar-position starts for ' + SCALE_FORMULAS.length + ' scales.');
`;

execFileSync('npx', ['tsx', '-e', script], { stdio: 'inherit' });
