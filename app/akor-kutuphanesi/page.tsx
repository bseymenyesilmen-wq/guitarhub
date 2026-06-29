"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { CHORD_LIBRARY } from "@/lib/library";

export default function AkorKutuphanesi() {
  const [query, setQuery] = useState("");

  const chords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return CHORD_LIBRARY.filter(
      (chord) =>
        !normalized ||
        chord.name.toLowerCase().includes(normalized) ||
        chord.family.toLowerCase().includes(normalized) ||
        chord.notes.join(" ").toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6">
          <h1 className="text-4xl font-black">Akor Kutuphanesi</h1>
          <p className="mt-2 text-zinc-400">Akor ismi, aile veya notalara gore hizli arama yap.</p>
        </section>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="A, Am, A7, maj7..."
          className="mb-6 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-4 outline-none focus:border-red-500"
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chords.map((chord) => (
            <article key={chord.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white">{chord.name}</h2>
                  <p className="text-sm text-zinc-400">{chord.family}</p>
                </div>
                <span className="rounded-lg bg-red-600 px-3 py-1 text-sm font-bold">
                  {chord.notes.join(" - ")}
                </span>
              </div>

              <pre className="rounded-lg bg-zinc-950 p-4 font-mono text-sm leading-7 text-zinc-100">
                {chord.diagram.join("\n")}
              </pre>
            </article>
          ))}
        </section>

        {chords.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
            Eslesen akor bulunamadi.
          </div>
        )}
      </div>
    </main>
  );
}