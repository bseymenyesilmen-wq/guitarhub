"use client";

import { buildScaleFretboard, getScaleNotes, type ScaleViewMode } from "@/lib/music-theory";

const stringLabels = ["E", "B", "G", "D", "A", "E"];
const FRET_MARKS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_FRET_MARKS = new Set([12]);

type Props = {
  root: string;
  scaleId: string;
  showIntervals?: boolean;
  startFret?: number;
  displayFrets?: number;
  viewMode?: ScaleViewMode;
  positionStartFret?: number | null;
  positionEndFret?: number | null;
};

function diagonalWindow(stringNumber: number, startFret: number) {
  return startFret + Math.max(0, 6 - stringNumber);
}

function getStringFretRange(viewMode: ScaleViewMode, stringNumber: number, positionStartFret: number | null, positionEndFret: number | null) {
  if (positionStartFret === null || positionEndFret === null || viewMode === "full") return { start: 0, end: 21 };
  if (viewMode === "diagonal") {
    const start = diagonalWindow(stringNumber, positionStartFret);
    return { start, end: Math.min(21, start + 7) };
  }
  return { start: positionStartFret, end: positionEndFret };
}

function shouldShowScaleNote(viewMode: ScaleViewMode, stringNumber: number, fret: number, inScale: boolean, positionStartFret: number | null, positionEndFret: number | null) {
  if (!inScale) return false;
  const range = getStringFretRange(viewMode, stringNumber, positionStartFret, positionEndFret);
  return fret >= range.start && fret <= range.end;
}

function isInsideSelectedPosition(viewMode: ScaleViewMode, stringNumber: number, fret: number, positionStartFret: number | null, positionEndFret: number | null) {
  if (viewMode === "full" || positionStartFret === null || positionEndFret === null) return false;
  const range = getStringFretRange(viewMode, stringNumber, positionStartFret, positionEndFret);
  return fret >= range.start && fret <= range.end;
}

function NoteDot({ marker, isRoot }: { marker: string; isRoot: boolean }) {
  return (
    <span
      className={`relative z-20 flex h-6 min-w-6 items-center justify-center rounded-full border border-black/50 px-1 text-[10px] font-black text-black shadow-[0_1px_2px_rgba(0,0,0,0.65)] sm:h-7 sm:min-w-7 sm:text-xs ${
        isRoot ? "agcRootNote bg-[#ff8300]" : "agcScaleNote bg-[#ffc107]"
      }`}
    >
      {marker}
    </span>
  );
}

function FretMarker({ fret }: { fret: number }) {
  if (DOUBLE_FRET_MARKS.has(fret)) {
    return (
      <>
        <span className="absolute left-1/2 top-[30%] z-0 h-2 w-2 -translate-x-1/2 rounded-full bg-white/90" />
        <span className="absolute left-1/2 top-[70%] z-0 h-2 w-2 -translate-x-1/2 rounded-full bg-white/90" />
      </>
    );
  }
  if (FRET_MARKS.has(fret)) {
    return <span className="absolute left-1/2 top-1/2 z-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />;
  }
  return null;
}

export function Fretboard({ root, scaleId, showIntervals = false, startFret = 0, displayFrets = 21, viewMode = "full", positionStartFret = null, positionEndFret = null }: Props) {
  const notes = buildScaleFretboard(root, scaleId, startFret, displayFrets);
  const scaleNotes = getScaleNotes(root, scaleId);
  const frets = Array.from({ length: displayFrets + 1 }, (_, index) => startFret + index);

  const noteFor = (stringNumber: number, fret: number) => notes.find((note) => note.stringNumber === stringNumber && note.fret === fret);
  const fretCellWidth = frets.length > 12 ? 42 : 34;
  const boardMinWidth = Math.max(318, 42 + frets.length * fretCellWidth);

  return (
    <div data-agc-fretboard="horizontal" className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/30 sm:p-3">
      <div className="mb-3 flex flex-wrap gap-1.5 text-[11px] text-zinc-400 sm:text-xs">
        {scaleNotes.map((item) => (
          <span key={`${item.interval}-${item.note}`} className={`rounded-full px-2.5 py-1 font-bold ${item.note === root ? "bg-[#ff8300] text-black" : "bg-zinc-900 text-zinc-100"}`}>
            {item.interval}: {item.note}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded bg-[#333] p-2 [scrollbar-width:thin]">
        <div style={{ minWidth: boardMinWidth }}>
          <div className="ml-8 grid text-center text-[10px] font-medium text-zinc-200 sm:ml-9" style={{ gridTemplateColumns: `repeat(${frets.length}, minmax(0, 1fr))` }}>
            {frets.map((fret) => <span key={fret}>{fret}</span>)}
          </div>

          {stringLabels.map((label, visualIndex) => {
            const stringNumber = 1 + visualIndex;
            return (
              <div key={`${label}-${visualIndex}`} className="grid items-center" style={{ gridTemplateColumns: `32px repeat(${frets.length}, minmax(0, 1fr))` }}>
                <span className="text-xs font-medium text-zinc-100">{label}</span>
                {frets.map((fret) => {
                  const note = noteFor(stringNumber, fret);
                  const show = note ? shouldShowScaleNote(viewMode, stringNumber, fret, note.inScale, positionStartFret, positionEndFret) : false;
                  const selected = isInsideSelectedPosition(viewMode, stringNumber, fret, positionStartFret, positionEndFret);
                  return (
                    <div key={`${stringNumber}-${fret}`} className={`relative flex h-8 items-center justify-center border-l border-[#9b8f79] bg-[#333] first:border-l-4 first:border-zinc-300 sm:h-9 ${selected ? "shadow-[inset_0_0_18px_rgba(239,68,68,0.32)] ring-1 ring-inset ring-red-500/25" : ""}`}>
                      <span className="absolute left-0 right-0 top-1/2 z-10 h-[2px] -translate-y-1/2 bg-gradient-to-b from-[#787878] to-[#bbaf9b] shadow-sm" />
                      <FretMarker fret={fret} />
                      {show && note ? <NoteDot marker={showIntervals ? note.interval ?? note.note : note.note} isRoot={note.isRoot} /> : null}
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
