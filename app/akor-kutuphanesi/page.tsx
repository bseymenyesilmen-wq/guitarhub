"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { ChordBottomSheet } from "@/app/components/ChordBottomSheet";
import { ChordDiagram } from "@/app/components/ChordDiagram";
import { CHORD_LIBRARY, type ChordDefinition } from "@/lib/music-theory";

const FAMILY_FILTERS = ["Tümü", "Major", "Minor", "7", "Maj7", "Min7", "Sus", "Add9", "Slash", "Barre", "Dim", "Aug"];

export default function AkorKutuphanesi() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("Tümü");
  const [selectedChord, setSelectedChord] = useState<ChordDefinition | null>(null);

  const chords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return CHORD_LIBRARY.filter((chord) => {
      const familyMatch =
        family === "Tümü" ||
        chord.family.toLowerCase().includes(family.toLowerCase()) ||
        chord.name.toLowerCase().includes(family.toLowerCase());
      const textMatch =
        !normalized ||
        chord.name.toLowerCase().includes(normalized) ||
        chord.family.toLowerCase().includes(normalized) ||
        chord.notes.join(" ").toLowerCase().includes(normalized) ||
        chord.formula.join(" ").toLowerCase().includes(normalized);
      return familyMatch && textMatch;
    });
  }, [family, query]);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-400">Profesyonel akor sistemi</p>
          <h1 className="mt-3 text-4xl font-black">Akor Kütüphanesi</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Major, minor, 7, maj7, min7, sus, add9, slash ve barre akorlarını notaları, formülü, parmak numarası ve zorluk seviyesiyle incele.
          </p>
        </section>

        <div className="sticky top-0 z-20 mb-6 space-y-3 bg-zinc-950/95 py-3 backdrop-blur">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="A, Am, A7, F#m, Bm7, G#dim..."
            className="min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 outline-none focus:border-red-500"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FAMILY_FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFamily(item)}
                className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold ${family === item ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chords.map((chord) => {
            const mainPosition = chord.positions[0];
            return (
              <button
                key={chord.name}
                onClick={() => setSelectedChord(chord)}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 text-left hover:border-red-500/70 hover:bg-zinc-900/80"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-3xl font-black text-white">{chord.name}</h2>
                    <p className="text-sm text-zinc-400">{chord.family} · {chord.formula.join(" ")}</p>
                  </div>
                  <span className="rounded-2xl bg-red-600 px-3 py-2 text-sm font-bold">
                    {chord.notes.join(" · ")}
                  </span>
                </div>

                <ChordDiagram position={mainPosition} title={chord.name} />
                <p className="mt-3 text-center text-sm font-semibold text-red-300">Detay ve alternatifler için dokun</p>
              </button>
            );
          })}
        </section>

        {chords.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
            Eşleşen akor bulunamadı.
          </div>
        )}
      </div>

      <ChordBottomSheet chord={selectedChord} onClose={() => setSelectedChord(null)} />
    </main>
  );
}
