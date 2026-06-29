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

export function buildChord(name: string, root: string, formulaKey: keyof typeof CHORD_FORMULAS, family?: string): ChordDefinition {
  const formula = CHORD_FORMULAS[formulaKey].formula;
  return {
    name,
    root,
    family: family ?? CHORD_FORMULAS[formulaKey].label,
    formula,
    notes: buildNotes(root, formula),
    positions: POSITION_LIBRARY[name] ?? [{ id: `${name}-movable`, name: "Teori pozisyonu", frets: ["x", "x", "x", "x", "x", "x"], fingers: [0, 0, 0, 0, 0, 0], baseFret: 1, difficulty: "advanced", hint: "Bu akor için pozisyon verisi sonraki güncellemede genişletilecek." }],
  };
}

export const CHORD_LIBRARY: ChordDefinition[] = [
  buildChord("A", "A", "major"),
  buildChord("Am", "A", "minor"),
  buildChord("A7", "A", "7", "Dominant 7"),
  buildChord("Am7", "A", "min7"),
  buildChord("Amaj7", "A", "maj7"),
  buildChord("Asus4", "A", "sus4"),
  buildChord("Aadd9", "A", "add9"),
  buildChord("A/C#", "A", "major", "Slash Chord"),
  buildChord("F", "F", "major", "Barre Chord"),
  buildChord("F#m", "F#", "minor", "Barre Chord"),
  buildChord("F#m7", "F#", "min7"),
  buildChord("Bm7", "B", "min7"),
  buildChord("G#dim", "G#", "dim"),
  buildChord("C", "C", "major"),
  buildChord("D", "D", "major"),
  buildChord("Dm", "D", "minor"),
  buildChord("E", "E", "major"),
  buildChord("Em", "E", "minor"),
  buildChord("G", "G", "major"),
];

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
