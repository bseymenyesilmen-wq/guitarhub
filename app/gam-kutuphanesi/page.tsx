"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { SCALE_LIBRARY } from "@/lib/library";

export default function GamKutuphanesi() {
  const [category, setCategory] = useState("Tum");

  const scales = useMemo(
    () => SCALE_LIBRARY.filter((scale) => category === "Tum" || scale.category === category),
    [category],
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6">
          <h1 className="text-4xl font-black">Gam Kutuphanesi</h1>
          <p className="mt-2 text-zinc-400">Major, minor, pentatonik, blues ve mod pozisyonlarini incele.</p>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          {["Tum", "Major", "Minor", "Pentatonik", "Blues", "Mod"].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${category === item ? "bg-red-600" : "bg-zinc-900 hover:bg-zinc-800"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          {scales.map((scale) => (
            <article key={scale.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{scale.name}</h2>
                  <p className="text-sm text-zinc-400">{scale.category}</p>
                </div>
                <span className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-red-400">
                  {scale.notes.join(" - ")}
                </span>
              </div>

              <p className="mb-3 text-sm text-zinc-300">Pozisyonlar: {scale.positions.join(", ")}</p>
              <pre className="rounded-lg bg-zinc-950 p-4 font-mono text-sm leading-7 text-zinc-100">
                {scale.diagram.join("\n")}
              </pre>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}