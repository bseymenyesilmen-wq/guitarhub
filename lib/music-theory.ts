export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export type NoteName = (typeof NOTE_NAMES)[number];
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ChordPosition = {
  id: string;
  name: string;
  frets: Array<number | "x">; // low E -> high E
  fingers: number[];
  baseFret: number;
  barre?: { fret: number; fromString: number; toString: number; finger: 1 | 2 | 3 | 4 };
  difficulty: Difficulty;
  hint: string;
};

export type ChordDefinition = {
  name: string;
  root: string;
  family: string;
  formula: string[];
  notes: string[];
  positions: ChordPosition[];
  aliases?: string[];
};

export type ScaleDefinition = {
  id: string;
  name: string;
  category: string;
  formula: string[];
  character: string;
  genres: string[];
};

export type FretboardNote = {
  stringNumber: number;
  stringName: string;
  fret: number;
  note: string;
  interval?: string;
  inScale: boolean;
  isRoot: boolean;
};

const INTERVAL_STEPS: Record<string, number> = {
  "1": 0,
  b2: 1,
  "2": 2,
  b3: 3,
  "3": 4,
  "4": 5,
  "#4": 6,
  b5: 6,
  "5": 7,
  "#5": 8,
  b6: 8,
  "6": 9,
  bb7: 9,
  b7: 10,
  "7": 11,
  "9": 2,
  "11": 5,
  "13": 9,
};

export const CHORD_FORMULAS: Record<string, { label: string; formula: string[] }> = {
  major: { label: "Major", formula: ["1", "3", "5"] },
  minor: { label: "Minor", formula: ["1", "b3", "5"] },
  "7": { label: "7", formula: ["1", "3", "5", "b7"] },
  maj7: { label: "Maj7", formula: ["1", "3", "5", "7"] },
  min7: { label: "Min7", formula: ["1", "b3", "5", "b7"] },
  dim: { label: "Dim", formula: ["1", "b3", "b5"] },
  aug: { label: "Aug", formula: ["1", "3", "#5"] },
  sus2: { label: "Sus2", formula: ["1", "2", "5"] },
  sus4: { label: "Sus4", formula: ["1", "4", "5"] },
  add9: { label: "Add9", formula: ["1", "3", "5", "9"] },
  "6": { label: "6", formula: ["1", "3", "5", "6"] },
  "9": { label: "9", formula: ["1", "3", "5", "b7", "9"] },
  "11": { label: "11", formula: ["1", "3", "5", "b7", "9", "11"] },
  "13": { label: "13", formula: ["1", "3", "5", "b7", "9", "11", "13"] },
};

export const SCALE_FORMULAS: ScaleDefinition[] = [
  { id: "major", name: "Major / Ionian", category: "Major", formula: ["1", "2", "3", "4", "5", "6", "7"], character: "Parlak, merkezli ve mutlu.", genres: ["Pop", "Rock", "Folk"] },
  { id: "minor", name: "Natural Minor / Aeolian", category: "Minor", formula: ["1", "2", "b3", "4", "5", "b6", "b7"], character: "Karanlık ve hüzünlü.", genres: ["Rock", "Metal", "Pop ballad"] },
  { id: "pentatonic-major", name: "Pentatonic Major", category: "Pentatonik", formula: ["1", "2", "3", "5", "6"], character: "Country/blues tadında güvenli major ses.", genres: ["Country", "Blues", "Rock"] },
  { id: "pentatonic-minor", name: "Pentatonic Minor", category: "Pentatonik", formula: ["1", "b3", "4", "5", "b7"], character: "Solo için en pratik blues-rock havuzu.", genres: ["Blues", "Rock", "Metal"] },
  { id: "blues", name: "Blues", category: "Blues", formula: ["1", "b3", "4", "b5", "5", "b7"], character: "Kirli, gergin ve cevaplı blues hissi.", genres: ["Blues", "Rock", "Jazz"] },
  { id: "harmonic-minor", name: "Harmonic Minor", category: "Minor", formula: ["1", "2", "b3", "4", "5", "b6", "7"], character: "Klasik, dramatik ve doğu tınılı.", genres: ["Metal", "Klasik", "Fusion"] },
  { id: "melodic-minor", name: "Melodic Minor", category: "Minor", formula: ["1", "2", "b3", "4", "5", "6", "7"], character: "Minor ama modern/jazz rengi güçlü.", genres: ["Jazz", "Fusion"] },
  { id: "dorian", name: "Dorian", category: "Mod", formula: ["1", "2", "b3", "4", "5", "6", "b7"], character: "Minor ama umutlu; min7 vamp üstünde çok güçlü.", genres: ["Jazz", "Blues", "Fusion", "Rock"] },
  { id: "phrygian", name: "Phrygian", category: "Mod", formula: ["1", "b2", "b3", "4", "5", "b6", "b7"], character: "Karanlık, İspanyol/Doğu tınısı.", genres: ["Flamenco", "Metal"] },
  { id: "lydian", name: "Lydian", category: "Mod", formula: ["1", "2", "3", "#4", "5", "6", "7"], character: "Rüya gibi, havada ve sinematik.", genres: ["Film", "Fusion", "Progressive"] },
  { id: "mixolydian", name: "Mixolydian", category: "Mod", formula: ["1", "2", "3", "4", "5", "6", "b7"], character: "Major ama bluesy/rock; dominant duygu.", genres: ["Blues", "Rock", "Funk"] },
  { id: "locrian", name: "Locrian", category: "Mod", formula: ["1", "b2", "b3", "4", "b5", "b6", "b7"], character: "Dengesiz, gerilimli; m7b5 üstünde kullanılır.", genres: ["Jazz", "Metal", "Deneysel"] },
];

export const OPEN_STRING_NOTES_LOW_TO_HIGH = ["E", "A", "D", "G", "B", "E"];

const POSITION_LIBRARY: Record<string, ChordPosition[]> = {
  A: [{ id: "a-open", name: "Açık pozisyon", frets: ["x", 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1, difficulty: "beginner", hint: "3 parmağı aynı perdeye sıkıştırmadan temiz bas." }],
  Am: [{ id: "am-open", name: "Açık pozisyon", frets: ["x", 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1, difficulty: "beginner", hint: "İşaret parmağı B telinde net duyulmalı." }],
  A7: [{ id: "a7-open", name: "Açık dominant", frets: ["x", 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], baseFret: 1, difficulty: "beginner", hint: "Blues ve rock geçişlerinde çok kullanılır." }],
  Am7: [{ id: "am7-open", name: "Açık min7", frets: ["x", 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], baseFret: 1, difficulty: "beginner", hint: "Am’den yüzük parmağını kaldırarak hızlı geçiş yap." }],
  Amaj7: [{ id: "amaj7-open", name: "Açık maj7", frets: ["x", 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], baseFret: 1, difficulty: "intermediate", hint: "Yumuşak/jazzy major renk verir." }],
  Asus4: [{ id: "asus4-open", name: "Açık sus4", frets: ["x", 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1, difficulty: "beginner", hint: "A akoruna çözülünce güçlü asılı kalma hissi verir." }],
  Aadd9: [{ id: "aadd9-open", name: "Açık add9", frets: ["x", 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], baseFret: 1, difficulty: "beginner", hint: "Modern pop ve worship tınısı için güzel." }],
  "A/C#": [{ id: "a-csharp", name: "Slash chord", frets: ["x", 4, 2, 2, 2, 0], fingers: [0, 3, 1, 1, 1, 0], baseFret: 1, difficulty: "intermediate", hint: "Bas notası C# olduğu için yürüyen baslarda işe yarar." }],
  F: [{ id: "f-barre", name: "E-shape barre", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "Barre parmağını hafif yana yatır; bileği kasma." }],
  "F#m": [{ id: "fsharpm-barre", name: "E-shape minor barre", frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "F#m için en standart pozisyon; tüm telleri temiz duyurmaya çalış." }],
  "F#m7": [{ id: "fsharpm7-barre", name: "E-shape min7 barre", frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "Min7 rengi için D telindeki 4. perde yeterli." }],
  Bm7: [{ id: "bm7-barre", name: "A-shape min7 barre", frets: ["x", 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 5, finger: 1 }, difficulty: "intermediate", hint: "A telinden başlat; düşük E telini sustur." }],
  "G#dim": [{ id: "gsharpdim", name: "Dim pozisyon", frets: [4, "x", 3, 4, 3, "x"], fingers: [2, 0, 1, 4, 3, 0], baseFret: 3, difficulty: "advanced", hint: "Dim akorlar geçiş ve gerilim için kısa kullanılınca etkili olur." }],
};

export function noteFromInterval(root: string, interval: string) {
  const rootIndex = NOTE_NAMES.indexOf(root as NoteName);
  const step = INTERVAL_STEPS[interval];
  if (rootIndex === -1 || step === undefined) return root;
  return NOTE_NAMES[(rootIndex + step) % NOTE_NAMES.length];
}

export function buildNotes(root: string, formula: string[]) {
  return formula.map((interval) => noteFromInterval(root, interval));
}

const E_STRING_FRET: Record<string, number> = { E: 0, F: 1, "F#": 2, G: 3, "G#": 4, A: 5, "A#": 6, B: 7, C: 8, "C#": 9, D: 10, "D#": 11 };
const A_STRING_FRET: Record<string, number> = { A: 0, "A#": 1, B: 2, C: 3, "C#": 4, D: 5, "D#": 6, E: 7, F: 8, "F#": 9, G: 10, "G#": 11 };

const QUALITY_SUFFIX: Record<string, string> = {
  major: "",
  minor: "m",
  "7": "7",
  maj7: "maj7",
  min7: "m7",
  dim: "dim",
  aug: "aug",
  sus2: "sus2",
  sus4: "sus4",
  add9: "add9",
  "6": "6",
  "9": "9",
  "11": "11",
  "13": "13",
};

function difficultyForFret(fret: number): Difficulty {
  if (fret <= 0) return "beginner";
  if (fret <= 5) return "intermediate";
  return "advanced";
}

function eShapePosition(root: string, quality: string): ChordPosition {
  const fret = E_STRING_FRET[root];
  const baseFret = Math.max(1, fret);
  const minorLike = quality === "minor" || quality === "min7";
  const seventh = quality === "7" || quality === "min7" || quality === "9" || quality === "11" || quality === "13";
  const frets: Array<number | "x"> = minorLike
    ? [fret, fret + 2, seventh ? fret : fret + 2, fret, fret, fret]
    : [fret, fret + 2, seventh ? fret : fret + 2, fret + 1, fret, fret];

  return {
    id: `${root}-${quality}-e-shape`,
    name: fret === 0 ? "Açık E-shape" : "E-shape barre",
    frets,
    fingers: fret === 0 ? [0, 2, seventh ? 0 : 3, minorLike ? 0 : 1, 0, 0] : [1, 3, seventh ? 1 : 4, minorLike ? 1 : 2, 1, 1],
    baseFret,
    barre: fret > 0 ? { fret, fromString: 1, toString: 6, finger: 1 } : undefined,
    difficulty: difficultyForFret(fret),
    hint: fret === 0 ? "Açık pozisyon; telleri tek tek temiz kontrol et." : "Barre parmağını hafif yana yatır; başparmağı sapın arkasında tut.",
  };
}

function aShapePosition(root: string, quality: string): ChordPosition {
  const fret = A_STRING_FRET[root];
  const baseFret = Math.max(1, fret);
  const minorLike = quality === "minor" || quality === "min7";
  const seventh = quality === "7" || quality === "min7" || quality === "9" || quality === "11" || quality === "13";
  const frets: Array<number | "x"> = minorLike
    ? ["x", fret, fret + 2, fret + 2, seventh ? fret + 1 : fret + 1, fret]
    : ["x", fret, fret + 2, seventh ? fret : fret + 2, fret + 2, fret];

  return {
    id: `${root}-${quality}-a-shape`,
    name: fret === 0 ? "Açık A-shape" : "A-shape barre",
    frets,
    fingers: fret === 0 ? [0, 0, 2, seventh ? 0 : 3, minorLike ? 1 : 4, 0] : [0, 1, 3, seventh ? 1 : 3, minorLike ? 2 : 3, 1],
    baseFret,
    barre: fret > 0 ? { fret, fromString: 1, toString: 5, finger: 1 } : undefined,
    difficulty: difficultyForFret(fret),
    hint: "A telinden başlat; düşük E telini sustur. Aynı akorun farklı tınısını verir.",
  };
}

function compactPosition(root: string, quality: string): ChordPosition {
  const fret = Math.max(1, A_STRING_FRET[root]);
  return {
    id: `${root}-${quality}-compact`,
    name: "Kompakt pozisyon",
    frets: ["x", fret, fret + 1, fret + 2, fret + 1, "x"],
    fingers: [0, 1, 2, 4, 3, 0],
    baseFret: fret,
    difficulty: "advanced",
    hint: "Kompakt renk pozisyonu; özellikle dim/aug ve caz renklerinde kısa geçiş için kullan.",
  };
}

function generatedPositions(root: string, quality: string) {
  if (quality === "dim" || quality === "aug") return [compactPosition(root, quality), eShapePosition(root, quality)];
  return [eShapePosition(root, quality), aShapePosition(root, quality)];
}

export function buildChord(name: string, root: string, formulaKey: keyof typeof CHORD_FORMULAS, family?: string): ChordDefinition {
  const formula = CHORD_FORMULAS[formulaKey].formula;
  const existing = POSITION_LIBRARY[name] ?? [];
  const generated = generatedPositions(root, String(formulaKey)).filter(
    (position) => !existing.some((item) => item.id === position.id),
  );

  return {
    name,
    root,
    family: family ?? CHORD_FORMULAS[formulaKey].label,
    formula,
    notes: buildNotes(root, formula),
    positions: [...existing, ...generated].slice(0, 3),
  };
}

const CORE_CHORDS = NOTE_NAMES.flatMap((root) =>
  (["major", "minor", "7", "maj7", "min7", "dim", "aug", "sus2", "sus4", "add9", "6", "9"] as const).map((quality) =>
    buildChord(`${root}${QUALITY_SUFFIX[quality]}`, root, quality, quality === "7" ? "Dominant 7" : undefined),
  ),
);

const SLASH_CHORDS = [
  buildChord("A/C#", "A", "major", "Slash Chord"),
  buildChord("C/E", "C", "major", "Slash Chord"),
  buildChord("D/F#", "D", "major", "Slash Chord"),
  buildChord("G/B", "G", "major", "Slash Chord"),
  buildChord("F/A", "F", "major", "Slash Chord"),
];

export const CHORD_LIBRARY: ChordDefinition[] = [...CORE_CHORDS, ...SLASH_CHORDS];

export function getScaleNotes(root: string, scaleId: string) {
  const scale = SCALE_FORMULAS.find((item) => item.id === scaleId) ?? SCALE_FORMULAS[0];
  return scale.formula.map((interval) => ({ interval, note: noteFromInterval(root, interval) }));
}

function transposeBySemitones(note: string, semitones: number) {
  const rootIndex = NOTE_NAMES.indexOf(note as NoteName);
  if (rootIndex === -1) return note;
  return NOTE_NAMES[(rootIndex + semitones) % NOTE_NAMES.length];
}

export function buildFretboard(root: string, scaleId: string, frets = 12): FretboardNote[] {
  const scaleNotes = getScaleNotes(root, scaleId);
  const intervalByNote = new Map(scaleNotes.map((item) => [item.note, item.interval]));

  return OPEN_STRING_NOTES_LOW_TO_HIGH.flatMap((stringName, stringIndex) =>
    Array.from({ length: frets + 1 }, (_, fret) => {
      const note = transposeBySemitones(stringName, fret % NOTE_NAMES.length);
      const interval = intervalByNote.get(note);
      return {
        stringNumber: 6 - stringIndex,
        stringName,
        fret,
        note,
        interval,
        inScale: Boolean(interval),
        isRoot: note === root,
      };
    }),
  );
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "Günaydın";
  if (hour >= 11 && hour < 15) return "İyi öğlenler";
  if (hour >= 15 && hour < 18) return "İyi günler";
  if (hour >= 18 && hour < 23) return "İyi akşamlar";
  return "İyi geceler";
}
