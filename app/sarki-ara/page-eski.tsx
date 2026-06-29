"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { buildSongPayload } from "@/lib/music";
import { supabase } from "@/lib/supabase";
import type { SongForm } from "@/lib/types";

const SAMPLE_CHORDS = `Am        G
Huzunler basima vurdu yine

F             E
Sevginin cikmaz yollarinda`;

const SAMPLE_LYRICS = `Huzunler basima vurdu yine
Sevginin cikmaz yollarinda
Bir sarki arar kalbim bu gece
Gitarin sessiz tellerinde`;

export default function SarkiAra() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [result, setResult] = useState<SongForm | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchSong() {
    setMessage("");

    if (!query.trim()) {
      setMessage("Aramak icin bir sarki adi yazmalisin.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setResult({
      title: query.trim(),
      artist: artist.trim() || "Bilinmeyen sanatci",
      key: "Am",
      bpm: "",
      lyrics: SAMPLE_LYRICS,
      chords: SAMPLE_CHORDS,
      difficulty: "Orta",
      capo: "Yok",
      notes: "Internet aramasi icin hazir taslak. Kaydetmeden once soz ve akorlari kontrol edebilirsin.",
      favorite,
    });
    setLoading(false);
  }

  async function addToRepertoire() {
    if (!result) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/giris");
      return;
    }

    if (!result.title.trim() || !result.artist.trim()) {
      setMessage("Sarki adi ve sanatci zorunludur.");
      return;
    }

    const { error } = await supabase.from("songs").insert(buildSongPayload(result, session.user.id));

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Sarki repertuara eklendi.");
    router.push("/repertuar");
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-5xl">
        <AppNav />

        <section className="mb-6">
          <h1 className="text-4xl font-black">Sarki Ara</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Sarki adi ve sanatci gir; uygulama icinde akor, ton ve capo bilgisi icin duzenlenebilir bir sonuc olustur.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              placeholder="Sarki adi"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Sanatci"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            />
            <button onClick={searchSong} disabled={loading} className="rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:opacity-60">
              {loading ? "Araniyor..." : "Ara"}
            </button>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={favorite} onChange={(event) => setFavorite(event.target.checked)} />
            Bulunan sarkiyi favori olarak isaretle
          </label>

          {message && <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">{message}</p>}
        </section>

        {result ? (
          <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{result.title}</h2>
                <p className="mt-1 text-zinc-400">
                  {result.artist} - Ton: {result.key || "-"} - Capo: {result.capo || "-"}
                </p>
              </div>
              <button onClick={addToRepertoire} className="rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500">
                Repertuara Ekle
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <textarea
                value={result.chords as string}
                onChange={(event) => setResult({ ...result, chords: event.target.value })}
                className="min-h-72 rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm leading-7 text-red-400 outline-none focus:border-red-500"
              />
              <textarea
                value={result.lyrics as string}
                onChange={(event) => setResult({ ...result, lyrics: event.target.value })}
                className="min-h-72 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-7 text-zinc-100 outline-none focus:border-red-500"
              />
            </div>
          </section>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
            Arama sonucu burada gorunecek.
          </div>
        )}
      </div>
    </main>
  );
}