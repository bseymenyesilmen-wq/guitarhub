"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { buildSongPayload, transposeText } from "@/lib/music";
import { supabase } from "@/lib/supabase";
import type { SongForm } from "@/lib/types";
import type { SongSearchResponse, SongSearchResult } from "@/lib/songSearch";

const NOT_FOUND_MESSAGE = "Şarkı bulunamadı.";

function isChordLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed) {
    return false;
  }

  const chordToken = /^(?:[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus)?(?:2|4|5|6|7|9|11|13)?(?:add9|maj7|m7|sus4)?(?:\/[A-G](?:#|b)?)?)$/;
  const tokens = trimmed.split(/\s+/);

  return tokens.length > 0 && tokens.every((token) => chordToken.test(token));
}

function resultToForm(
  result: SongSearchResult,
  favorite: boolean,
  chords: string,
  notes: string,
): SongForm {
  return {
    title: result.title,
    artist: result.artist,
    key: result.key,
    bpm: "",
    lyrics: result.lyrics,
    chords,
    difficulty: "",
    capo: result.capo,
    notes,
    favorite,
  };
}


export default function SarkiAra() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [result, setResult] = useState<SongSearchResult | null>(null);
  const [editedChords, setEditedChords] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const transposedChords = useMemo(
    () => transposeText(editedChords, transposeSteps),
    [editedChords, transposeSteps],
  );

  const transposedKey = useMemo(() => {
    if (!result?.key) {
      return "";
    }

    return transposeText(result.key, transposeSteps);
  }, [result, transposeSteps]);

  async function searchSong() {
    setMessage("");
    setResult(null);
    setEditedChords("");
    setPersonalNotes("");
    setTransposeSteps(0);

    if (!title.trim()) {
      setMessage("Aramak icin bir sarki adi yazmalisin.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/song-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        artist: artist.trim(),
      }),
    }).catch(() => null);

    setLoading(false);

    if (!response) {
      setMessage(NOT_FOUND_MESSAGE);
      return;
    }

    const payload = (await response.json().catch(() => null)) as SongSearchResponse | null;

    if (!response.ok || !payload || !payload.found) {
      setMessage(NOT_FOUND_MESSAGE);
      return;
    }

    setResult(payload.song);
    setEditedChords(payload.song.chords);
    
  }

  async function addToRepertoire() {
    setMessage("");

    if (!result) {
      setMessage(NOT_FOUND_MESSAGE);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/giris");
      return;
    }

    const form = resultToForm(
      { ...result, key: transposedKey },
      favorite,
      transposedChords,
      personalNotes,
    );

    if (!form.title.trim() || !form.artist.trim()) {
      setMessage("Sarki adi ve sanatci zorunludur.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("songs").insert(buildSongPayload(form, session.user.id));
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/repertuar");
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            Akor ve soz arama
          </p>
          <h1 className="mt-3 text-4xl font-black">Sarki Ara</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Lisansli veya izinli veri kaynagindan sarki bilgisi arar. Sonucu kaydetmeden once duzenleyebilirsin.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              placeholder="Sarki adi"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Sanatci"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            />
            <button
              onClick={searchSong}
              disabled={loading}
              className="rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Araniyor..." : "Ara"}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">
              {message}
            </p>
          )}
        </section>

        {!loading && !result && !message && (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
            Aramak istedigin sarkinin adini yaz.
          </div>
        )}

        {result && (
          <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{result.title}</h2>
                <p className="mt-1 text-zinc-400">
                  {result.artist}
                  {transposedKey ? ` - Ton: ${transposedKey}` : ""}
                  {result.capo ? ` - Capo: ${result.capo}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTransposeSteps((value) => value - 1)}
                  className="rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700"
                >
                  -1
                </button>
                <button
                  onClick={() => setTransposeSteps(0)}
                  className="rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700"
                >
                  {transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps}
                </button>
                <button
                  onClick={() => setTransposeSteps((value) => value + 1)}
                  className="rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700"
                >
                  +1
                </button>
                <button
                  onClick={() => setFavorite((value) => !value)}
                  className={`rounded-lg px-4 py-3 font-bold ${
                    favorite ? "bg-red-600 hover:bg-red-500" : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {favorite ? "Favoride" : "Favorilere Ekle"}
                </button>
                <button
                  onClick={addToRepertoire}
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Ekleniyor..." : "Repertuara Ekle"}
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-zinc-400">
                  Akorlar ve Sozler
                </h3>
                <div 
                  className="overflow-x-auto bg-zinc-950 p-6 rounded-lg text-[13px] md:text-[14px] leading-[1.8]"
                  style={{ 
                    fontFamily: 'Arial, Helvetica, sans-serif',
                  }}
                >
                  {transposedChords.split("\n").map((line, index) => {
                    if (!line.trim()) return <div key={index} className="h-4" />;

                    if (isChordLine(line)) {
                      return (
                        <pre key={index} className="m-0 text-red-500 whitespace-pre" style={{ fontFamily: 'inherit' }}>
                          {line}
                        </pre>
                      );
                    }

                    return (
                      <pre key={index} className="m-0 text-zinc-300 whitespace-pre" style={{ fontFamily: 'inherit' }}>
                        {line}
                      </pre>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-zinc-400">
                    Kişisel Notlar
                  </h3>

                  <textarea
                    value={personalNotes}
                    onChange={(event) => setPersonalNotes(event.target.value)}
                    placeholder="Bu şarkıyla ilgili kendi notlarını yaz..."
                    className="min-h-56 w-full resize-none bg-transparent font-mono text-sm leading-7 text-zinc-100 outline-none"
                  />
                </div>
                
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}