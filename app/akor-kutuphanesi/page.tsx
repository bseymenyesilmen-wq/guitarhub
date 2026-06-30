"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { ChordBottomSheet } from "@/app/components/ChordBottomSheet";
import { ChordDiagram } from "@/app/components/ChordDiagram";
import { CHORD_LIBRARY, NOTE_NAMES, type ChordDefinition } from "@/lib/music-theory";

const FAVORITE_CHORDS_KEY = "guitarhub.favoriteChords";

const FLAT_NOTE_MAP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

const SHARP_TO_FLAT_MAP: Record<string, string> = Object.fromEntries(Object.entries(FLAT_NOTE_MAP).map(([flat, sharp]) => [sharp, flat]));

type NoteFilter = { value: string; label: string; flatLabel?: string };

const NOTE_FILTERS: NoteFilter[] = [
  { value: "Tümü", label: "Tümü" },
  ...NOTE_NAMES.map((note) => ({ value: note, label: note, flatLabel: SHARP_TO_FLAT_MAP[note] })),
];

function normalizeChordSearch(value: string) {
  let normalized = value.trim();
  for (const [flat, sharp] of Object.entries(FLAT_NOTE_MAP)) {
    normalized = normalized.replace(new RegExp(flat, "gi"), sharp);
  }

  return normalized.toLowerCase();
}

function chordFlatName(chord: ChordDefinition) {
  const flatRoot = SHARP_TO_FLAT_MAP[chord.root];
  if (!flatRoot) return "";
  return `${flatRoot}${chord.name.slice(chord.root.length)}`;
}

function loadFavoriteChords() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITE_CHORDS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function AkorKutuphanesi() {
  const [query, setQuery] = useState("");
  const [selectedRoot, setSelectedRoot] = useState("Tümü");
  const [selectedChord, setSelectedChord] = useState<ChordDefinition | null>(null);
  const [favoriteChords, setFavoriteChords] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setFavoriteChords(loadFavoriteChords()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const favoriteChordItems = useMemo(
    () => favoriteChords.map((name) => CHORD_LIBRARY.find((chord) => chord.name === name)).filter((chord): chord is ChordDefinition => Boolean(chord)),
    [favoriteChords],
  );

  function toggleFavorite(chordName: string) {
    setFavoriteChords((current) => {
      const next = current.includes(chordName) ? current.filter((item) => item !== chordName) : [...current, chordName];
      window.localStorage.setItem(FAVORITE_CHORDS_KEY, JSON.stringify(next));
      return next;
    });
  }

  const chords = useMemo(() => {
    const normalized = normalizeChordSearch(query);
    return CHORD_LIBRARY.filter((chord) => {
      const rootMatch = selectedRoot === "Tümü" || chord.root === selectedRoot;
      const flatName = chordFlatName(chord).toLowerCase();
      const textMatch =
        !normalized ||
        chord.name.toLowerCase().includes(normalized) ||
        flatName.includes(normalized) ||
        chord.family.toLowerCase().includes(normalized) ||
        chord.notes.join(" ").toLowerCase().includes(normalized) ||
        chord.formula.join(" ").toLowerCase().includes(normalized);
      return rootMatch && textMatch;
    });
  }, [query, selectedRoot]);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-400">Profesyonel akor sistemi</p>
          <h1 className="mt-3 text-4xl font-black">Akor Kütüphanesi</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Önce notayı seç, sonra o notanın major, minor, 7, maj7, min7, sus, add9, slash ve diğer akorlarını tek yerde incele.
          </p>
        </section>

        <div className="sticky top-0 z-20 mb-6 space-y-3 bg-zinc-950/95 py-3 backdrop-blur">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="A, Am, Bb, Ebmaj7, F#m, C5..."
            className="min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 outline-none focus:border-red-500"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {NOTE_FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedRoot(item.value)}
                className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-bold ${selectedRoot === item.value ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
              >
                <span className="block leading-none">{item.label}</span>
                {item.flatLabel && <span className="mt-1 block text-[10px] leading-none text-zinc-400">{item.flatLabel}</span>}
              </button>
            ))}
          </div>

          {favoriteChordItems.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Çalışılacak akorlar</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {favoriteChordItems.map((chord) => (
                  <button
                    key={chord.name}
                    onClick={() => setSelectedChord(chord)}
                    className="shrink-0 rounded-full bg-red-600/15 px-4 py-2 text-sm font-black text-red-200 hover:bg-red-600 hover:text-white"
                  >
                    ★ {chordFlatName(chord) ? `${chord.name} / ${chordFlatName(chord)}` : chord.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chords.map((chord) => {
            const mainPosition = chord.positions.find((position) => position.difficulty === "beginner") ?? chord.positions[0];
            const flatName = chordFlatName(chord);
            const isFavorite = favoriteChords.includes(chord.name);
            return (
              <article
                key={chord.name}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedChord(chord)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedChord(chord);
                  }
                }}
                className="relative rounded-3xl border border-zinc-800 bg-zinc-900 p-4 text-left hover:border-red-500/70 hover:bg-zinc-900/80"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(chord.name);
                  }}
                  className={`absolute right-3 top-3 min-h-10 min-w-10 rounded-full text-lg font-black ${isFavorite ? "bg-red-600 text-white" : "bg-zinc-950 text-zinc-500 hover:text-red-300"}`}
                  aria-label={isFavorite ? `${chord.name} çalışılacaklardan çıkar` : `${chord.name} çalışılacaklara ekle`}
                >
                  {isFavorite ? "★" : "☆"}
                </button>

                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-3xl font-black text-white">{chord.name}</h2>
                    {flatName && <p className="text-sm font-bold text-red-300">{flatName}</p>}
                    <p className="text-sm text-zinc-400">{chord.family} · {chord.formula.join(" ")}</p>
                  </div>
                  <span className="mr-10 rounded-2xl bg-red-600 px-3 py-2 text-sm font-bold">
                    {chord.notes.join(" · ")}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-zinc-300">{chord.positions.length} varyasyon</span>
                  <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-zinc-300">{chord.family}</span>
                </div>

                <ChordDiagram position={mainPosition} title={chord.name} />
                <p className="mt-3 text-center text-sm font-semibold text-red-300">Detay ve alternatifler için dokun</p>
              </article>
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
