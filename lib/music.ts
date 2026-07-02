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

  const nextCapo = Math.max(0, Math.min(11, originalCapo - steps));
  return String(nextCapo);
}

export function extractChords(text: string) {
  const matches = text.match(CHORD_TOKEN_PATTERN) ?? [];
  return Array.from(new Set(matches.map((match) => match.trim()))).filter(Boolean);
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