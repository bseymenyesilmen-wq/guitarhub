import { ALL_GUITAR_CHORD_POSITIONS } from "@/lib/all-guitar-chords-data";
import { ALL_GUITAR_SCALES } from "@/lib/all-guitar-scales-data";

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
  scaleSlug: string;
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

export type ScaleViewMode = "full" | "vertical" | "diagonal";

export type ScalePosition = {
  index: number;
  label: string;
  startFret: number;
  displayFrets: number;
};

const INTERVAL_STEPS: Record<string, number> = {
  "1": 0,
  b2: 1,
  "2": 2,
  "#2": 3,
  b3: 3,
  "3": 4,
  b4: 4,
  "4": 5,
  "#4": 6,
  b5: 6,
  "5": 7,
  "#5": 8,
  b6: 8,
  "6": 9,
  "#6": 10,
  bb7: 9,
  b7: 10,
  "7": 11,
  "9": 2,
  "11": 5,
  "13": 9,
};

export const CHORD_FORMULAS: Record<string, { label: string; formula: string[] }> = {
  major: { label: "Major", formula: ["1", "3", "5"] },
  power5: { label: "5", formula: ["1", "5"] },
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

export const ALL_GUITAR_CHORDS_SCALE_TYPES = ALL_GUITAR_SCALES;

export const SCALE_FORMULAS: ScaleDefinition[] = ALL_GUITAR_CHORDS_SCALE_TYPES;

export const OPEN_STRING_NOTES_LOW_TO_HIGH = ["E", "A", "D", "G", "B", "E"];

const POSITION_LIBRARY: Record<string, ChordPosition[]> = {
  A: [
    { id: "a-open-123", name: "Açık klasik", frets: ["x", 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1, difficulty: "beginner", hint: "3 parmağı aynı perdeye sıkıştırmadan temiz bas." },
    { id: "a-open-mini-bare", name: "Kolay tek parmak", frets: ["x", 0, 2, 2, 2, 0], fingers: [0, 0, 1, 1, 1, 0], baseFret: 1, barre: { fret: 2, fromString: 2, toString: 4, finger: 1 }, difficulty: "beginner", hint: "Tek parmakla mini bare; yüksek E telini açık bırakmak için parmağı hafif kıvır." },
  ],
  Am: [
    { id: "am-open", name: "Açık pozisyon", frets: ["x", 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1, difficulty: "beginner", hint: "İşaret parmağı B telinde net duyulmalı." },
    { id: "am-open-soft", name: "Yumuşak açık", frets: ["x", 0, 2, 2, 1, 3], fingers: [0, 0, 2, 3, 1, 4], baseFret: 1, difficulty: "beginner", hint: "Üstteki G notası daha dolu, ballad tınısı verir." },
  ],
  A7: [
    { id: "a7-open", name: "Açık dominant", frets: ["x", 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], baseFret: 1, difficulty: "beginner", hint: "Blues ve rock geçişlerinde çok kullanılır." },
    { id: "a7-open-3finger", name: "Daha dolu A7", frets: ["x", 0, 2, 0, 2, 3], fingers: [0, 0, 1, 0, 2, 3], baseFret: 1, difficulty: "beginner", hint: "Üst tele G eklenir; folk ve blues eşlikte güzel duyulur." },
  ],
  Am7: [
    { id: "am7-open", name: "Açık min7", frets: ["x", 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], baseFret: 1, difficulty: "beginner", hint: "Am’den yüzük parmağını kaldırarak hızlı geçiş yap." },
    { id: "am7-easy-one-finger", name: "Çok kolay", frets: ["x", 0, 2, 0, 1, 3], fingers: [0, 0, 2, 0, 1, 3], baseFret: 1, difficulty: "beginner", hint: "C akorundan Am7’ye geçerken yüzük parmağını yüksek E’ye al." },
  ],
  Amaj7: [{ id: "amaj7-open", name: "Açık maj7", frets: ["x", 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], baseFret: 1, difficulty: "intermediate", hint: "Yumuşak/jazzy major renk verir." }],
  A6: [{ id: "a6-open", name: "Açık 6", frets: ["x", 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1], baseFret: 1, barre: { fret: 2, fromString: 1, toString: 4, finger: 1 }, difficulty: "beginner", hint: "A major gibi ama daha parlak; tek parmakla 2. perde mini bare yapılabilir." }],
  Asus2: [{ id: "asus2-open", name: "Açık sus2", frets: ["x", 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], baseFret: 1, difficulty: "beginner", hint: "A akorundan B telindeki parmağı kaldır; modern pop tınısı verir." }],
  Asus4: [{ id: "asus4-open", name: "Açık sus4", frets: ["x", 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1, difficulty: "beginner", hint: "A akoruna çözülünce güçlü asılı kalma hissi verir." }],
  Aadd9: [{ id: "aadd9-open", name: "Açık add9", frets: ["x", 0, 2, 4, 2, 0], fingers: [0, 0, 1, 3, 2, 0], baseFret: 1, difficulty: "intermediate", hint: "A, C#, E ve B seslerini verir; Asus2 ile karıştırma." }],

  B7: [{ id: "b7-open", name: "Kolay açık B7", frets: ["x", 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1, difficulty: "beginner", hint: "B bare yerine en pratik dominant çözüm; düşük E telini çalma." }],
  Bm7: [
    { id: "bm7-easy-open", name: "Kolay açık Bm7", frets: ["x", 2, 0, 2, 0, 2], fingers: [0, 1, 0, 2, 0, 3], baseFret: 1, difficulty: "beginner", hint: "Bm bare zor geliyorsa bu açık min7 versiyonuyla eşlik edebilirsin." },
    { id: "bm7-bare", name: "A-shape min7 bare", frets: ["x", 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 5, finger: 1 }, difficulty: "intermediate", hint: "A telinden başlat; düşük E telini sustur." },
  ],

  C: [
    { id: "c-open", name: "Açık klasik", frets: ["x", 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1, difficulty: "beginner", hint: "A telindeki 3. perde bas notasıdır; düşük E telini çalma." },
    { id: "c-easy-small", name: "Kolay 3 telli", frets: ["x", "x", "x", 0, 1, 0], fingers: [0, 0, 0, 0, 1, 0], baseFret: 1, difficulty: "beginner", hint: "Yeni başlayan için mini C; sadece ince 3 teli çal." },
    { id: "c-g-bass", name: "C/G dolu", frets: [3, 3, 2, 0, 1, 0], fingers: [4, 3, 2, 0, 1, 0], baseFret: 1, difficulty: "intermediate", hint: "Bas G ile daha dolu duyulur; düşük E telini de kontrollü çal." },
  ],
  C7: [{ id: "c7-open", name: "Açık C7", frets: ["x", 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1, difficulty: "beginner", hint: "C akoruna G telinde 3. perde ekle; blues geçişlerinde kullanılır." }],
  Cmaj7: [
    { id: "cmaj7-open", name: "Açık Cmaj7", frets: ["x", 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], baseFret: 1, difficulty: "beginner", hint: "C’den işaret parmağını kaldır; çok yumuşak/jazzy renk verir." },
    { id: "cmaj7-easy", name: "Çok kolay", frets: ["x", "x", 2, 0, 0, 0], fingers: [0, 0, 1, 0, 0, 0], baseFret: 1, difficulty: "beginner", hint: "Tek parmaklı mini maj7; ince tellerde temiz duyur." },
  ],
  Csus2: [{ id: "csus2-open", name: "Açık Csus2", frets: ["x", 3, 0, 0, 1, 3], fingers: [0, 3, 0, 0, 1, 4], baseFret: 1, difficulty: "beginner", hint: "Daha açık ve modern C rengi; D teli açık kalır." }],
  Csus4: [{ id: "csus4-open", name: "Açık Csus4", frets: ["x", 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1], baseFret: 1, difficulty: "intermediate", hint: "İnce iki teli mini bare ile tut; C’ye çözülünce güzel çalışır." }],
  Cadd9: [{ id: "cadd9-open", name: "Açık Cadd9", frets: ["x", 3, 2, 0, 3, 3], fingers: [0, 3, 2, 0, 4, 4], baseFret: 1, difficulty: "beginner", hint: "G akoruyla geçişi kolaydır; pop/rock eşlikte çok kullanılır." }],

  D: [{ id: "d-open", name: "Açık klasik", frets: ["x", "x", 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1, difficulty: "beginner", hint: "Sadece D telinden itibaren çal; düşük telleri sustur." }],
  Dm: [{ id: "dm-open", name: "Açık Dm", frets: ["x", "x", 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1, difficulty: "beginner", hint: "İnce E telindeki 1. perde minör hissi verir; D telinden başla." }],
  D7: [{ id: "d7-open", name: "Açık D7", frets: ["x", "x", 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1, difficulty: "beginner", hint: "D’den G’ye çözülmek için klasik dominant pozisyon." }],
  Dmaj7: [{ id: "dmaj7-open", name: "Açık Dmaj7", frets: ["x", "x", 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], baseFret: 1, barre: { fret: 2, fromString: 1, toString: 3, finger: 1 }, difficulty: "beginner", hint: "Tek parmak mini bare; çok parlak ve yumuşak D rengi." }],
  Dsus2: [{ id: "dsus2-open", name: "Açık Dsus2", frets: ["x", "x", 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0], baseFret: 1, difficulty: "beginner", hint: "D akorundan ince E parmağını kaldır; çok kolay geçiş." }],
  Dsus4: [{ id: "dsus4-open", name: "Açık Dsus4", frets: ["x", "x", 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], baseFret: 1, difficulty: "beginner", hint: "D akoruna küçük parmağı ekle; sonra D’ye çöz." }],
  Dadd9: [{ id: "dadd9-open", name: "Açık Dadd9", frets: ["x", 5, 4, 2, 3, 0], fingers: [0, 4, 3, 1, 2, 0], baseFret: 1, difficulty: "intermediate", hint: "D, F#, A ve E seslerini verir; açık ince E add9 rengidir." }],
  "D/F#": [{ id: "d-fsharp", name: "D/F# yürüyen bas", frets: [2, "x", 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3], baseFret: 1, difficulty: "intermediate", hint: "G’ye yürüyen baslarda çok kullanılır; A telini sustur." }],

  E: [{ id: "e-open", name: "Açık E", frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1, difficulty: "beginner", hint: "Tüm teller çalınır; G telindeki 1. perde major hissi verir." }],
  Em: [{ id: "em-open", name: "Açık Em", frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1, difficulty: "beginner", hint: "İki parmakla en kolay minör akorlardan biri." }],
  E7: [{ id: "e7-open", name: "Açık E7", frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], baseFret: 1, difficulty: "beginner", hint: "E’den D telindeki parmağı kaldır; blues hissi verir." }],
  Em7: [{ id: "em7-open", name: "Açık Em7", frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], baseFret: 1, difficulty: "beginner", hint: "Tek parmakla çok kolay min7 rengi; G ve D geçişlerinde kullan." }],
  Emaj7: [{ id: "emaj7-open", name: "Açık Emaj7", frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], baseFret: 1, difficulty: "intermediate", hint: "Parlak ve jazzy E rengi; parmakları sıkıştırmadan bas." }],
  Esus4: [{ id: "esus4-open", name: "Açık Esus4", frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0], baseFret: 1, difficulty: "beginner", hint: "E akoruna G telinde 2. perde ekle; sonra E’ye çöz." }],
  Eadd9: [{ id: "eadd9-open", name: "Açık Eadd9", frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4], baseFret: 1, difficulty: "beginner", hint: "İnce E telindeki F# modern/parlak renk verir." }],

  F: [
    { id: "f-easy-small", name: "Kolay mini F", frets: ["x", "x", 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 2, finger: 1 }, difficulty: "beginner", hint: "Tam bare zor geliyorsa 4 telli mini F kullan; düşük telleri çalma." },
    { id: "fmaj7-open", name: "Fmaj7 kolay", frets: ["x", "x", 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], baseFret: 1, difficulty: "beginner", hint: "F bare yerine en kolay alternatiflerden biri; pop şarkılarda çok kullanılır." },
    { id: "f-bare", name: "E-shape bare", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "Bare parmağını hafif yana yatır; bileği kasma." },
  ],
  Fmaj7: [{ id: "fmaj7-open-library", name: "Kolay Fmaj7", frets: ["x", "x", 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], baseFret: 1, difficulty: "beginner", hint: "F yerine kullanılabilecek yumuşak ve baresiz alternatif." }],
  Fm: [{ id: "fm-small", name: "Mini Fm", frets: ["x", "x", 3, 1, 1, 1], fingers: [0, 0, 3, 1, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 3, finger: 1 }, difficulty: "intermediate", hint: "Tam Fm bare yerine üst 4 telde kısa versiyon." }],
  "F#m": [
    { id: "fsharpm-small", name: "Mini F#m", frets: ["x", "x", 4, 2, 2, 2], fingers: [0, 0, 3, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 3, finger: 1 }, difficulty: "intermediate", hint: "Tam bare zor gelirse üst 4 telde çal." },
    { id: "fsharpm-bare", name: "E-shape minor bare", frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "F#m için en standart pozisyon; tüm telleri temiz duyurmaya çalış." },
  ],
  "F#m7": [
    { id: "fsharpm7-easy", name: "Mini F#m7", frets: ["x", "x", 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 4, finger: 1 }, difficulty: "intermediate", hint: "Üst 4 telde F#m7 rengi; bas telleri çalma." },
    { id: "fsharpm7-bare", name: "E-shape min7 bare", frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "Min7 rengi için D telindeki 4. perde yeterli." },
  ],

  G: [
    { id: "g-open-4finger", name: "Açık 4 parmak", frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], baseFret: 1, difficulty: "beginner", hint: "Cadd9 ve Dsus4 geçişleri için 3-4. parmakları sabit tutabilirsin." },
    { id: "g-open-classic", name: "Açık klasik", frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4], baseFret: 1, difficulty: "beginner", hint: "En yaygın G basışı; tüm teller çalınır." },
    { id: "g-easy-mini", name: "Kolay mini G", frets: ["x", "x", 0, 0, 0, 3], fingers: [0, 0, 0, 0, 0, 3], baseFret: 1, difficulty: "beginner", hint: "Tek parmaklı mini G; sadece ince 4 teli çal." },
  ],
  G7: [{ id: "g7-open", name: "Açık G7", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], baseFret: 1, difficulty: "beginner", hint: "C’ye çözülmek için klasik dominant akor." }],
  Gmaj7: [{ id: "gmaj7-open", name: "Açık Gmaj7", frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, 0, 0, 0, 2], baseFret: 1, difficulty: "beginner", hint: "G’nin daha yumuşak ve modern rengi." }],
  Gsus2: [{ id: "gsus2-open", name: "Açık Gsus2", frets: [3, 0, 0, 0, 3, 3], fingers: [2, 0, 0, 0, 3, 4], baseFret: 1, difficulty: "beginner", hint: "A telini açık bırakarak daha açık bir G rengi alırsın." }],
  Gsus4: [{ id: "gsus4-open", name: "Açık Gsus4", frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], baseFret: 1, difficulty: "intermediate", hint: "C akoruna yaklaşan asılı G rengi; çözülme hissi verir." }],
  Gadd9: [{ id: "gadd9-open", name: "Açık Gadd9", frets: [3, 0, 0, 2, 0, 3], fingers: [2, 0, 0, 1, 0, 3], baseFret: 1, difficulty: "beginner", hint: "G’ye A sesi eklenir; modern pop tınısı." }],

  "A/C#": [{ id: "a-csharp", name: "Slash chord", frets: ["x", 4, 2, 2, 2, 0], fingers: [0, 3, 1, 1, 1, 0], baseFret: 1, difficulty: "intermediate", hint: "Bas notası C# olduğu için yürüyen baslarda işe yarar." }],
  "C/E": [{ id: "c-e", name: "C/E yürüyen bas", frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1, difficulty: "beginner", hint: "C akorunun E baslı hali; Am-F-C-G yürüyüşlerinde işe yarar." }],
  "G/B": [{ id: "g-b", name: "G/B yürüyen bas", frets: ["x", 2, 0, 0, 3, 3], fingers: [0, 1, 0, 0, 3, 4], baseFret: 1, difficulty: "beginner", hint: "G akorunu B basla çal; C’ye geçişlerde güzel yürür." }],
  "F/A": [{ id: "f-a", name: "F/A kolay", frets: ["x", 0, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 2, finger: 1 }, difficulty: "beginner", hint: "F akorunu A basla daha kolay ve açık duyurur." }],
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
  power5: "5",
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

type CagedShape = {
  shape: "C" | "A" | "G" | "E" | "D";
  root: NoteName;
  frets: Array<number | "x">;
  fingers: number[];
};

const CAGED_SHAPES: Partial<Record<keyof typeof CHORD_FORMULAS, CagedShape[]>> = {
  major: [
    { shape: "C", root: "C", frets: ["x", 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    { shape: "G", root: "G", frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4] },
    { shape: "E", root: "E", frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  ],
  minor: [
    { shape: "C", root: "C", frets: ["x", 3, 1, 0, 1, 3], fingers: [0, 3, 1, 0, 1, 4] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    { shape: "G", root: "G", frets: [3, 1, 0, 0, 3, 3], fingers: [3, 1, 0, 0, 4, 4] },
    { shape: "E", root: "E", frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  ],
  "7": [
    { shape: "C", root: "C", frets: ["x", 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
    { shape: "G", root: "G", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    { shape: "E", root: "E", frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  ],
  maj7: [
    { shape: "C", root: "C", frets: ["x", 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
    { shape: "G", root: "G", frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, 0, 0, 0, 2] },
    { shape: "E", root: "E", frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1] },
  ],
  min7: [
    { shape: "C", root: "C", frets: ["x", 3, 1, 3, 1, 3], fingers: [0, 3, 1, 4, 1, 4] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
    { shape: "G", root: "G", frets: [3, 1, 0, 0, 3, 1], fingers: [3, 1, 0, 0, 4, 1] },
    { shape: "E", root: "E", frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  ],
  sus2: [
    { shape: "C", root: "C", frets: ["x", 3, 0, 0, 1, 3], fingers: [0, 3, 0, 0, 1, 4] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
    { shape: "G", root: "G", frets: [3, 0, 0, 0, 3, 3], fingers: [2, 0, 0, 0, 3, 4] },
    { shape: "E", root: "E", frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  ],
  sus4: [
    { shape: "C", root: "C", frets: ["x", 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
    { shape: "G", root: "G", frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
    { shape: "E", root: "E", frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  ],
  add9: [
    { shape: "C", root: "C", frets: ["x", 3, 2, 0, 3, 3], fingers: [0, 3, 2, 0, 4, 4] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 4, 2, 0], fingers: [0, 0, 1, 3, 2, 0] },
    { shape: "G", root: "G", frets: [3, 0, 0, 2, 0, 3], fingers: [2, 0, 0, 1, 0, 3] },
    { shape: "E", root: "E", frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4] },
    { shape: "D", root: "D", frets: ["x", 5, 4, 2, 3, 0], fingers: [0, 4, 3, 1, 2, 0] },
  ],
  "6": [
    { shape: "C", root: "C", frets: ["x", 3, 2, 2, 1, 0], fingers: [0, 4, 2, 3, 1, 0] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1] },
    { shape: "G", root: "G", frets: [3, 2, 0, 0, 0, 0], fingers: [3, 2, 0, 0, 0, 0] },
    { shape: "E", root: "E", frets: [0, 2, 2, 1, 2, 0], fingers: [0, 2, 3, 1, 4, 0] },
    { shape: "D", root: "D", frets: ["x", "x", 0, 2, 0, 2], fingers: [0, 0, 0, 1, 0, 2] },
  ],
  "9": [
    { shape: "C", root: "C", frets: ["x", 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 3] },
    { shape: "A", root: "A", frets: ["x", 0, 2, 4, 2, 3], fingers: [0, 0, 1, 4, 2, 3] },
    { shape: "G", root: "G", frets: [3, 2, 0, 2, 0, 1], fingers: [4, 3, 0, 2, 0, 1] },
    { shape: "E", root: "E", frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
    { shape: "D", root: "D", frets: ["x", 5, 4, 5, 5, 5], fingers: [0, 2, 1, 3, 3, 3] },
  ],
};

function difficultyForFret(fret: number): Difficulty {
  if (fret <= 0) return "beginner";
  if (fret <= 5) return "intermediate";
  return "advanced";
}

function fretNote(stringIndex: number, fret: number) {
  return transposeBySemitones(OPEN_STRING_NOTES_LOW_TO_HIGH[stringIndex], fret % NOTE_NAMES.length);
}

function minFret(frets: Array<number | "x">) {
  const played = frets.filter((fret): fret is number => typeof fret === "number" && fret > 0);
  return played.length ? Math.min(...played) : 0;
}

function barreForPosition(frets: Array<number | "x">): ChordPosition["barre"] {
  const fret = minFret(frets);
  if (!fret) return undefined;
  const indices = frets.map((value, index) => (value === fret ? index : -1)).filter((index) => index >= 0);
  if (indices.length < 2) return undefined;
  return { fret, fromString: 6 - Math.max(...indices), toString: 6 - Math.min(...indices), finger: 1 };
}

function transposeCagedShape(root: string, quality: string, shape: CagedShape): ChordPosition {
  const rootIndex = NOTE_NAMES.indexOf(root as NoteName);
  const shapeRootIndex = NOTE_NAMES.indexOf(shape.root);
  const semitones = (rootIndex - shapeRootIndex + NOTE_NAMES.length) % NOTE_NAMES.length;
  const frets = shape.frets.map((fret) => (fret === "x" ? "x" : fret + semitones));
  const baseFret = Math.max(1, minFret(frets));

  return {
    id: `${root}-${quality}-${shape.shape.toLowerCase()}-caged`,
    name: `${shape.shape}-shape CAGED`,
    frets,
    fingers: shape.fingers,
    baseFret,
    barre: barreForPosition(frets),
    difficulty: difficultyForFret(baseFret),
    hint: `${shape.shape} kalıbından taşınan CAGED pozisyonu; sadece diyagramdaki telleri çal.`,
  };
}

function validateChordPosition(root: string, formula: string[], position: ChordPosition) {
  const allowedNotes = new Set(buildNotes(root, formula));
  const playedNotes = position.frets
    .map((fret, stringIndex) => (fret === "x" ? null : fretNote(stringIndex, fret)))
    .filter((note): note is string => Boolean(note));

  return playedNotes.length > 0 && playedNotes.includes(root) && playedNotes.every((note) => allowedNotes.has(note));
}

function compactPosition(root: string, quality: string): ChordPosition {
  const fret = A_STRING_FRET[root];
  const isAug = quality === "aug";
  const frets: Array<number | "x"> = isAug
    ? ["x", fret, fret + 3, fret + 2, fret + 2, "x"]
    : ["x", fret, fret + 1, fret + 2, fret + 1, "x"];

  return {
    id: `${root}-${quality}-compact`,
    name: isAug ? "Kompakt aug pozisyon" : "Kompakt dim pozisyon",
    frets,
    fingers: fret === 0 ? [0, 0, 3, 1, 2, 0] : [0, 1, 2, 4, 3, 0],
    baseFret: Math.max(1, minFret(frets)),
    difficulty: "advanced",
    hint: "Kompakt renk pozisyonu; dim/aug akorları kısa geçiş ve gerilim için kullan.",
  };
}

function powerChordPositions(root: string): ChordPosition[] {
  const eFret = E_STRING_FRET[root];
  const aFret = A_STRING_FRET[root];
  const eBaseFret = Math.max(1, eFret);
  const aBaseFret = Math.max(1, aFret);

  return [
    {
      id: `${root}-5-e-root`,
      name: eFret === 0 ? "Açık E köklü power chord" : "E teli köklü power chord",
      frets: [eFret, eFret + 2, eFret + 2, "x", "x", "x"],
      fingers: eFret === 0 ? [0, 1, 2, 0, 0, 0] : [1, 3, 4, 0, 0, 0],
      baseFret: eBaseFret,
      difficulty: difficultyForFret(eFret),
      hint: "Sadece kalın 3 teli çal; rock/metal ritimlerinde en pratik 5'li akor şeklidir.",
    },
    {
      id: `${root}-5-a-root`,
      name: aFret === 0 ? "Açık A köklü power chord" : "A teli köklü power chord",
      frets: ["x", aFret, aFret + 2, aFret + 2, "x", "x"],
      fingers: aFret === 0 ? [0, 0, 1, 2, 0, 0] : [0, 1, 3, 4, 0, 0],
      baseFret: aBaseFret,
      difficulty: difficultyForFret(aFret),
      hint: "A telinden başlat; düşük E ve ince telleri sustur. Ritim gitar için temiz ve güçlü duyulur.",
    },
  ];
}

function cagedPositions(root: string, quality: string) {
  const formula = CHORD_FORMULAS[quality]?.formula;
  const shapes = CAGED_SHAPES[quality];
  if (!formula || !shapes) return [];

  return shapes
    .map((shape) => transposeCagedShape(root, quality, shape))
    .filter((position) => validateChordPosition(root, formula, position));
}

function generatedPositions(root: string, quality: string) {
  if (quality === "power5") return powerChordPositions(root);
  const caged = cagedPositions(root, quality);
  if (caged.length) return caged;
  if (quality === "dim" || quality === "aug") return [compactPosition(root, quality)].filter((position) => validateChordPosition(root, CHORD_FORMULAS[quality].formula, position));
  return cagedPositions(root, quality);
}

function usageScore(position: ChordPosition) {
  const fretted = position.frets.filter((fret): fret is number => typeof fret === "number" && fret > 0);
  const mutedCount = position.frets.filter((fret) => fret === "x").length;
  const openCount = position.frets.filter((fret) => fret === 0).length;
  const maxFret = fretted.length ? Math.max(...fretted) : 0;
  const span = fretted.length ? maxFret - Math.min(...fretted) : 0;
  const barrePenalty = position.barre ? 2 : 0;
  const openBonus = openCount > 0 && position.baseFret <= 1 ? -3 : 0;

  return position.baseFret * 8 + maxFret * 2 + span * 3 + mutedCount + barrePenalty + openBonus;
}

function sortByUsage(positions: ChordPosition[]) {
  return [...positions]
    .map((position, index) => ({
      position: { ...position, name: position.name.replace(/^All-Guitar-Chords\s+/i, ""), hint: "" },
      index,
      score: usageScore(position),
    }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((item) => item.position);
}

export function buildChord(name: string, root: string, formulaKey: keyof typeof CHORD_FORMULAS, family?: string): ChordDefinition {
  const formula = CHORD_FORMULAS[formulaKey].formula;
  const existing = POSITION_LIBRARY[name] ?? [];
  const generated = generatedPositions(root, String(formulaKey)).filter(
    (position) => !existing.some((item) => item.id === position.id),
  );
  const sitePositions = ALL_GUITAR_CHORD_POSITIONS[name];
  const positions = generated.length >= 5 && family !== "Slash Chord" ? generated : [...existing, ...generated];

  return {
    name,
    root,
    family: family ?? CHORD_FORMULAS[formulaKey].label,
    formula,
    notes: buildNotes(root, formula),
    positions: sitePositions ? sortByUsage(sitePositions) : positions.slice(0, 5),
  };
}

const CORE_CHORDS = NOTE_NAMES.flatMap((root) =>
  (["major", "minor", "7", "maj7", "min7", "dim", "aug", "sus2", "sus4", "add9", "6", "9", "11", "13"] as const).map((quality) =>
    buildChord(`${root}${QUALITY_SUFFIX[quality]}`, root, quality, quality === "7" ? "Dominant 7" : undefined),
  ),
);

const POWER_CHORDS = NOTE_NAMES.map((root) => buildChord(`${root}5`, root, "power5", "5 / Power Chord"));

const SLASH_CHORDS = [
  buildChord("A/C#", "A", "major", "Slash Chord"),
  buildChord("C/E", "C", "major", "Slash Chord"),
  buildChord("D/F#", "D", "major", "Slash Chord"),
  buildChord("G/B", "G", "major", "Slash Chord"),
  buildChord("F/A", "F", "major", "Slash Chord"),
];

export const CHORD_LIBRARY: ChordDefinition[] = [...CORE_CHORDS, ...POWER_CHORDS, ...SLASH_CHORDS];

export function getScaleNotes(root: string, scaleId: string) {
  const scale = SCALE_FORMULAS.find((item) => item.id === scaleId) ?? SCALE_FORMULAS[0];
  return scale.formula.map((interval) => ({ interval, note: noteFromInterval(root, interval) }));
}

function transposeBySemitones(note: string, semitones: number) {
  const rootIndex = NOTE_NAMES.indexOf(note as NoteName);
  if (rootIndex === -1) return note;
  return NOTE_NAMES[(rootIndex + semitones) % NOTE_NAMES.length];
}

export function buildScaleFretboard(root: string, scaleId: string, startFret = 0, displayFrets = 12): FretboardNote[] {
  const scaleNotes = getScaleNotes(root, scaleId);
  const intervalByNote = new Map(scaleNotes.map((item) => [item.note, item.interval]));
  const safeStart = Math.max(0, startFret);
  const safeDisplayFrets = Math.max(1, displayFrets);

  return OPEN_STRING_NOTES_LOW_TO_HIGH.flatMap((stringName, stringIndex) =>
    Array.from({ length: safeDisplayFrets + 1 }, (_, offset) => {
      const fret = safeStart + offset;
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

export function buildFretboard(root: string, scaleId: string, frets = 12): FretboardNote[] {
  return buildScaleFretboard(root, scaleId, 0, frets);
}

function normalizeToFretboard(fret: number) {
  if (fret < 0) return 0;
  if (fret <= 21) return fret;
  return ((fret - 1) % 12) + 1;
}

function getLowERootFret(root: string) {
  const raw = NOTE_NAMES.indexOf(root as NoteName) + 8;
  return raw > 12 ? raw - 12 : raw;
}

function uniqueInOrder(values: number[]) {
  return values.filter((value, index, list) => list.indexOf(value) === index);
}

// source-backed Common scale positions
// Kaynak mantığı:
// - GuitarScale.org C Major / C Minor / C Dorian / C Pentatonic / C Blues sayfaları: C root 6. tel 8. perde, full fretboard ve shape bilgileri.
//   https://www.guitarscale.org/c-major.html
//   https://www.guitarscale.org/c-minor.html
//   https://www.guitarscale.org/c-dorian.html
//   https://www.guitarscale.org/c-pentatonic-minor.html
//   https://www.guitarscale.org/c-pentatonic-major.html
//   https://www.guitarscale.org/c-blues.html
// - FretJam Major/Natural Minor pozisyon dersleri: pozisyon noktaları gam derecelerinin low-E string üzerindeki yerlerinden kurulur.
//   https://www.fretjam.com/major-scale-positions.html
//   https://www.fretjam.com/natural-minor-scale-positions.html
// - JustinGuitar / National Guitar Academy: C Minor Pentatonic 1. pozisyon root C = 6. tel 8. perde; sonraki kutular scale derecelerinden gelir.
// C Minor Pentatonic: 1. pozisyon 8. perde.
export const COMMON_SCALE_POSITION_SOURCES = {
  guitarScale: "www.guitarscale.org/c-major.html / c-minor.html / c-dorian.html / c-pentatonic-minor.html / c-blues.html",
  fretJam: "www.fretjam.com/major-scale-positions.html / natural-minor-scale-positions.html",
  justinGuitar: "www.justinguitar.com/guitar-lessons/minor-pentatonic-the-5-patterns-sc-304",
  nationalGuitarAcademy: "nationalguitaracademy.com/scales/c-minor-pentatonic-scale/",
} as const;

const COMMON_SCALE_POSITION_INTERVALS: Record<string, string[]> = {
  major: ["1", "2", "3", "4", "5", "6", "7"],
  ionian: ["1", "2", "3", "4", "5", "6", "7"],
  "harmonic-minor": ["1", "2", "b3", "4", "5", "b6", "7"],
  "melodic-minor": ["1", "2", "b3", "4", "5", "6", "7"],
  "natural-minor": ["1", "2", "b3", "4", "5", "b6", "b7"],
  aeolian: ["1", "2", "b3", "4", "5", "b6", "b7"],
  dorian: ["1", "2", "b3", "4", "5", "6", "b7"],
  phrygian: ["1", "b2", "b3", "4", "5", "b6", "b7"],
  lydian: ["1", "2", "3", "#4", "5", "6", "7"],
  mixolydian: ["1", "2", "3", "4", "5", "6", "b7"],
  locrian: ["1", "b2", "b3", "4", "b5", "b6", "b7"],
  "pentatonic-major": ["1", "2", "3", "5", "6"],
  "pentatonic-minor": ["1", "b3", "4", "5", "b7"],
  "pentatonic-blues": ["1", "b3", "4", "b5", "5", "b7"],
  "pentatonic-neutral": ["1", "2", "4", "5", "b7"],
  diatonic: ["1", "2", "3", "5", "6"],
  diminished: ["1", "2", "b3", "4", "b5", "b6", "6", "7"],
  "diminished-half": ["1", "b2", "b3", "3", "b5", "5", "6", "b7"],
  "diminished-whole": ["1", "2", "b3", "4", "b5", "b6", "6", "7"],
  "diminished-whole-tone": ["1", "b2", "b3", "3", "b5", "b6", "b7"],
  "dominant-7th": ["1", "2", "3", "4", "5", "6", "b7"],
  "lydian-augmented": ["1", "2", "3", "#4", "#5", "6", "7"],
  "lydian-minor": ["1", "2", "3", "#4", "5", "b6", "b7"],
  "lydian-diminished": ["1", "2", "b3", "#4", "5", "6", "7"],
};

function getPositionIntervals(scaleId: string, formula: string[]) {
  return COMMON_SCALE_POSITION_INTERVALS[scaleId] ?? formula;
}

function normalizePositionStart(fret: number) {
  // Pozisyon başlangıçları pratik gitar öğretiminde 12. perde üstüne kaçınca alt oktavdaki eşdeğer kutuya sarılır.
  // Örn: G minor pentatonic 1. pozisyon 15 değil 3; A minor pentatonic 17 değil 5; F minor pentatonic 13 değil 1.
  if (fret > 13) return fret - 12;
  return normalizeToFretboard(fret);
}

export function getScalePositions(root: string, scaleId: string, viewMode: ScaleViewMode = "vertical"): ScalePosition[] {
  const scale = SCALE_FORMULAS.find((item) => item.id === scaleId) ?? SCALE_FORMULAS[0];
  const rootOnLowE = getLowERootFret(root);
  const displayFrets = viewMode === "diagonal" ? 7 : 4;
  const intervals = getPositionIntervals(scaleId, scale.formula);
  const starts = uniqueInOrder(intervals.map((interval) => normalizePositionStart(rootOnLowE + (INTERVAL_STEPS[interval] ?? 0))));

  return starts.map((startFret, index) => ({
    index,
    label: `${index + 1}. Pozisyon`,
    startFret: index === 0 ? rootOnLowE : startFret,
    displayFrets,
  }));
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "Günaydın";
  if (hour >= 11 && hour < 18) return "İyi günler";
  if (hour >= 18 && hour < 23) return "İyi akşamlar";
  return "İyi geceler";
}
