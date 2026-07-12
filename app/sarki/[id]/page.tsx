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
const AUTO_SCROLL_INTERVAL_MS = 80;
const PLAY_MODE_FONT_FAMILY = {
  proportional: "Arial, Helvetica, sans-serif",
  monospace: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
} as const;
type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener?: (type: "release", listener: () => void) => void };

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

function isTechnicalTabContent(text: string) {
  return /[|][\-0-9hpsbx/\\~ ]{8,}[|]?/.test(text);
}

export default function SarkiDetay() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [shift, setShift] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedChord, setSelectedChord] = useState<ChordDefinition | null>(null);
  const [playMode, setPlayMode] = useState(false);
  const [playControlsVisible, setPlayControlsVisible] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [autoScrollLevel, setAutoScrollLevel] = useState(4);
  const [playFontSize, setPlayFontSize] = useState(1);
  const [keepScreenAwake, setKeepScreenAwake] = useState(false);
  const [wakeLockMessage, setWakeLockMessage] = useState("");
  const playTextRef = useRef<HTMLPreElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    async function loadSong() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

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

  useEffect(() => {
    if (!playMode || !autoScrollEnabled) return;
    const timer = window.setInterval(() => {
      if (!playTextRef.current) return;
      playTextRef.current.scrollTop += autoScrollLevel;
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoScrollEnabled, autoScrollLevel, playMode]);

  useEffect(() => {
    let cancelled = false;
    async function syncWakeLock() {
      if (!playMode || !keepScreenAwake) {
        await wakeLockRef.current?.release().catch(() => undefined);
        wakeLockRef.current = null;
        return;
      }
      const wakeLockApi = (navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> } }).wakeLock;
      if (!wakeLockApi) {
        setWakeLockMessage("Bu tarayıcı ekran açık tutmayı desteklemiyor.");
        return;
      }
      try {
        const lock = await wakeLockApi.request("screen");
        if (cancelled) {
          await lock.release().catch(() => undefined);
          return;
        }
        wakeLockRef.current = lock;
        setWakeLockMessage("Ekran açık tutuluyor");
        lock.addEventListener?.("release", () => setWakeLockMessage("Ekran kilidi bırakıldı"));
      } catch {
        setWakeLockMessage("Ekranı açık tutma izni alınamadı.");
        setKeepScreenAwake(false);
      }
    }
    void syncWakeLock();
    return () => {
      cancelled = true;
      void wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
    };
  }, [keepScreenAwake, playMode]);


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
                  Repertuvara dön
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
                <button onClick={() => { setPlayControlsVisible(true); setPlayMode(true); }} className="min-h-11 rounded-lg bg-white px-4 py-3 font-bold text-zinc-950 hover:bg-red-100">
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
              <section onClick={() => setPlayControlsVisible((value) => !value)} className="fixed inset-0 z-[80] flex flex-col bg-black text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_42%)]" />
                {playControlsVisible && (
                  <div onClick={(event) => event.stopPropagation()} className="relative z-10 m-2 rounded-[1.5rem] border border-white/10 bg-black/70 p-3 shadow-2xl shadow-black/70 backdrop-blur-xl transition sm:m-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">Sahne Modu · ekrana dokun gizle/göster</p>
                        <h2 className="truncate text-xl font-black sm:text-2xl">{song.title}</h2>
                        <p className="truncate text-xs text-zinc-400">{song.artist} {song.key ? `· Ton: ${transposeText(song.key, shift)}` : ""} {transposedCapo ? `· Capo: ${transposedCapo}` : ""}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setShift((value) => value - 1)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">-1</button>
                        <button onClick={() => setShift(0)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">Ton: {shift > 0 ? `+${shift}` : shift}</button>
                        <button onClick={() => setShift((value) => value + 1)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">+1</button>
                        <button onClick={() => setPlayFontSize((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">A-</button>
                        <button onClick={() => setPlayFontSize((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">A+</button>
                        <button onClick={() => setAutoScrollEnabled((value) => !value)} className={`rounded-xl px-3 py-2 text-sm font-black ${autoScrollEnabled ? "bg-red-600 hover:bg-red-500" : "bg-white/10 hover:bg-white/15"}`}>Oto Kaydır</button>
                        <button onClick={() => setKeepScreenAwake((value) => !value)} className={`rounded-xl px-3 py-2 text-sm font-black ${keepScreenAwake ? "bg-emerald-600 hover:bg-emerald-500" : "bg-white/10 hover:bg-white/15"}`}>Ekran Açık</button>
                        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-zinc-200">
                          Hız {autoScrollLevel}
                          <input type="range" min="1" max="10" value={autoScrollLevel} onChange={(event) => setAutoScrollLevel(Number(event.target.value))} className="w-24 accent-red-600" />
                        </label>
                        <button onClick={() => setPlayControlsVisible(false)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">Gizle</button>
                        {wakeLockMessage && <span className="rounded-xl bg-white/5 px-3 py-2 text-xs font-black text-zinc-300">{wakeLockMessage}</span>}
                        <button onClick={() => { setKeepScreenAwake(false); setAutoScrollEnabled(false); setPlayMode(false); }} className="rounded-xl bg-white px-3 py-2 text-sm font-black text-zinc-950 hover:bg-red-100">Çık</button>
                      </div>
                    </div>
                  </div>
                )}
                <pre
                  onClick={(event) => { event.stopPropagation(); setPlayControlsVisible((value) => !value); }}
                  ref={playTextRef}
                  style={{
                    fontSize: `${playFontSize}rem`,
                    fontFamily: isTechnicalTabContent(transposedChords) ? PLAY_MODE_FONT_FAMILY.monospace : PLAY_MODE_FONT_FAMILY.proportional,
                    tabSize: 4,
                    whiteSpace: "pre",
                  }}
                  className="relative z-0 m-2 min-h-0 flex-1 overflow-auto whitespace-pre rounded-[1.5rem] bg-zinc-950/95 p-4 leading-[1.48] text-zinc-100 shadow-inner shadow-black sm:m-4 sm:p-6"
                >
                  {transposedChords || "Akor/söz yok."}
                </pre>
                {!playControlsVisible && <div className="pointer-events-none fixed left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-zinc-300 backdrop-blur">Kontroller için ekrana dokun</div>}
              </section>
            )}
          </>
        )}
      </div>

      <ChordBottomSheet chord={selectedChord} onClose={() => setSelectedChord(null)} />
    </main>
  );
}
