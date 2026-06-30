"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { ChordBottomSheet } from "@/app/components/ChordBottomSheet";
import { ChordTextViewer } from "@/app/components/ChordTextViewer";
import { buildSongPayload, transposeText } from "@/lib/music";
import { CHORD_LIBRARY, type ChordDefinition } from "@/lib/music-theory";
import { supabase } from "@/lib/supabase";
import type { SongForm } from "@/lib/types";
import type { SongSearchResponse, SongSearchResult } from "@/lib/songSearch";

const NOT_FOUND_MESSAGE = "Şarkı bulunamadı.";

function resultToForm(result: SongSearchResult, favorite: boolean, chords: string): SongForm {
  return {
    title: result.title,
    artist: result.artist,
    key: result.key,
    bpm: "",
    lyrics: result.lyrics,
    chords,
    difficulty: "",
    capo: result.capo,
    notes: "",
    favorite,
  };
}

const FLAT_TO_SHARP: Record<string, string> = { Bb: "A#", Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#" };

function normalizeChordName(chordName: string) {
  return chordName
    .replace(/♯/g, "#")
    .trim()
    .replace(/^([A-G]b)/, (root) => FLAT_TO_SHARP[root] ?? root)
    .replace(/\/([A-G]b)/, (_, bass: string) => `/${FLAT_TO_SHARP[bass] ?? bass}`);
}

function findChord(chordName: string) {
  const normalized = normalizeChordName(chordName);
  return CHORD_LIBRARY.find((item) => item.name === normalized || item.aliases?.includes(normalized)) ?? null;
}

export default function SarkiAra() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [result, setResult] = useState<SongSearchResult | null>(null);
  const [editedChords, setEditedChords] = useState("");
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [selectedChord, setSelectedChord] = useState<ChordDefinition | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const transposedChords = useMemo(
    () => transposeText(editedChords, transposeSteps),
    [editedChords, transposeSteps],
  );

  const transposedKey = useMemo(() => {
    if (!result?.key) return "";
    return transposeText(result.key, transposeSteps);
  }, [result, transposeSteps]);

  function openChord(chordName: string) {
    const chord = findChord(chordName);
    if (chord) {
      setSelectedChord(chord);
      setMessage("");
      return;
    }
    setMessage(`${chordName} için akor örneği henüz kütüphanede yok.`);
  }

  async function searchSong() {
    setMessage("");
    setResult(null);
    setEditedChords("");
    setTransposeSteps(0);

    if (!title.trim()) {
      setMessage("Aramak için bir şarkı adı yazmalısın.");
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
    setEditedChords(payload.song.chords || payload.song.lyrics);
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

    const form = resultToForm({ ...result, key: transposedKey }, favorite, transposedChords);

    if (!form.title.trim() || !form.artist.trim()) {
      setMessage("Şarkı adı ve sanatçı zorunludur.");
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
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Akor ve söz arama</p>
          <h1 className="mt-3 text-4xl font-black">Şarkı Ara</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Şarkıyı bul, akorlara basıp örneğini gör, transpoze et ve tek tuşla repertuarına ekle.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              placeholder="Şarkı adı"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Sanatçı"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            />
            <button
              onClick={searchSong}
              disabled={loading}
              className="min-h-12 rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Aranıyor..." : "Ara"}
            </button>
          </div>

          {message && <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">{message}</p>}
        </section>

        {!loading && !result && !message && (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
            Aramak istediğin şarkının adını yaz.
          </div>
        )}

        {result && (
          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
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
                <button onClick={() => setTransposeSteps((value) => value - 1)} className="min-h-11 rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  -1
                </button>
                <button onClick={() => setTransposeSteps(0)} className="min-h-11 rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  {transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps}
                </button>
                <button onClick={() => setTransposeSteps((value) => value + 1)} className="min-h-11 rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  +1
                </button>
                <button
                  onClick={() => setFavorite((value) => !value)}
                  className={`min-h-11 rounded-lg px-4 py-3 font-bold ${favorite ? "bg-red-600 hover:bg-red-500" : "bg-zinc-800 hover:bg-zinc-700"}`}
                >
                  {favorite ? "Favoride" : "Favorilere Ekle"}
                </button>
                <button
                  onClick={addToRepertoire}
                  disabled={saving}
                  className="min-h-11 rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Ekleniyor..." : "Repertuara Ekle"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 sm:p-4">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-zinc-400">Akorlar ve Sözler</h3>
              <ChordTextViewer text={transposedChords} onChordClick={openChord} size="compact" />
              {result.lyrics && result.lyrics.trim() && result.lyrics.trim() !== editedChords.trim() && (
                <details className="mt-4 rounded-2xl bg-zinc-950 p-4 text-zinc-300">
                  <summary className="cursor-pointer font-bold text-zinc-200">Sözleri ayrıca göster</summary>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-7">{result.lyrics}</pre>
                </details>
              )}
            </div>
          </section>
        )}
      </div>

      <ChordBottomSheet chord={selectedChord} onClose={() => setSelectedChord(null)} />
    </main>
  );
}
