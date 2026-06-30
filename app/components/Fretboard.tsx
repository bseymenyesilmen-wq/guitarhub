"use client";

import { buildScaleFretboard, getScaleNotes, type ScaleViewMode } from "@/lib/music-theory";

const stringLabels = ["E", "B", "G", "D", "A", "E"];
const FRET_MARKS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_FRET_MARKS = new Set([12]);

type FretboardOrientation = "horizontal" | "vertical";

type Props = {
  root: string;
  scaleId: string;
  showIntervals?: boolean;
  startFret?: number;
  displayFrets?: number;
  viewMode?: ScaleViewMode;
  orientation?: FretboardOrientation;
};

function diagonalWindow(stringNumber: number, startFret: number) {
  return startFret + Math.max(0, 6 - stringNumber);
}

function shouldShowScaleNote(viewMode: ScaleViewMode, stringNumber: number, fret: number, startFret: number, inScale: boolean) {
  if (!inScale) return false;
  if (viewMode !== "diagonal") return true;
  const diagonalStart = diagonalWindow(stringNumber, startFret);
  return fret >= diagonalStart && fret <= diagonalStart + 7;
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

export function Fretboard({ root, scaleId, showIntervals = false, startFret = 0, displayFrets = 21, viewMode = "full", orientation = "horizontal" }: Props) {
  const notes = buildScaleFretboard(root, scaleId, startFret, displayFrets);
  const scaleNotes = getScaleNotes(root, scaleId);
  const frets = Array.from({ length: displayFrets + 1 }, (_, index) => startFret + index);

  const noteFor = (stringNumber: number, fret: number) => notes.find((note) => note.stringNumber === stringNumber && note.fret === fret);

  if (orientation === "vertical") {
    return (
      <div data-agc-fretboard="vertical" className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl shadow-black/30">
        <div className="mb-3 flex flex-wrap gap-1.5 text-[11px] text-zinc-400 sm:text-xs">
          {scaleNotes.map((item) => (
            <span key={`${item.interval}-${item.note}`} className={`rounded-full px-2.5 py-1 font-bold ${item.note === root ? "bg-[#ff8300] text-black" : "bg-zinc-900 text-zinc-100"}`}>
              {item.interval}: {item.note}
            </span>
          ))}
        </div>
        <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded bg-[#333] p-2">
          <div className="grid grid-cols-[34px_repeat(6,minmax(0,1fr))] text-center text-[10px] font-bold text-zinc-200">
            <span />
            {stringLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
          </div>
          {frets.map((fret) => (
            <div key={fret} className="grid grid-cols-[34px_repeat(6,minmax(0,1fr))] items-center text-center text-[10px] text-zinc-200">
              <span className="font-bold">{fret}</span>
              {stringLabels.map((label, visualIndex) => {
                const stringNumber = 1 + visualIndex;
                const note = noteFor(stringNumber, fret);
                const show = note ? shouldShowScaleNote(viewMode, stringNumber, fret, startFret, note.inScale) : false;
                return (
                  <div key={`${label}-${fret}`} className="relative flex h-8 items-center justify-center border-t border-[#777] bg-[#333]">
                    <span className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-r from-[#eee] to-[#999]" />
                    <FretMarker fret={fret} />
                    {show && note ? <NoteDot marker={showIntervals ? note.interval ?? note.note : note.note} isRoot={note.isRoot} /> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-agc-fretboard="horizontal" className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl shadow-black/30">
      <div className="mb-3 flex flex-wrap gap-1.5 text-[11px] text-zinc-400 sm:text-xs">
        {scaleNotes.map((item) => (
          <span key={`${item.interval}-${item.note}`} className={`rounded-full px-2.5 py-1 font-bold ${item.note === root ? "bg-[#ff8300] text-black" : "bg-zinc-900 text-zinc-100"}`}>
            {item.interval}: {item.note}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded bg-[#333] p-2">
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
                const show = note ? shouldShowScaleNote(viewMode, stringNumber, fret, startFret, note.inScale) : false;
                return (
                  <div key={`${stringNumber}-${fret}`} className="relative flex h-8 items-center justify-center border-l border-[#9b8f79] bg-[#333] first:border-l-4 first:border-zinc-300 sm:h-9">
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
  );
}
