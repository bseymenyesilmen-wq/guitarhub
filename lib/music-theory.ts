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
  A: [
    { id: "a-open-123", name: "Açık klasik", frets: ["x", 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1, difficulty: "beginner", hint: "3 parmağı aynı perdeye sıkıştırmadan temiz bas." },
    { id: "a-open-mini-barre", name: "Kolay tek parmak", frets: ["x", 0, 2, 2, 2, 0], fingers: [0, 0, 1, 1, 1, 0], baseFret: 1, barre: { fret: 2, fromString: 2, toString: 4, finger: 1 }, difficulty: "beginner", hint: "Tek parmakla mini barre; yüksek E telini açık bırakmak için parmağı hafif kıvır." },
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
  A6: [{ id: "a6-open", name: "Açık 6", frets: ["x", 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1], baseFret: 1, barre: { fret: 2, fromString: 1, toString: 4, finger: 1 }, difficulty: "beginner", hint: "A major gibi ama daha parlak; tek parmakla 2. perde mini barre yapılabilir." }],
  Asus2: [{ id: "asus2-open", name: "Açık sus2", frets: ["x", 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], baseFret: 1, difficulty: "beginner", hint: "A akorundan B telindeki parmağı kaldır; modern pop tınısı verir." }],
  Asus4: [{ id: "asus4-open", name: "Açık sus4", frets: ["x", 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1, difficulty: "beginner", hint: "A akoruna çözülünce güçlü asılı kalma hissi verir." }],
  Aadd9: [{ id: "aadd9-open", name: "Açık add9", frets: ["x", 0, 2, 4, 2, 0], fingers: [0, 0, 1, 3, 2, 0], baseFret: 1, difficulty: "intermediate", hint: "A, C#, E ve B seslerini verir; Asus2 ile karıştırma." }],

  B7: [{ id: "b7-open", name: "Kolay açık B7", frets: ["x", 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1, difficulty: "beginner", hint: "B barre yerine en pratik dominant çözüm; düşük E telini çalma." }],
  Bm7: [
    { id: "bm7-easy-open", name: "Kolay açık Bm7", frets: ["x", 2, 0, 2, 0, 2], fingers: [0, 1, 0, 2, 0, 3], baseFret: 1, difficulty: "beginner", hint: "Bm bare zor geliyorsa bu açık min7 versiyonuyla eşlik edebilirsin." },
    { id: "bm7-barre", name: "A-shape min7 barre", frets: ["x", 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 5, finger: 1 }, difficulty: "intermediate", hint: "A telinden başlat; düşük E telini sustur." },
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
  Csus4: [{ id: "csus4-open", name: "Açık Csus4", frets: ["x", 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1], baseFret: 1, difficulty: "intermediate", hint: "İnce iki teli mini barre ile tut; C’ye çözülünce güzel çalışır." }],
  Cadd9: [{ id: "cadd9-open", name: "Açık Cadd9", frets: ["x", 3, 2, 0, 3, 3], fingers: [0, 3, 2, 0, 4, 4], baseFret: 1, difficulty: "beginner", hint: "G akoruyla geçişi kolaydır; pop/rock eşlikte çok kullanılır." }],

  D: [{ id: "d-open", name: "Açık klasik", frets: ["x", "x", 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1, difficulty: "beginner", hint: "Sadece D telinden itibaren çal; düşük telleri sustur." }],
  Dm: [{ id: "dm-open", name: "Açık Dm", frets: ["x", "x", 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1, difficulty: "beginner", hint: "İnce E telindeki 1. perde minör hissi verir; D telinden başla." }],
  D7: [{ id: "d7-open", name: "Açık D7", frets: ["x", "x", 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1, difficulty: "beginner", hint: "D’den G’ye çözülmek için klasik dominant pozisyon." }],
  Dmaj7: [{ id: "dmaj7-open", name: "Açık Dmaj7", frets: ["x", "x", 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], baseFret: 1, barre: { fret: 2, fromString: 1, toString: 3, finger: 1 }, difficulty: "beginner", hint: "Tek parmak mini barre; çok parlak ve yumuşak D rengi." }],
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
    { id: "f-easy-small", name: "Kolay mini F", frets: ["x", "x", 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 2, finger: 1 }, difficulty: "beginner", hint: "Tam barre zor geliyorsa 4 telli mini F kullan; düşük telleri çalma." },
    { id: "fmaj7-open", name: "Fmaj7 kolay", frets: ["x", "x", 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], baseFret: 1, difficulty: "beginner", hint: "F barre yerine en kolay alternatiflerden biri; pop şarkılarda çok kullanılır." },
    { id: "f-barre", name: "E-shape barre", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "Barre parmağını hafif yana yatır; bileği kasma." },
  ],
  Fmaj7: [{ id: "fmaj7-open-library", name: "Kolay Fmaj7", frets: ["x", "x", 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], baseFret: 1, difficulty: "beginner", hint: "F yerine kullanılabilecek yumuşak ve baresiz alternatif." }],
  Fm: [{ id: "fm-small", name: "Mini Fm", frets: ["x", "x", 3, 1, 1, 1], fingers: [0, 0, 3, 1, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 1, toString: 3, finger: 1 }, difficulty: "intermediate", hint: "Tam Fm barre yerine üst 4 telde kısa versiyon." }],
  "F#m": [
    { id: "fsharpm-small", name: "Mini F#m", frets: ["x", "x", 4, 2, 2, 2], fingers: [0, 0, 3, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 3, finger: 1 }, difficulty: "intermediate", hint: "Tam barre zor gelirse üst 4 telde çal." },
    { id: "fsharpm-barre", name: "E-shape minor barre", frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "F#m için en standart pozisyon; tüm telleri temiz duyurmaya çalış." },
  ],
  "F#m7": [
    { id: "fsharpm7-easy", name: "Mini F#m7", frets: ["x", "x", 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 4, finger: 1 }, difficulty: "intermediate", hint: "Üst 4 telde F#m7 rengi; bas telleri çalma." },
    { id: "fsharpm7-barre", name: "E-shape min7 barre", frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], baseFret: 2, barre: { fret: 2, fromString: 1, toString: 6, finger: 1 }, difficulty: "intermediate", hint: "Min7 rengi için D telindeki 4. perde yeterli." },
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

function generatedPositions(root: string, quality: string) {
  if (quality === "power5") return powerChordPositions(root);
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
    positions: [...existing, ...generated].slice(0, 5),
  };
}

const CORE_CHORDS = NOTE_NAMES.flatMap((root) =>
  (["major", "minor", "7", "maj7", "min7", "dim", "aug", "sus2", "sus4", "add9", "6", "9"] as const).map((quality) =>
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
