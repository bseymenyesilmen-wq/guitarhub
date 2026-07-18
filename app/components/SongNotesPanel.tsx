"use client";

import { useEffect, useMemo, useState } from "react";
import { GhButton } from "@/app/components/ui/GhButton";
import { GhCard } from "@/app/components/ui/GhCard";
import { makeSongNoteKey, readSongNote, writeSongNote } from "@/lib/song-notes";

type SongNotesPanelProps = {
  song: { id?: number | string | null; artist?: string | null; title?: string | null };
};

export function SongNotesPanel({ song }: SongNotesPanelProps) {
  const noteKey = useMemo(() => makeSongNoteKey(song), [song]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNote(readSongNote(noteKey));
      setSaved(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [noteKey]);

  function saveNote() {
    writeSongNote(noteKey, note);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <GhCard className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="gh-kicker text-[10px]">Kişisel Not</p>
          <h3 className="mt-1 text-xl font-black text-white">Şarkı Notları</h3>
          <p className="mt-1 text-sm text-zinc-500">Kapo, ritim, sahne girişi veya zorlandığın yeri yaz.</p>
        </div>
        {saved && <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-black text-emerald-200">Kaydedildi</span>}
      </div>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Örn: Nakaratta ritmi aç, 2. kıtada daha sakin gir, kapo 2 daha iyi..."
        className="mt-4 min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
      />
      <GhButton onClick={saveNote} fullWidth className="mt-3">Notu Kaydet</GhButton>
    </GhCard>
  );
}
