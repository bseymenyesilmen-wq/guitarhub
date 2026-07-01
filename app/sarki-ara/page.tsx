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
import type { SongArtistResult, SongSearchListItem, SongSearchResponse, SongSearchResult } from "@/lib/songSearch";

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
  const [artistResults, setArtistResults] = useState<SongArtistResult[]>([]);
  const [songResults, setSongResults] = useState<SongSearchListItem[]>([]);
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


  function resetSongView() {
    setResult(null);
    setEditedChords("");
    setTransposeSteps(0);
  }

  function openChord(chordName: string) {
    const chord = findChord(chordName);
    if (chord) {
      setSelectedChord(chord);
      setMessage("");
      return;
    }
    setMessage(`${chordName} için akor örneği henüz kütüphanede yok.`);
  }

  function applyPayload(payload: SongSearchResponse) {
    if (payload.found) {
      setArtistResults([]);
      setSongResults([]);
      setResult(payload.song);
      setEditedChords(payload.song.chords || payload.song.lyrics);
      return;
    }

    setArtistResults(payload.artists ?? []);
    setSongResults(payload.songs ?? []);
    setMessage(payload.message);
  }

  async function searchSong() {
    setMessage("");
    resetSongView();
    setArtistResults([]);
    setSongResults([]);

    if (!title.trim() && !artist.trim()) {
      setMessage("Sanatçı veya şarkı ara.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/song-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), artist: artist.trim() }),
    }).catch(() => null);

    setLoading(false);

    if (!response) {
      setMessage(NOT_FOUND_MESSAGE);
      return;
    }

    const payload = (await response.json().catch(() => null)) as SongSearchResponse | null;

    if (!response.ok || !payload) {
      setMessage(NOT_FOUND_MESSAGE);
      return;
    }

    applyPayload(payload);
  }

  async function selectArtist(artistName: string) {
    setArtist(artistName);
    setTitle("");
    setMessage("");
    resetSongView();
    setArtistResults([]);
    setSongResults([]);
    setLoading(true);

    const response = await fetch("/api/song-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artist: artistName }),
    }).catch(() => null);

    setLoading(false);

    const payload = response ? ((await response.json().catch(() => null)) as SongSearchResponse | null) : null;
    if (!response?.ok || !payload) {
      setMessage(NOT_FOUND_MESSAGE);
      return;
    }
    applyPayload(payload);
  }

  async function selectSong(song: SongSearchListItem) {
    setMessage("");
    resetSongView();
    setLoading(true);

    const response = await fetch("/api/song-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: song.source, artist: song.artist }),
    }).catch(() => null);

    setLoading(false);

    const payload = response ? ((await response.json().catch(() => null)) as SongSearchResponse | null) : null;
    if (!response?.ok || !payload || !payload.found) {
      setMessage(NOT_FOUND_MESSAGE);
      return;
    }

    applyPayload(payload);
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
            Sanatçı yazınca şarkıları listeler. Şarkı da yazarsan daha net arar. Önce Repertuarım, sonra Ultimate Guitar, uAkor ve Akorlar.com denenir.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              placeholder="Şarkı adı"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchSong();
              }}
              className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Sanatçı"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchSong();
              }}
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
          <p className="mt-3 text-sm text-zinc-500">Örnek: Sanatçıya Duman yaz; istersen şarkıya Senden Daha Güzel yaz.</p>

          {message && <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">{message}</p>}
        </section>

        {!loading && !result && !message && !songResults.length && !artistResults.length && (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
            Aramak istediğin sanatçıyı veya şarkıyı yaz.
          </div>
        )}

        {(artistResults.length > 0 || songResults.length > 0) && (
          <section className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="text-xl font-black">Sanatçılar</h2>
              <div className="mt-3 space-y-2">
                {artistResults.length ? (
                  artistResults.map((item) => (
                    <button
                      key={`${item.name}-${item.source ?? ""}`}
                      onClick={() => selectArtist(item.name)}
                      className="w-full rounded-2xl bg-zinc-950 p-4 text-left hover:bg-zinc-800"
                    >
                      <span className="block font-black">{item.name}</span>
                      <span className="mt-1 block text-sm text-zinc-500">{item.songCount ? `${item.songCount} şarkı` : "Şarkılarını listele"}</span>
                    </button>
                  ))
                ) : (
                  <p className="rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-500">Sanatçı sonucu yok.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Şarkılar</h2>
                  <p className="mt-1 text-sm text-zinc-500">Şarkıya basınca söz ve akor gelir.</p>
                </div>
                {songResults.length > 0 && <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold">{songResults.length} sonuç</span>}
              </div>
              <div className="mt-3 grid max-h-[560px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {songResults.map((song) => (
                  <button
                    key={song.source}
                    onClick={() => selectSong(song)}
                    className="rounded-2xl bg-zinc-950 p-4 text-left hover:bg-zinc-800"
                  >
                    <span className="block font-black">{song.title}</span>
                    <span className="mt-1 block text-sm text-zinc-500">
                      {song.artist}{song.provider ? ` - ${song.provider}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {result && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">{result.title}</h2>
                  <p className="mt-1 text-zinc-400">
                    {result.artist}
                    {transposedKey ? ` - Ton: ${transposedKey}` : ""}
                    {result.capo ? ` - Capo: ${result.capo}` : ""}
                    {result.provider ? ` - Kaynak: ${result.provider}` : ""}
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
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-400">Akorlar ve Sözler</h3>
                </div>
                <ChordTextViewer text={transposedChords} onChordClick={openChord} size="compact" />
                {result.lyrics && result.lyrics.trim() && result.lyrics.trim() !== editedChords.trim() && (
                  <details className="mt-4 rounded-2xl bg-zinc-950 p-4 text-zinc-300">
                    <summary className="cursor-pointer font-bold text-zinc-200">Sözleri ayrıca göster</summary>
                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-7">{result.lyrics}</pre>
                  </details>
                )}
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">Play next</p>
                <h3 className="mt-1 text-xl font-black">Sıradaki şarkılar</h3>
                <div className="mt-4 space-y-2">
                  {result.recommendations?.length ? (
                    result.recommendations.map((recommendation) => (
                      <button
                        key={recommendation.source}
                        onClick={() => selectSong(recommendation)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-zinc-950 p-3 text-left hover:bg-zinc-800"
                      >
                        <span
                          className="h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-red-600 to-zinc-800 bg-cover bg-center"
                          style={recommendation.cover ? { backgroundImage: `url(${recommendation.cover})` } : undefined}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-black">{recommendation.title}</span>
                          <span className="block truncate text-sm text-zinc-500">{recommendation.artist}</span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-500">Bu kaynak için öneri yok.</p>
                  )}
                </div>
              </div>
            </aside>
          </section>
        )}
      </div>

      <ChordBottomSheet chord={selectedChord} onClose={() => setSelectedChord(null)} />
    </main>
  );
}
