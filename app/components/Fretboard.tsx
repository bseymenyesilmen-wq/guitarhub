"use client";

import { buildScaleFretboard, getScaleNotes, type ScaleViewMode } from "@/lib/music-theory";

const stringLabels = ["E", "B", "G", "D", "A", "E"];

type Props = {
  root: string;
  scaleId: string;
  showIntervals?: boolean;
  startFret?: number;
  displayFrets?: number;
  viewMode?: ScaleViewMode;
};

function diagonalWindow(stringNumber: number, startFret: number) {
  return startFret + Math.max(0, 6 - stringNumber);
}

export function Fretboard({ root, scaleId, showIntervals = false, startFret = 0, displayFrets = 12, viewMode = "full" }: Props) {
  const notes = buildScaleFretboard(root, scaleId, startFret, displayFrets);
  const scaleNotes = getScaleNotes(root, scaleId);
  const frets = Array.from({ length: displayFrets + 1 }, (_, index) => startFret + index);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl shadow-black/30 sm:p-4">
      <div className="mb-3 flex flex-wrap gap-1.5 text-[11px] text-zinc-400 sm:text-xs">
        {scaleNotes.map((item) => (
          <span key={`${item.interval}-${item.note}`} className={`rounded-full px-2.5 py-1 font-bold ${item.note === root ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-100"}`}>
            {item.interval}: {item.note}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-amber-900/50 via-amber-950/35 to-zinc-950 p-2 shadow-inner shadow-black/40 sm:p-3">
        <div className="ml-7 grid gap-0.5 text-center text-[10px] font-bold text-zinc-300 sm:ml-9 sm:text-xs" style={{ gridTemplateColumns: `repeat(${frets.length}, minmax(0, 1fr))` }}>
          {frets.map((fret) => (
            <span key={fret}>{fret}</span>
          ))}
        </div>

        {stringLabels.map((label, visualIndex) => {
          const stringNumber = 1 + visualIndex;
          const rowNotes = notes.filter((note) => note.stringNumber === stringNumber).sort((a, b) => a.fret - b.fret);
          return (
            <div key={`${label}-${visualIndex}`} className="grid items-center gap-0.5 border-t border-zinc-700/80 py-1.5 last:border-b" style={{ gridTemplateColumns: `28px repeat(${frets.length}, minmax(0, 1fr))` }}>
              <span className="text-xs font-black text-zinc-100 sm:text-sm">{label}</span>
              {rowNotes.map((note) => {
                const diagonalStart = diagonalWindow(note.stringNumber, startFret);
                const isInDiagonalLane = note.fret >= diagonalStart && note.fret <= diagonalStart + 3;
                const showScaleNote = note.inScale && (viewMode !== "diagonal" || isInDiagonalLane);
                const marker = showIntervals ? note.interval : note.note;
                return (
                  <div key={`${note.stringNumber}-${note.fret}`} className="relative flex h-9 items-center justify-center border-l-2 border-amber-100/40 bg-black/10 first:border-l-4 first:border-zinc-100/90 sm:h-10">
                    <span className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-zinc-300/70" />
                    {showScaleNote ? (
                      <span className={`relative z-10 flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[10px] font-black shadow-lg sm:h-8 sm:min-w-8 sm:text-xs ${note.isRoot ? "bg-red-600 text-white ring-2 ring-red-400/40" : "bg-blue-600 text-white ring-2 ring-blue-300/25"}`}>
                        {marker}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
