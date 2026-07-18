export const SONG_NOTES_KEY = "guitarhub.songNotes.v1";

export function makeSongNoteKey(input: { id?: number | string | null; artist?: string | null; title?: string | null }) {
  if (input.id !== undefined && input.id !== null && `${input.id}`.trim()) return `id:${input.id}`;
  return `song:${(input.artist ?? "").trim().toLocaleLowerCase("tr-TR")}::${(input.title ?? "").trim().toLocaleLowerCase("tr-TR")}`;
}

function readAllNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SONG_NOTES_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, string> : {};
  } catch {
    return {};
  }
}

export function readSongNote(key: string) {
  return readAllNotes()[key] ?? "";
}

export function writeSongNote(key: string, note: string) {
  if (typeof window === "undefined") return;
  const notes = readAllNotes();
  const trimmed = note.trim();
  if (trimmed) notes[key] = trimmed;
  else delete notes[key];
  window.localStorage.setItem(SONG_NOTES_KEY, JSON.stringify(notes));
}
