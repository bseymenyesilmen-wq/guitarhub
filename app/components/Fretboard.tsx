"use client";

import { buildFretboard, getScaleNotes } from "@/lib/music-theory";

const stringLabels = ["E", "B", "G", "D", "A", "E"];

type Props = {
  root: string;
  scaleId: string;
  showIntervals?: boolean;
};

export function Fretboard({ root, scaleId, showIntervals = true }: Props) {
  const notes = buildFretboard(root, scaleId, 12);
  const scaleNotes = getScaleNotes(root, scaleId);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-400">
        {scaleNotes.map((item) => (
          <span key={`${item.interval}-${item.note}`} className={`rounded-full px-3 py-1 font-bold ${item.note === root ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-200"}`}>
            {item.interval}: {item.note}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[860px]">
          <div className="ml-10 grid gap-1 text-center text-xs text-zinc-500" style={{ gridTemplateColumns: "repeat(13, minmax(56px, 1fr))" }}>
            {Array.from({ length: 13 }, (_, fret) => (
              <span key={fret}>{fret}</span>
            ))}
          </div>

          {stringLabels.map((label, visualIndex) => {
            const stringNumber = 1 + visualIndex;
            const rowNotes = notes.filter((note) => note.stringNumber === stringNumber).sort((a, b) => a.fret - b.fret);
            return (
              <div key={`${label}-${visualIndex}`} className="grid grid-cols-[32px_repeat(13,minmax(56px,1fr))] items-center gap-1 border-t border-zinc-800 py-2 last:border-b">
                <span className="text-sm font-black text-zinc-400">{label}</span>
                {rowNotes.map((note) => (
                  <div key={`${note.stringNumber}-${note.fret}`} className="relative flex h-12 items-center justify-center rounded-lg bg-zinc-900/70">
                    {note.inScale ? (
                      <span className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-black ${note.isRoot ? "bg-red-600 text-white ring-4 ring-red-500/20" : "bg-blue-600 text-white"}`}>
                        {showIntervals ? note.interval : note.note}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-700">{note.note}</span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
