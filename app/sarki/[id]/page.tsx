"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { ChordBottomSheet } from "@/app/components/ChordBottomSheet";
import { extractChords, transposeText } from "@/lib/music";
import { CHORD_LIBRARY, type ChordDefinition } from "@/lib/music-theory";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/lib/types";

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

  const transposedChords = useMemo(() => transposeText(song?.chords ?? "", shift), [shift, song?.chords]);
  const chordList = useMemo(() => extractChords(transposedChords), [transposedChords]);

  function openChord(chordName: string) {
    const normalized = chordName.replace(/♯/g, "#").trim();
    const chord = CHORD_LIBRARY.find((item) => item.name === normalized || item.aliases?.includes(normalized));
    if (chord) {
      setSelectedChord(chord);
    } else {
      setMessage(`${chordName} için detaylı diyagram henüz kütüphanede yok.`);
    }
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

        {loading && <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">Sarki yukleniyor...</div>}
        {message && <div className="rounded-lg border border-red-900 bg-red-950 p-4 text-red-100">{message}</div>}

        {song && (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href="/repertuar" className="text-sm font-semibold text-red-400 hover:text-red-300">
                  Repertuara don
                </Link>
                <h1 className="mt-3 text-4xl font-black">{song.title}</h1>
                <p className="mt-2 text-zinc-400">
                  {song.artist} {song.key ? `- Ton: ${transposeText(song.key, shift)}` : ""} {song.capo ? `- Capo: ${song.capo}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShift((value) => value - 1)} className="rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  -1
                </button>
                <button onClick={() => setShift(0)} className="rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  Ton: {shift > 0 ? `+${shift}` : shift}
                </button>
                <button onClick={() => setShift((value) => value + 1)} className="rounded-lg bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700">
                  +1
                </button>
                <button onClick={toggleFavorite} className="rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-500">
                  {song.favorite ? "Favoride" : "Favorile"}
                </button>
              </div>
            </div>

            <section className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">BPM</p>
                <p className="mt-2 text-2xl font-black">{song.bpm ?? "-"}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Zorluk</p>
                <p className="mt-2 text-2xl font-black">{song.difficulty ?? "-"}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Akor Sayisi</p>
                <p className="mt-2 text-2xl font-black">{chordList.length}</p>
              </div>
            </section>

            <section className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-xl font-bold">Kullanilan Akorlar</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {chordList.map((chord) => (
                  <button key={chord} onClick={() => openChord(chord)} className="min-h-11 rounded-lg bg-zinc-950 px-3 py-2 font-mono text-red-400 hover:bg-zinc-800">
                    {chord}
                  </button>
                ))}
                {chordList.length === 0 && <p className="text-zinc-400">Akor bilgisi eklenmemis.</p>}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <h2 className="text-xl font-bold">Akorlar</h2>
                <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 font-mono text-sm leading-7 text-red-400">
                  {transposedChords || "Akor eklenmemis."}
                </pre>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
  <h2 className="text-xl font-bold">Kişisel Notlar</h2>

  <div className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-zinc-100 min-h-[400px]">
    {song.notes?.trim() || "Henüz kişisel not eklenmemiş."}
  </div>
</div>
            </section>


          </>
        )}
      </div>

      <ChordBottomSheet chord={selectedChord} onClose={() => setSelectedChord(null)} />
    </main>
  );
}
