"use client";

import { ChordDiagram } from "@/app/components/ChordDiagram";
import type { ChordDefinition } from "@/lib/music-theory";

type Props = {
  chord: ChordDefinition | null;
  onClose: () => void;
};

const difficultyLabel: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};

export function ChordBottomSheet({ chord, onClose }: Props) {
  if (!chord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <section
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:max-w-3xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-400">Akor detayı</p>
            <h2 className="mt-1 text-4xl font-black">{chord.name}</h2>
            <p className="mt-2 text-zinc-400">{chord.family} · Formül: {chord.formula.join(" ")}</p>
          </div>
          <button onClick={onClose} className="min-h-12 min-w-12 rounded-full bg-zinc-900 text-2xl font-black hover:bg-zinc-800" aria-label="Akor panelini kapat">
            ×
          </button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Notalar</p>
            <p className="mt-2 text-lg font-black text-red-300">{chord.notes.join(" · ")}</p>
          </div>
          <div className="rounded-2xl bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Pozisyon</p>
            <p className="mt-2 text-lg font-black">{chord.positions.length} alternatif</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {chord.positions.map((position) => (
            <article key={position.id} className="rounded-2xl bg-zinc-900 p-3">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <h3 className="font-black">{position.name}</h3>
                  <p className="text-sm text-zinc-400">Zorluk: {difficultyLabel[position.difficulty]}</p>
                </div>
                {position.barre && <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold">Barre {position.barre.fret}. perde</span>}
              </div>
              <ChordDiagram position={position} title={chord.name} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
