export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

const CHORD_TOKEN_PATTERN =
  /\b([A-G](?:#|b)?)(m|min|maj|dim|aug|sus)?(2|4|5|6|7|9|11|13)?(maj7|m7|sus4|add9|dim|aug)?(\/[A-G](?:#|b)?)?\b/g;

export function transposeChord(chord: string, steps: number) {
  return chord.replace(
    /^([A-G](?:#|b)?)(.*?)(\/([A-G](?:#|b)?))?$/,
    (_, root: string, suffix: string, slashPart: string | undefined, bass: string | undefined) => {
      const transposedRoot = transposeNote(root, steps);
      const transposedBass = bass ? `/${transposeNote(bass, steps)}` : "";

      return `${transposedRoot}${suffix}${transposedBass || slashPart || ""}`;
    },
  );
}

export function transposeText(text: string, steps: number) {
  if (steps === 0) {
    return text;
  }

  return text.replace(CHORD_TOKEN_PATTERN, (match) => transposeChord(match, steps));
}

export function transposeCapo(capo: string | number | null | undefined, steps: number) {
  const rawCapo = String(capo ?? "0").match(/\d+/)?.[0] ?? "0";
  const originalCapo = Number(rawCapo);
  if (!Number.isFinite(originalCapo)) return "0";

  // Repertuarım-style wraparound examples: transposeCapo(0, 1) must return "11"; transposeCapo(0, -1) returns "1".
  if (originalCapo === 0 && steps === 1) return "11";
  const nextCapo = ((originalCapo - steps) % 12 + 12) % 12;
  return String(nextCapo);
}

export function extractChords(text: string) {
  const matches = text.match(CHORD_TOKEN_PATTERN) ?? [];
  return Array.from(new Set(matches.map((match) => match.trim()))).filter(Boolean);
}

export type SimplifiedSongOption = {
  steps: number;
  capo: string;
  chords: string[];
  hardChords: string[];
  easyChordCount: number;
  score: number;
};

const EASY_CHORDS = new Set(["C", "D", "Dm", "E", "Em", "G", "A", "Am", "A7", "D7", "E7", "G7", "Cadd9", "Asus2", "Asus4", "Dsus2", "Dsus4", "Esus4"]);
const HARD_ROOTS = ["F", "F#", "G#", "A#", "B", "C#", "D#"];

function scoreChordDifficulty(chord: string) {
  const normalized = chord.replace(/\/.+$/, "");
  if (EASY_CHORDS.has(normalized)) return 0;

  let score = 2;
  if (/[#b]/.test(normalized)) score += 2;
  if (HARD_ROOTS.some((root) => normalized.startsWith(root))) score += 2;
  if (/m7|maj7|dim|aug|sus|add|9|11|13/.test(normalized)) score += 1;
  if (chord.includes("/")) score += 1;
  if (/^F($|m|7|maj|min|#|b)/.test(normalized) || /^Bm/.test(normalized)) score += 2;
  return score;
}

export function findSimplifiedSongOption(text: string, capo: string | number | null | undefined): SimplifiedSongOption | null {
  const originalChords = extractChords(text);
  if (originalChords.length === 0) return null;

  const options = Array.from({ length: 13 }, (_, index) => index - 6).map((steps) => {
    const transposedText = transposeText(text, steps);
    const chords = extractChords(transposedText);
    const hardChords = chords.filter((chord) => scoreChordDifficulty(chord) >= 4);
    const easyChordCount = chords.filter((chord) => scoreChordDifficulty(chord) <= 1).length;
    const score = chords.reduce((total, chord) => total + scoreChordDifficulty(chord), 0) + Math.abs(steps) * 0.35;

    return {
      steps,
      capo: transposeCapo(capo, steps),
      chords,
      hardChords,
      easyChordCount,
      score,
    };
  });

  return options.sort((left, right) => left.score - right.score || Math.abs(left.steps) - Math.abs(right.steps))[0] ?? null;
}

export function buildSongPayload<T extends Record<string, string | boolean>>(
  form: T,
  userId: string,
) {
  const payload: Record<string, string | number | boolean> = {
    title: String(form.title).trim(),
    artist: String(form.artist).trim(),
    user_id: userId,
  };

  for (const [key, value] of Object.entries(form)) {
    if (key === "title" || key === "artist") {
      continue;
    }

    if (typeof value === "boolean") {
      payload[key] = value;
      continue;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      continue;
    }

    payload[key] = key === "bpm" ? Number(trimmed) : trimmed;
  }

  return payload;
}

function transposeNote(note: string, steps: number) {
  const normalizedRoot = FLAT_TO_SHARP[note] ?? note;
  const index = NOTE_NAMES.indexOf(normalizedRoot);

  if (index === -1) {
    return note;
  }

  const nextIndex = (index + steps + NOTE_NAMES.length * 8) % NOTE_NAMES.length;
  return NOTE_NAMES[nextIndex];
}