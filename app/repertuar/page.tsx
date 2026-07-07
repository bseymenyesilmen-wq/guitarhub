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

function setlistAccent(index: number) {
  return ["from-red-600/25", "from-purple-600/25", "from-sky-600/20", "from-amber-500/20"][index % 4];
}

function RepertuarQuickCard({ title, value, helper, action, href, accent = false }: { title: string; value: string; helper: string; action: string; href: string; accent?: boolean }) {
  return (
    <Link href={href} className={`rounded-[1.6rem] border p-4 shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:border-red-400/70 ${accent ? "border-red-500/30 bg-gradient-to-br from-red-600/25 to-zinc-950" : "border-white/10 bg-zinc-900/80"}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{helper}</p>
      <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-950">{action}</span>
    </Link>
  );
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
  const [draggedSetlistSongId, setDraggedSetlistSongId] = useState<number | null>(null);
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

  async function reorderSetlistSong(draggedId: number | null, targetId: number) {
    if (!selectedSetlist || !draggedId || draggedId === targetId) return;
    const ordered = sortedSetlistSongs(selectedSetlist);
    const draggedIndex = ordered.findIndex((item) => item.id === draggedId);
    const targetIndex = ordered.findIndex((item) => item.id === targetId);
    if (draggedIndex < 0 || targetIndex < 0) return;
    const nextOrdered = [...ordered];
    const [dragged] = nextOrdered.splice(draggedIndex, 1);
    nextOrdered.splice(targetIndex, 0, dragged);
    const normalized = nextOrdered.map((item, index) => ({ ...item, position: index + 1 }));

    setMovingId(draggedId);
    setMessage("");

    if (storageMode === "local") {
      const nextSetlists = readLocalSetlists().map((setlist) =>
        setlist.id === selectedSetlist.id ? { ...setlist, setlist_songs: normalized } : setlist,
      );
      writeLocalSetlists(nextSetlists);
      setSetlists(nextSetlists);
      setMovingId(null);
      return;
    }

    const updates = await Promise.all(normalized.map((item) => supabase.from("setlist_songs").update({ position: item.position }).eq("id", item.id)));
    setMovingId(null);
    const failed = updates.find((item) => item.error);
    if (failed?.error) {
      setMessage(failed.error.message);
      return;
    }
    setSetlists((current) =>
      current.map((setlist) => (setlist.id === selectedSetlist.id ? { ...setlist, setlist_songs: normalized } : setlist)),
    );
  }

  return (
    <main className="gh-page min-h-screen overflow-hidden p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="gh-hero mb-6 p-5 sm:p-6">
          <h1 className="gh-title relative z-10 text-4xl font-black sm:text-5xl">Repertuarım</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/sarki-ara" className="inline-flex min-h-11 items-center rounded-full bg-red-600 px-5 font-bold hover:bg-red-500">
              Şarkı ara ve ekle
            </Link>
            {storageMode === "local" && <span className="inline-flex min-h-11 items-center rounded-full bg-zinc-800 px-4 text-sm font-bold text-zinc-300">Yerel cihaz modu</span>}
          </div>
        </section>

        {message && <p className="mb-4 rounded-lg bg-zinc-900 p-3 text-sm text-zinc-200">{message}</p>}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <RepertuarQuickCard title="Kendi Şarkıların" value={ownSongs.length.toString()} helper="Şarkı Yaz’dan kaydedilen bestelerin" action="Şarkı Yaz'a git" href="/sarki-yaz" accent />
          <RepertuarQuickCard title="Taslaklar" value="1" helper="Taslak cihazda otomatik saklanır" action="Taslağı aç" href="/sarki-yaz" />
          <RepertuarQuickCard title="Setlistler" value={setlists.length.toString()} helper="Konser/prova klasörlerin" action="Setlistlere bak" href="#setlistler" />
        </section>

        <section className="gh-card mb-6 rounded-3xl bg-gradient-to-br from-zinc-900/90 to-red-950/20 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Kendi Şarkıların</p>
            </div>
            <Link href="/sarki-yaz" className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 hover:bg-red-100">
              Yeni şarkı yaz
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ownSongs.map((song) => (
              <div key={song.id} className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 shadow-lg shadow-black/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-full bg-red-600/20 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-red-200">Kendi besten</span>
                    <strong className="mt-3 block line-clamp-1 text-lg text-white">{song.title}</strong>
                    <span className="mt-1 block text-sm text-zinc-400">Ton: {song.key || "-"} · BPM: {song.bpm || "-"}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/sarki/${song.id}`} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-zinc-950 hover:bg-red-100">Aç</Link>
                  <Link href={`/sarki-yaz?songId=${song.id}`} className="rounded-xl bg-zinc-800 px-3 py-2 text-xs font-black text-red-200 hover:bg-zinc-700">Düzenle</Link>
                </div>
              </div>
            ))}
            {ownSongs.length === 0 && <p className="rounded-2xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">Şarkı Yaz’dan repertuvara kaydedince burada görünecek.</p>}
          </div>
        </section>

        <section className="gh-card mb-6 grid gap-3 rounded-3xl p-4 md:grid-cols-[1fr_auto]">
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
          <section id="setlistler" className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="gh-card rounded-3xl p-4 lg:sticky lg:top-4 lg:self-start">
              <div className="flex items-center justify-between gap-3">
                <h2 className="gh-section-title text-xl font-black">Setlistler</h2>
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-bold text-zinc-400">{setlists.length}</span>
              </div>
              <div className="mt-4 space-y-2">
                {setlists.map((setlist, index) => {
                  const count = setlist.setlist_songs?.length ?? 0;
                  const lastSong = sortedSetlistSongs(setlist).at(-1)?.songs;
                  return (
                    <button
                      key={setlist.id}
                      onClick={() => setSelectedSetlistId(setlist.id)}
                      className={`w-full rounded-[1.4rem] border p-4 text-left shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:border-red-500/50 ${selectedSetlist?.id === setlist.id ? `border-red-500/50 bg-gradient-to-br ${setlistAccent(index)} to-zinc-950 ring-1 ring-red-600/40` : `border-white/10 bg-gradient-to-br ${setlistAccent(index)} to-zinc-950/80`}`}
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

            <section className="gh-card rounded-3xl p-4">
              {selectedSetlist ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="gh-section-title text-2xl font-black">{selectedSetlist.name}</h2>
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
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedSetlistSongId(item.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => { void reorderSetlistSong(draggedSetlistSongId, item.id); setDraggedSetlistSongId(null); }}
                          onDragEnd={() => setDraggedSetlistSongId(null)}
                          className={`grid cursor-grab gap-3 rounded-2xl border bg-zinc-950 p-4 transition active:cursor-grabbing md:grid-cols-[auto_1fr_auto] md:items-center ${draggedSetlistSongId === item.id ? "border-red-500 opacity-70" : "border-zinc-800 hover:border-red-500/40"}`}
                        >
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
