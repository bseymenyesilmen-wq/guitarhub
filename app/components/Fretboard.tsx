"use client";

import { buildScaleFretboard, getScaleNotes } from "@/lib/music-theory";

const stringLabels = ["E", "B", "G", "D", "A", "E"];

type Props = {
  root: string;
  scaleId: string;
  showIntervals?: boolean;
  startFret?: number;
  displayFrets?: number;
};

export function Fretboard({ root, scaleId, showIntervals = true, startFret = 0, displayFrets = 12 }: Props) {
  const notes = buildScaleFretboard(root, scaleId, startFret, displayFrets);
  const scaleNotes = getScaleNotes(root, scaleId);
  const frets = Array.from({ length: displayFrets + 1 }, (_, index) => startFret + index);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl shadow-black/30">
      <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-400">
        {scaleNotes.map((item) => (
          <span key={`${item.interval}-${item.note}`} className={`rounded-full px-3 py-1 font-bold ${item.note === root ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-200"}`}>
            {item.interval}: {item.note}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[980px] rounded-2xl border border-zinc-800 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-amber-950/20 p-3">
          <div className="ml-10 grid gap-1 text-center text-xs text-zinc-500" style={{ gridTemplateColumns: `repeat(${frets.length}, minmax(52px, 1fr))` }}>
            {frets.map((fret) => (
              <span key={fret}>{fret}</span>
            ))}
          </div>

          {stringLabels.map((label, visualIndex) => {
            const stringNumber = 1 + visualIndex;
            const rowNotes = notes.filter((note) => note.stringNumber === stringNumber).sort((a, b) => a.fret - b.fret);
            return (
              <div key={`${label}-${visualIndex}`} className="grid items-center gap-1 border-t border-zinc-700/80 py-2 last:border-b" style={{ gridTemplateColumns: `32px repeat(${frets.length}, minmax(52px, 1fr))` }}>
                <span className="text-sm font-black text-zinc-300">{label}</span>
                {rowNotes.map((note) => {
                  const marker = showIntervals ? note.interval : note.note;
                  return (
                    <div key={`${note.stringNumber}-${note.fret}`} className="relative flex h-12 items-center justify-center border-l border-zinc-700/70 bg-zinc-950/25 first:border-l-4 first:border-zinc-200/80">
                      <span className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-zinc-400/60" />
                      {note.inScale ? (
                        <span className={`relative z-10 flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-black shadow-lg ${note.isRoot ? "bg-red-600 text-white ring-4 ring-red-500/25" : "bg-blue-600 text-white ring-2 ring-blue-400/20"}`}>
                          {marker}
                        </span>
                      ) : (
                        <span className="relative z-10 text-[10px] font-semibold text-zinc-700">{note.note}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
