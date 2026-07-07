"use client";

import { useMemo, useState } from "react";
import { ChordDiagram } from "@/app/components/ChordDiagram";
import type { ChordDefinition } from "@/lib/music-theory";

type Props = {
  chord: ChordDefinition | null;
  onClose: () => void;
};

const FAVORITE_CHORDS_KEY = "guitarhub.favoriteChords.v1";

const difficultyLabel: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};

function readFavoriteChords() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITE_CHORDS_KEY) ?? "[]") as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavoriteChords(chords: string[]) {
  window.localStorage.setItem(FAVORITE_CHORDS_KEY, JSON.stringify(chords));
}

export function ChordBottomSheet({ chord, onClose }: Props) {
  const [favoriteChords, setFavoriteChords] = useState<string[]>(() => readFavoriteChords());

  const isFavorite = Boolean(chord && favoriteChords.includes(chord.name));
  const easiestPosition = useMemo(() => {
    if (!chord) return null;
    return chord.positions.find((position) => position.difficulty === "beginner") ?? chord.positions[0] ?? null;
  }, [chord]);

  if (!chord) return null;

  function toggleFavorite() {
    if (!chord) return;
    const next = isFavorite ? favoriteChords.filter((item) => item !== chord.name) : [chord.name, ...favoriteChords.filter((item) => item !== chord.name)].slice(0, 24);
    setFavoriteChords(next);
    writeFavoriteChords(next);
  }

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

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <button onClick={toggleFavorite} className={`rounded-2xl p-4 text-left transition ${isFavorite ? "bg-red-600 text-white" : "bg-zinc-900 hover:bg-zinc-800"}`}>
            <p className="text-xs uppercase tracking-wide opacity-75">Favori / Çalış</p>
            <p className="mt-2 text-lg font-black">{isFavorite ? "Çalışma listende" : "Çalışılacak akorlara ekle"}</p>
          </button>
          <div className="rounded-2xl bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Notalar</p>
            <p className="mt-2 text-lg font-black text-red-300">{chord.notes.join(" · ")}</p>
          </div>
          <div className="rounded-2xl bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Kolay alternatif</p>
            <p className="mt-2 text-lg font-black">{easiestPosition ? easiestPosition.name : "Yok"}</p>
          </div>
        </div>

        {favoriteChords.length > 0 && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-950/15 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Çalışılacak akorlar</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {favoriteChords.map((favorite) => (
                <span key={favorite} className="shrink-0 rounded-full bg-zinc-900 px-3 py-2 font-mono text-sm font-black text-red-200">{favorite}</span>
              ))}
            </div>
          </div>
        )}

        {easiestPosition && (
          <article className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-3">
            <div className="mb-3 px-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">Önce bunu çalış</p>
              <h3 className="font-black">{easiestPosition.name}</h3>
            </div>
            <ChordDiagram position={easiestPosition} title={chord.name} />
          </article>
        )}

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
