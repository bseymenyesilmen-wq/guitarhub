"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { supabase } from "@/lib/supabase";
import type { Setlist, SetlistSong, Song } from "@/lib/types";

type LoadedSetlistSong = SetlistSong & { songs?: Song | null };
type LoadedSetlist = Setlist & { setlist_songs?: LoadedSetlistSong[] };
const LOCAL_SETLISTS_KEY = "guitarhub.localSetlists.v1";

function readLocalSetlists(): LoadedSetlist[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_SETLISTS_KEY) ?? "[]") as LoadedSetlist[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalSetlists(setlists: LoadedSetlist[]) {
  window.localStorage.setItem(LOCAL_SETLISTS_KEY, JSON.stringify(setlists));
}

function sortedSetlistSongs(setlist?: LoadedSetlist | null) {
  return [...(setlist?.setlist_songs ?? [])].sort((a, b) => a.position - b.position);
}

export default function Repertuar() {
  const router = useRouter();
  const [setlists, setSetlists] = useState<LoadedSetlist[]>([]);
  const [ownSongs, setOwnSongs] = useState<Song[]>([]);
  const [storageMode, setStorageMode] = useState<"supabase" | "local">("supabase");
  const [selectedSetlistId, setSelectedSetlistId] = useState<number | null>(null);
  const [userId, setUserId] = useState("");
  const [query, setQuery] = useState("");
  const [newSetlistName, setNewSetlistName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadSetlists = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/giris");
      return;
    }

    setUserId(session.user.id);

    const { data: ownSongData } = await supabase
      .from("songs")
      .select("*")
      .eq("user_id", session.user.id)
      .ilike("notes", "%GUITARHUB_OWN_SONG%")
      .order("created_at", { ascending: false });
    setOwnSongs((ownSongData ?? []) as Song[]);

    const { data, error } = await supabase
      .from("setlists")
      .select("*, setlist_songs(id, setlist_id, song_id, position, created_at, songs(*))")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      const localSetlists = readLocalSetlists();
      setStorageMode("local");
      setMessage("Setlist tabloları henüz Supabase'de yok. Yerel cihaz modu ile devam ediyorsun.");
      setSetlists(localSetlists);
      setSelectedSetlistId((current) => current ?? localSetlists[0]?.id ?? null);
      setLoading(false);
      return;
    }

    const loaded = (data ?? []) as LoadedSetlist[];
    setStorageMode("supabase");
    setSetlists(loaded);
    setSelectedSetlistId((current) => current ?? loaded[0]?.id ?? null);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSetlists();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSetlists]);

  const selectedSetlist = useMemo(
    () => setlists.find((setlist) => setlist.id === selectedSetlistId) ?? setlists[0] ?? null,
    [selectedSetlistId, setlists],
  );

  const setlistSongs = useMemo(() => sortedSetlistSongs(selectedSetlist), [selectedSetlist]);

  const visibleSetlistSongs = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    if (!normalized) return setlistSongs;
    return setlistSongs.filter((item) => {
      const song = item.songs;
      return `${song?.artist ?? ""} ${song?.title ?? ""}`.toLocaleLowerCase("tr-TR").includes(normalized);
    });
  }, [query, setlistSongs]);

  async function createSetlist() {
    const name = newSetlistName.trim();
    setMessage("");

    if (!name) {
      setMessage("Setlist adı yaz.");
      return;
    }

    if (!userId && storageMode !== "local") {
      router.push("/giris");
      return;
    }

    if (storageMode === "local") {
      const now = new Date().toISOString();
      const created: LoadedSetlist = { id: Date.now(), user_id: "local", name, created_at: now, updated_at: now, setlist_songs: [] };
      const nextSetlists = [created, ...readLocalSetlists()];
      writeLocalSetlists(nextSetlists);
      setSetlists(nextSetlists);
      setSelectedSetlistId(created.id);
      setNewSetlistName("");
      setMessage("Setlist bu cihazda oluşturuldu.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("setlists")
      .insert({ name, user_id: userId })
      .select("*")
      .single();
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const created = { ...(data as Setlist), setlist_songs: [] } as LoadedSetlist;
    setSetlists((current) => [created, ...current]);
    setSelectedSetlistId(created.id);
    setNewSetlistName("");
    setMessage("Setlist oluşturuldu.");
  }

  async function deleteSetlistSong(item: LoadedSetlistSong) {
    setDeletingId(item.id);
    setMessage("");

    if (storageMode === "local") {
      const nextSetlists = readLocalSetlists().map((setlist) =>
        setlist.id === item.setlist_id
          ? { ...setlist, setlist_songs: (setlist.setlist_songs ?? []).filter((songItem) => songItem.id !== item.id) }
          : setlist,
      );
      writeLocalSetlists(nextSetlists);
      setSetlists(nextSetlists);
      setDeletingId(null);
      setMessage("Şarkı setlistten çıkarıldı.");
      return;
    }

    const { error } = await supabase.from("setlist_songs").delete().eq("id", item.id);
    setDeletingId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSetlists((current) =>
      current.map((setlist) =>
        setlist.id === item.setlist_id
          ? { ...setlist, setlist_songs: (setlist.setlist_songs ?? []).filter((songItem) => songItem.id !== item.id) }
          : setlist,
      ),
    );
    setMessage("Şarkı setlistten çıkarıldı.");
  }

  async function moveSetlistSong(item: LoadedSetlistSong, direction: -1 | 1) {
    if (!selectedSetlist) return;
    const ordered = sortedSetlistSongs(selectedSetlist);
    const index = ordered.findIndex((candidate) => candidate.id === item.id);
    const target = ordered[index + direction];
    if (!target) return;

    setMovingId(item.id);
    setMessage("");

    if (storageMode === "local") {
      const nextSetlists = readLocalSetlists().map((setlist) => {
        if (setlist.id !== selectedSetlist.id) return setlist;
        return {
          ...setlist,
          setlist_songs: (setlist.setlist_songs ?? []).map((songItem) => {
            if (songItem.id === item.id) return { ...songItem, position: target.position };
            if (songItem.id === target.id) return { ...songItem, position: item.position };
            return songItem;
          }),
        };
      });
      writeLocalSetlists(nextSetlists);
      setSetlists(nextSetlists);
      setMovingId(null);
      return;
    }

    const { error: firstError } = await supabase.from("setlist_songs").update({ position: target.position }).eq("id", item.id);
    const { error: secondError } = await supabase.from("setlist_songs").update({ position: item.position }).eq("id", target.id);
    setMovingId(null);

    if (firstError || secondError) {
      setMessage(firstError?.message ?? secondError?.message ?? "Sıralama değiştirilemedi.");
      return;
    }

    setSetlists((current) =>
      current.map((setlist) => {
        if (setlist.id !== selectedSetlist.id) return setlist;
        return {
          ...setlist,
          setlist_songs: (setlist.setlist_songs ?? []).map((songItem) => {
            if (songItem.id === item.id) return { ...songItem, position: target.position };
            if (songItem.id === target.id) return { ...songItem, position: item.position };
            return songItem;
          }),
        };
      }),
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Setlist klasörleri</p>
          <h1 className="mt-3 text-4xl font-black">Repertuarım</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Konser setlist, Acılı setlist veya prova klasörleri oluştur. Şarkı Ara ekranından parçaları istediğin setliste at.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/sarki-ara" className="inline-flex min-h-11 items-center rounded-full bg-red-600 px-5 font-bold hover:bg-red-500">
              Şarkı ara ve ekle
            </Link>
            {storageMode === "local" && <span className="inline-flex min-h-11 items-center rounded-full bg-zinc-800 px-4 text-sm font-bold text-zinc-300">Yerel cihaz modu</span>}
          </div>
        </section>

        {message && <p className="mb-4 rounded-lg bg-zinc-900 p-3 text-sm text-zinc-200">{message}</p>}

        <section className="mb-5 rounded-3xl border border-red-500/25 bg-gradient-to-br from-zinc-900 to-red-950/25 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Kendi Şarkıların</p>
              <h2 className="mt-1 text-2xl font-black">Şarkı Yaz’dan kaydedilenler</h2>
            </div>
            <Link href="/sarki-yaz" className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 hover:bg-red-100">
              Yeni şarkı yaz
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ownSongs.map((song) => (
              <Link key={song.id} href={`/sarki/${song.id}`} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-red-500/60 hover:bg-zinc-900">
                <strong className="line-clamp-1 text-white">{song.title}</strong>
                <span className="mt-1 block text-sm text-zinc-400">Ton: {song.key || "-"} · BPM: {song.bpm || "-"}</span>
                <span className="mt-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">Aç</span>
              </Link>
            ))}
            {ownSongs.length === 0 && <p className="rounded-2xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">Şarkı Yaz’dan repertuvara kaydedince burada görünecek.</p>}
          </div>
        </section>

        <section className="mb-5 grid gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_auto]">
          <input
            className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
            placeholder="Yeni Setlist adı: Konser setlist, Acılı setlist..."
            value={newSetlistName}
            onChange={(event) => setNewSetlistName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void createSetlist();
            }}
          />
          <button
            onClick={createSetlist}
            disabled={saving}
            className="min-h-12 rounded-xl bg-red-600 px-5 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Oluşturuluyor..." : "Yeni Setlist"}
          </button>
        </section>

        {loading ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">Repertuar yükleniyor...</div>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 lg:sticky lg:top-4 lg:self-start">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black">Setlistler</h2>
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-bold text-zinc-400">{setlists.length}</span>
              </div>
              <div className="mt-4 space-y-2">
                {setlists.map((setlist) => {
                  const count = setlist.setlist_songs?.length ?? 0;
                  const lastSong = sortedSetlistSongs(setlist).at(-1)?.songs;
                  return (
                    <button
                      key={setlist.id}
                      onClick={() => setSelectedSetlistId(setlist.id)}
                      className={`w-full rounded-2xl p-4 text-left hover:bg-zinc-800 ${selectedSetlist?.id === setlist.id ? "bg-red-600/20 ring-1 ring-red-600" : "bg-zinc-950"}`}
                    >
                      <span className="block truncate font-black">{setlist.name}</span>
                      <span className="mt-1 block text-sm text-zinc-500">{count} şarkı</span>
                      <span className="mt-1 block truncate text-xs text-zinc-600">Son eklenen: {lastSong ? `${lastSong.artist} - ${lastSong.title}` : "Henüz yok"}</span>
                    </button>
                  );
                })}

                {setlists.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">
                    Henüz setlist yok. Mesela “Konser setlist” diye bir klasör oluştur.
                  </div>
                )}
              </div>
            </aside>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
              {selectedSetlist ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">Setlist içi</p>
                      <h2 className="mt-1 text-2xl font-black">{selectedSetlist.name}</h2>
                      <p className="mt-1 text-sm text-zinc-500">{setlistSongs.length} şarkı</p>
                    </div>
                    <input
                      className="min-h-11 rounded-xl border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
                      placeholder="Bu setlistte ara"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {visibleSetlistSongs.map((item, index) => {
                      const song = item.songs;
                      if (!song) return null;
                      return (
                        <div key={item.id} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 font-black text-red-300">{index + 1}</span>
                          {storageMode === "local" ? (
                            <details className="min-w-0 rounded-xl p-1">
                              <summary className="cursor-pointer list-none rounded-xl hover:bg-zinc-800/60">
                                <h3 className="truncate text-lg font-bold">{song.title}</h3>
                                <p className="truncate text-sm text-zinc-400">
                                  {song.artist}
                                  {song.key ? ` - Ton: ${song.key}` : ""}
                                  {song.capo ? ` - Capo: ${song.capo}` : ""}
                                </p>
                              </summary>
                              <pre className="mt-3 max-h-80 overflow-auto rounded-2xl bg-zinc-900 p-4 text-sm leading-7 text-zinc-200">
                                {song.chords?.trim() || song.lyrics?.trim() || "Akor/söz kaydı yok."}
                              </pre>
                            </details>
                          ) : (
                            <Link href={`/sarki/${song.id}`} className="min-w-0 rounded-xl p-1 hover:bg-zinc-800/60">
                              <h3 className="truncate text-lg font-bold">{song.title}</h3>
                              <p className="truncate text-sm text-zinc-400">
                                {song.artist}
                                {song.key ? ` - Ton: ${song.key}` : ""}
                                {song.capo ? ` - Capo: ${song.capo}` : ""}
                              </p>
                            </Link>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => moveSetlistSong(item, -1)}
                              disabled={index === 0 || movingId === item.id}
                              className="min-h-10 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Yukarı
                            </button>
                            <button
                              onClick={() => moveSetlistSong(item, 1)}
                              disabled={index === visibleSetlistSongs.length - 1 || movingId === item.id}
                              className="min-h-10 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Aşağı
                            </button>
                            <button
                              onClick={() => deleteSetlistSong(item)}
                              disabled={deletingId === item.id}
                              className="min-h-10 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === item.id ? "Siliniyor..." : "Çıkar"}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {visibleSetlistSongs.length === 0 && (
                      <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                        Bu setlistte şarkı yok. Şarkı Ara’dan “Repertuvara Ekle” ile parça ekle.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                  İlk setlistini oluşturunca şarkılarını burada klasör gibi göreceksin.
                </div>
              )}
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
