"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { Fretboard } from "@/app/components/Fretboard";
import { NOTE_NAMES, SCALE_FORMULAS } from "@/lib/music-theory";

export default function GamKutuphanesi() {
  const [root, setRoot] = useState("C");
  const [scaleId, setScaleId] = useState("major");
  const [category, setCategory] = useState("Tümü");
  const [showIntervals, setShowIntervals] = useState(true);

  const scale = SCALE_FORMULAS.find((item) => item.id === scaleId) ?? SCALE_FORMULAS[0];
  const filteredScales = useMemo(
    () => SCALE_FORMULAS.filter((item) => category === "Tümü" || item.category === category),
    [category],
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-400">İnteraktif gitar klavyesi</p>
          <h1 className="mt-3 text-4xl font-black">Gam Kütüphanesi</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Root nota seç, gamı/modu belirle; klavye üzerinde root notaları kırmızı, diğer gam notaları mavi, interval dereceleriyle görünsün.
          </p>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-lg font-black">1. Root nota</h2>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {NOTE_NAMES.map((note) => (
                <button
                  key={note}
                  onClick={() => setRoot(note)}
                  className={`min-h-12 rounded-2xl text-sm font-black ${root === note ? "bg-red-600" : "bg-zinc-950 hover:bg-zinc-800"}`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black">2. Gam / Mod</h2>
              <label className="flex min-h-11 items-center gap-2 rounded-full bg-zinc-950 px-4 text-sm font-bold text-zinc-300">
                <input type="checkbox" checked={showIntervals} onChange={(event) => setShowIntervals(event.target.checked)} />
                Interval göster
              </label>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {["Tümü", "Major", "Minor", "Pentatonik", "Blues", "Mod"].map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold ${category === item ? "bg-red-600" : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {filteredScales.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScaleId(item.id)}
                  className={`rounded-2xl p-3 text-left ${scaleId === item.id ? "bg-red-600" : "bg-zinc-950 hover:bg-zinc-800"}`}
                >
                  <span className="block font-black">{root} {item.name}</span>
                  <span className="mt-1 block text-xs text-zinc-300">{item.formula.join(" ")}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">{root} {scale.name}</h2>
              <p className="mt-1 text-zinc-400">{scale.character}</p>
            </div>
            <span className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-bold text-red-300">
              {scale.genres.join(" · ")}
            </span>
          </div>
          <Fretboard root={root} scaleId={scaleId} showIntervals={showIntervals} />
          <p className="mt-3 text-sm text-zinc-500">Mobilde klavyeyi yatay kaydır; tablet/desktop görünümünde 0-12 perde aynı anda görünür.</p>
        </section>
      </div>
    </main>
  );
}
