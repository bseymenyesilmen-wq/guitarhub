"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/lib/types";

export default function Repertuar() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [userId, setUserId] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sarkilariGetir = useCallback(async () => {
    setLoading(true);

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
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setSongs([]);
    } else {
      setSongs((data ?? []) as Song[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void sarkilariGetir();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [sarkilariGetir]);

  async function sarkiSil(id: number) {
    setMessage("");
    setDeletingId(id);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setDeletingId(null);
      router.push("/giris");
      return;
    }

    const { data, error } = await supabase
      .from("songs")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select("id");

    setDeletingId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("Şarkı silinemedi. Supabase RLS delete policy eksik olabilir.");
      return;
    }

    setSongs((current) => current.filter((song) => song.id !== id));
    setMessage("Şarkı silindi.");
  }

  async function toggleFavorite(song: Song) {
    setMessage("");

    if (!userId) {
      setMessage("Oturum bulunamadı.");
      return;
    }

    const { error } = await supabase
      .from("songs")
      .update({ favorite: !song.favorite })
      .eq("id", song.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSongs((current) =>
      current.map((item) => (item.id === song.id ? { ...item, favorite: !song.favorite } : item)),
    );
  }

  const visibleSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = songs.filter((song) => {
      const title = song.title ?? "";
      const artist = song.artist ?? "";
      const matchesQuery =
        !normalized || title.toLowerCase().includes(normalized) || artist.toLowerCase().includes(normalized);
      const matchesFilter = filter === "all" || (filter === "favorite" && song.favorite);
      return matchesQuery && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "title") return (a.title ?? "").localeCompare(b.title ?? "");
      if (sort === "artist") return (a.artist ?? "").localeCompare(b.artist ?? "");
      return Number(new Date(b.created_at ?? 0)) - Number(new Date(a.created_at ?? 0));
    });
  }, [filter, query, songs, sort]);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <h1 className="text-4xl font-black">Repertuarım</h1>
          <p className="mt-2 text-zinc-400">
            Repertuara şarkı eklemek için Şarkı Ara ekranını kullan. Burada sadece kayıtlı şarkılarını açabilir, favorileyebilir veya silebilirsin.
          </p>
          <Link href="/sarki-ara" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-red-600 px-5 font-bold hover:bg-red-500">
            Şarkı ara ve ekle
          </Link>
        </section>

        {message && <p className="mb-4 rounded-lg bg-zinc-900 p-3 text-sm text-zinc-200">{message}</p>}

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <input
            className="min-h-12 rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-red-500"
            placeholder="Şarkı veya sanatçı ara"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            className="min-h-12 rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-red-500"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">Tüm şarkılar</option>
            <option value="favorite">Favoriler</option>
          </select>

          <select
            className="min-h-12 rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-red-500"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Yeni eklenen</option>
            <option value="title">Şarkı adı</option>
            <option value="artist">Sanatçı</option>
          </select>
        </section>

        {loading ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">Repertuar yükleniyor...</div>
        ) : (
          <div className="space-y-3">
            {visibleSongs.map((song) => (
              <div key={song.id} className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <Link href={`/sarki/${song.id}`} className="min-w-0 rounded-xl p-1 hover:bg-zinc-800/60">
                  <h3 className="truncate text-lg font-bold">{song.title}</h3>
                  <p className="truncate text-sm text-zinc-400">
                    {song.artist}
                    {song.key ? ` - Ton: ${song.key}` : ""}
                    {song.capo ? ` - Capo: ${song.capo}` : ""}
                  </p>
                </Link>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggleFavorite(song)} className="min-h-11 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold hover:bg-zinc-700">
                    {song.favorite ? "Favori" : "Favorile"}
                  </button>

                  <button
                    onClick={() => sarkiSil(song.id)}
                    disabled={deletingId === song.id}
                    className="min-h-11 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === song.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              </div>
            ))}

            {visibleSongs.length === 0 && (
              <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                Eşleşen şarkı bulunamadı.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
