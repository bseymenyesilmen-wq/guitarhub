"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { ChordBottomSheet } from "@/app/components/ChordBottomSheet";
import { ChordTextViewer } from "@/app/components/ChordTextViewer";
import { extractChords, transposeText } from "@/lib/music";
import { CHORD_LIBRARY, type ChordDefinition } from "@/lib/music-theory";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/lib/types";

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

export default function SarkiDetay() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [userId, setUserId] = useState("");
  const [shift, setShift] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedChord, setSelectedChord] = useState<ChordDefinition | null>(null);

  useEffect(() => {
    async function loadSong() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        setMessage(error.message);
      } else {
        setSong(data as Song);
      }

      setLoading(false);
    }

    loadSong();
  }, [params.id, router]);

  const sourceText = song?.chords?.trim() || song?.lyrics?.trim() || "";
  const transposedChords = useMemo(() => transposeText(sourceText, shift), [shift, sourceText]);
  const chordList = useMemo(() => extractChords(transposedChords), [transposedChords]);

  function openChord(chordName: string) {
    const chord = findChord(chordName);
    if (chord) {
      setSelectedChord(chord);
      setMessage("");
      return;
    }
    setMessage(`${chordName} için akor örneği henüz kütüphanede yok.`);
  }

  async function toggleFavorite() {
    if (!song) return;

    const { error } = await supabase
      .from("songs")
      .update({ favorite: !song.favorite })
      .eq("id", song.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSong({ ...song, favorite: !song.favorite });
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-5xl">
        <AppNav />

        {loading && <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">Şarkı yükleniyor...</div>}
        {message && <div className="mb-4 rounded-lg border border-red-900 bg-red-950 p-4 text-red-100">{message}</div>}

        {song && (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href="/repertuar" className="text-sm font-semibold text-red-400 hover:text-red-300">
                  Repertuara dön
                </Link>
                <h1 className="mt-3 text-4xl font-black">{song.title}</h1>
                <p className="mt-2 text-zinc-400">
                  {song.artist} {song.key ? `- Ton: ${transposeText(song.key, shift)}` : ""} {song.capo ? `- Capo: ${song.capo}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShift((value) => value - 1)} className="min-h-11 rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  -1
                </button>
                <button onClick={() => setShift(0)} className="min-h-11 rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  Ton: {shift > 0 ? `+${shift}` : shift}
                </button>
                <button onClick={() => setShift((value) => value + 1)} className="min-h-11 rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  +1
                </button>
                <button onClick={toggleFavorite} className="min-h-11 rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-500">
                  {song.favorite ? "Favoride" : "Favorile"}
                </button>
              </div>
            </div>

            <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-xl font-bold">Kullanılan Akorlar</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {chordList.map((chord) => (
                  <button key={chord} onClick={() => openChord(chord)} className="min-h-11 rounded-lg bg-zinc-950 px-3 py-2 font-mono text-red-400 hover:bg-zinc-800">
                    {chord}
                  </button>
                ))}
                {chordList.length === 0 && <p className="text-zinc-400">Akor bilgisi eklenmemiş.</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
              <h2 className="mb-4 text-xl font-bold">Akorlar ve Sözler</h2>
              <ChordTextViewer text={transposedChords} onChordClick={openChord} />

              {song.lyrics?.trim() && song.lyrics.trim() !== song.chords?.trim() && (
                <details className="mt-4 rounded-2xl bg-zinc-950 p-4 text-zinc-300">
                  <summary className="cursor-pointer font-bold text-zinc-200">Sözleri ayrıca göster</summary>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-7">{song.lyrics}</pre>
                </details>
              )}
            </section>
          </>
        )}
      </div>

      <ChordBottomSheet chord={selectedChord} onClose={() => setSelectedChord(null)} />
    </main>
  );
}
