"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { ChordBottomSheet } from "@/app/components/ChordBottomSheet";
import { ChordTextViewer } from "@/app/components/ChordTextViewer";
import { extractChords, transposeCapo, transposeText } from "@/lib/music";
import { CHORD_LIBRARY, type ChordDefinition } from "@/lib/music-theory";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/lib/types";

const FLAT_TO_SHARP: Record<string, string> = { Bb: "A#", Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#" };
const RECENT_SONGS_KEY = "guitarhub.recentSongs.v1";
const AUTO_SCROLL_SPEEDS = { off: 0, slow: 1, medium: 2, fast: 3 } as const;
type AutoScrollSpeed = keyof typeof AUTO_SCROLL_SPEEDS;

function saveRecentSong(song: Song) {
  if (typeof window === "undefined") return;
  const entry = { id: song.id, title: song.title, artist: song.artist, key: song.key, capo: song.capo, openedAt: new Date().toISOString() };
  try {
    const current = JSON.parse(window.localStorage.getItem(RECENT_SONGS_KEY) ?? "[]") as Array<typeof entry>;
    const next = [entry, ...current.filter((item) => item.id !== song.id)].slice(0, 8);
    window.localStorage.setItem(RECENT_SONGS_KEY, JSON.stringify(next));
  } catch {
    window.localStorage.setItem(RECENT_SONGS_KEY, JSON.stringify([entry]));
  }
}

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
  const [playMode, setPlayMode] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<AutoScrollSpeed>("off");
  const [playFontSize, setPlayFontSize] = useState(1);
  const playTextRef = useRef<HTMLPreElement | null>(null);

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
        saveRecentSong(data as Song);
      }

      setLoading(false);
    }

    loadSong();
  }, [params.id, router]);

  useEffect(() => {
    if (!playMode || autoScrollSpeed === "off") return;
    const timer = window.setInterval(() => {
      if (!playTextRef.current) return;
      playTextRef.current.scrollTop += AUTO_SCROLL_SPEEDS[autoScrollSpeed];
    }, 80);
    return () => window.clearInterval(timer);
  }, [autoScrollSpeed, playMode]);

  const sourceText = song?.chords?.trim() || song?.lyrics?.trim() || "";
  const transposedChords = useMemo(() => transposeText(sourceText, shift), [shift, sourceText]);
  const transposedCapo = useMemo(() => transposeCapo(song?.capo, shift), [shift, song?.capo]);
  const chordList = useMemo(() => extractChords(transposedChords), [transposedChords]);
  const isOwnSong = Boolean(song?.notes?.includes("GUITARHUB_OWN_SONG"));

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
                  {song.artist} {song.key ? `- Ton: ${transposeText(song.key, shift)}` : ""} {transposedCapo ? `- Capo: ${transposedCapo}` : ""}
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
                <button onClick={() => setPlayMode(true)} className="min-h-11 rounded-lg bg-white px-4 py-3 font-bold text-zinc-950 hover:bg-red-100">
                  Çalma Modu
                </button>
                {isOwnSong && (
                  <Link href={`/sarki-yaz?songId=${song.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-3 font-bold text-zinc-950 hover:bg-red-100">
                    {"Şarkı Yaz'da Düzenle"}
                  </Link>
                )}
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

            {playMode && (
              <section className="fixed inset-0 z-[80] flex flex-col bg-zinc-950 p-2 text-white sm:p-4">
                <div className="mb-2 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-xl shadow-black/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">Prova/çalma modu · ekrana sığdırılmış</p>
                      <h2 className="truncate text-xl font-black sm:text-2xl">{song.title}</h2>
                      <p className="truncate text-xs text-zinc-400">{song.artist} {song.key ? `· Ton: ${transposeText(song.key, shift)}` : ""} {transposedCapo ? `· Capo: ${transposedCapo}` : ""}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setShift((value) => value - 1)} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-black hover:bg-zinc-700">-1</button>
                      <button onClick={() => setShift(0)} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-black hover:bg-zinc-700">Ton: {shift > 0 ? `+${shift}` : shift}</button>
                      <button onClick={() => setShift((value) => value + 1)} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-black hover:bg-zinc-700">+1</button>
                      <button onClick={() => setPlayFontSize((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-black hover:bg-zinc-700">A-</button>
                      <button onClick={() => setPlayFontSize((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-black hover:bg-zinc-700">A+</button>
                      <button onClick={() => setAutoScrollSpeed((value) => value === "off" ? "medium" : "off")} className={`rounded-lg px-3 py-2 text-sm font-black ${autoScrollSpeed === "off" ? "bg-zinc-800 hover:bg-zinc-700" : "bg-red-600 hover:bg-red-500"}`}>Oto Kaydır</button>
                      <select value={autoScrollSpeed} onChange={(event) => setAutoScrollSpeed(event.target.value as AutoScrollSpeed)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm font-black outline-none">
                        <option value="off">Kapalı</option>
                        <option value="slow">Yavaş</option>
                        <option value="medium">Orta</option>
                        <option value="fast">Hızlı</option>
                      </select>
                      <button onClick={() => { setAutoScrollSpeed("off"); setPlayMode(false); }} className="rounded-lg bg-white px-3 py-2 text-sm font-black text-zinc-950 hover:bg-red-100">Çık</button>
                    </div>
                  </div>
                </div>
                <pre ref={playTextRef} style={{ fontSize: `${playFontSize}rem` }} className="min-h-0 flex-1 overflow-auto whitespace-pre rounded-2xl bg-zinc-900 p-3 font-mono leading-[1.45] text-zinc-100 sm:p-4">
                  {transposedChords || "Akor/söz yok."}
                </pre>
              </section>
            )}
          </>
        )}
      </div>

      <ChordBottomSheet chord={selectedChord} onClose={() => setSelectedChord(null)} />
    </main>
  );
}
