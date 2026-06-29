"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { buildSongPayload } from "@/lib/music";
import { supabase } from "@/lib/supabase";
import type { Song, SongForm } from "@/lib/types";

const EMPTY_FORM: SongForm = {
  title: "",
  artist: "",
  key: "",
  bpm: "",
  lyrics: "",
  chords: "",
  difficulty: "",
  capo: "",
  notes: "",
  favorite: false,
};

export default function Repertuar() {
  const router = useRouter();

  const [form, setForm] = useState<SongForm>(EMPTY_FORM);
  const [songs, setSongs] = useState<Song[]>([]);
  const [userId, setUserId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  async function saveSong() {
    setMessage("");

    if (!form.title.trim() || !form.artist.trim()) {
      setMessage("Sarki adi ve sanatci bos birakilamaz.");
      return;
    }

    if (!userId) {
      setMessage("Oturum bulunamadi.");
      return;
    }

    setSaving(true);

    const payload = buildSongPayload(form, userId);

    const request = editingId
      ? supabase.from("songs").update(payload).eq("id", editingId).eq("user_id", userId)
      : supabase.from("songs").insert(payload);

    const { error } = await request;

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage(editingId ? "Sarki guncellendi." : "Sarki repertuara eklendi.");
    await sarkilariGetir();
  }

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
      setMessage("Sarki silinemedi. Supabase RLS delete policy eksik olabilir.");
      return;
    }

    setSongs((current) => current.filter((song) => song.id !== id));
    setMessage("Sarki silindi.");

    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }

  async function toggleFavorite(song: Song) {
    setMessage("");

    if (!userId) {
      setMessage("Oturum bulunamadi.");
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
      current.map((item) =>
        item.id === song.id ? { ...item, favorite: !song.favorite } : item,
      ),
    );
  }

  function startEdit(song: Song) {
    setEditingId(song.id);
    setForm({
      title: song.title ?? "",
      artist: song.artist ?? "",
      key: song.key ?? "",
      bpm: song.bpm ? String(song.bpm) : "",
      lyrics: song.lyrics ?? "",
      chords: song.chords ?? "",
      difficulty: song.difficulty ?? "",
      capo: song.capo ?? "",
      notes: song.notes ?? "",
      favorite: Boolean(song.favorite),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
  }

  const visibleSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = songs.filter((song) => {
      const title = song.title ?? "";
      const artist = song.artist ?? "";

      const matchesQuery =
        !normalized ||
        title.toLowerCase().includes(normalized) ||
        artist.toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "all" ||
        (filter === "favorite" && song.favorite) ||
        (filter === "easy" && song.difficulty === "Kolay") ||
        (filter === "medium" && song.difficulty === "Orta") ||
        (filter === "hard" && song.difficulty === "Zor");

      return matchesQuery && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "title") {
        return (a.title ?? "").localeCompare(b.title ?? "");
      }

      if (sort === "artist") {
        return (a.artist ?? "").localeCompare(b.artist ?? "");
      }

      if (sort === "bpm") {
        return Number(a.bpm ?? 0) - Number(b.bpm ?? 0);
      }

      return Number(new Date(b.created_at ?? 0)) - Number(new Date(a.created_at ?? 0));
    });
  }, [filter, query, songs, sort]);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <div className="mb-6">
          <h1 className="text-4xl font-black">Repertuarim</h1>
          <p className="mt-2 text-zinc-400">
            Sarkilarini ekle, duzenle, favorilere al ve detaylarini takip et.
          </p>
        </div>

        <section className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
              placeholder="Sarki adi *"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />

            <input
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
              placeholder="Sanatci *"
              value={form.artist}
              onChange={(event) => setForm({ ...form, artist: event.target.value })}
            />

            <input
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
              placeholder="Ton"
              value={form.key}
              onChange={(event) => setForm({ ...form, key: event.target.value })}
            />

            <input
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
              placeholder="BPM"
              value={form.bpm}
              onChange={(event) =>
                setForm({ ...form, bpm: event.target.value.replace(/\D/g, "") })
              }
            />

            <input
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
              placeholder="Capo"
              value={form.capo}
              onChange={(event) => setForm({ ...form, capo: event.target.value })}
            />

            <select
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
            >
              <option value="">Zorluk sec</option>
              <option>Kolay</option>
              <option>Orta</option>
              <option>Zor</option>
            </select>

            <textarea
              className="min-h-28 rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500 md:col-span-2"
              placeholder="Akorlar"
              value={form.chords}
              onChange={(event) => setForm({ ...form, chords: event.target.value })}
            />

            <textarea
              className="min-h-28 rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500 md:col-span-2"
              placeholder="Sozler"
              value={form.lyrics}
              onChange={(event) => setForm({ ...form, lyrics: event.target.value })}
            />

            <textarea
              className="min-h-24 rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500 md:col-span-2"
              placeholder="Notlar"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(event) => setForm({ ...form, favorite: event.target.checked })}
            />
            Favorilere ekle
          </label>

          {message && (
            <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">
              {message}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={saveSong}
              disabled={saving}
              className="rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Kaydediliyor..."
                : editingId
                  ? "Sarkiyi Guncelle"
                  : "Sarki Ekle"}
            </button>

            {editingId && (
              <button
                onClick={cancelEdit}
                className="rounded-lg bg-zinc-800 px-5 py-3 font-bold hover:bg-zinc-700"
              >
                Vazgec
              </button>
            )}
          </div>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-red-500"
            placeholder="Sarki veya sanatci ara"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-red-500"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">Tum sarkilar</option>
            <option value="favorite">Favoriler</option>
            <option value="easy">Kolay</option>
            <option value="medium">Orta</option>
            <option value="hard">Zor</option>
          </select>

          <select
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-red-500"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Yeni eklenen</option>
            <option value="title">Sarki adi</option>
            <option value="artist">Sanatci</option>
            <option value="bpm">BPM</option>
          </select>
        </section>

        {loading ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            Repertuar yukleniyor...
          </div>
        ) : (
          <div className="space-y-3">
            {visibleSongs.map((song) => (
              <div
                key={song.id}
                className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_auto] md:items-center"
              >
                <Link href={`/sarki/${song.id}`} className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{song.title}</h3>
                  <p className="text-sm text-zinc-400">
                    {song.artist}
                    {song.key ? ` - Ton: ${song.key}` : ""}
                    {song.bpm ? ` - ${song.bpm} BPM` : ""}
                  </p>
                </Link>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleFavorite(song)}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold hover:bg-zinc-700"
                  >
                    {song.favorite ? "Favori" : "Favorile"}
                  </button>

                  <button
                    onClick={() => startEdit(song)}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold hover:bg-zinc-700"
                  >
                    Duzenle
                  </button>

                  <button
                    onClick={() => sarkiSil(song.id)}
                    disabled={deletingId === song.id}
                    className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === song.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              </div>
            ))}

            {visibleSongs.length === 0 && (
              <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                Eslesen sarki bulunamadi.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}