"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { getTimeGreeting } from "@/lib/music-theory";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/lib/types";

function firstName(value: string) {
  return value.split("@")[0].split(" ")[0] || "Gitarist";
}

function pickContinueSong(songs: Song[]) {
  return songs.find((song) => Boolean(song.favorite)) ?? songs[0] ?? null;
}

function StatCard({ label, value, helper, actionLabel = "Aç", href, onClick }: { label: string; value: string; helper: string; actionLabel?: string; href?: string; onClick?: () => void }) {
  const content = (
    <>
      <p className="text-sm font-semibold text-zinc-400 group-hover:text-red-200">{label}</p>
      <p className="mt-3 line-clamp-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs text-zinc-500 group-hover:text-zinc-300">{helper}</p>
      <span className="mt-4 inline-flex rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-red-300 opacity-80 group-hover:bg-red-600 group-hover:text-white">
        {actionLabel}
      </span>
    </>
  );
  const cardClassName = "group block w-full rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 text-left shadow-lg shadow-black/10 transition active:scale-[0.99] hover:border-red-500/60 hover:bg-zinc-900";

  if (href) {
    return <Link href={href} className={cardClassName}>{content}</Link>;
  }

  return <button type="button" onClick={onClick} className={cardClassName}>{content}</button>;
}

function SongRow({ song, actionLabel = "Aç" }: { song: Song; actionLabel?: string }) {
  return (
    <Link
      href={`/sarki/${song.id}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-red-500/60 hover:bg-zinc-900"
    >
      <span className="min-w-0">
        <strong className="line-clamp-1 text-white group-hover:text-red-100">{song.title}</strong>
        <span className="mt-1 block line-clamp-1 text-sm text-zinc-400">{song.artist || "Sanatçı belirtilmemiş"}</span>
      </span>
      <span className="shrink-0 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-red-300 group-hover:bg-red-600 group-hover:text-white">
        {song.favorite ? "Favori" : actionLabel}
      </span>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("Gitarist");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      setName(firstName(String(session.user.user_metadata?.name ?? session.user.email ?? "Gitarist")));

      const { data: songData } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setSongs((songData ?? []) as Song[]);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const favoriteSongs = songs.filter((song) => Boolean(song.favorite));
  const favoriteCount = favoriteSongs.length;
  const continueSong = pickContinueSong(songs);
  const greeting = useMemo(() => getTimeGreeting(), []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_35%),#09090b] p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Kişisel gitar merkezi</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                {greeting}, {name}. Bugün ne çalıyoruz?
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                Repertuarına devam et, yeni şarkı ara, bilmediğin akoru aç veya gamlara göz at. Takılırsan sağ alttaki Yoda’ya sor.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/sarki-ara" className="rounded-2xl bg-red-600 px-6 py-4 text-center font-black text-white shadow-lg shadow-red-950/30 hover:bg-red-500">
                  Şarkı Ara
                </Link>
                <Link href="/repertuar" className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-center font-black text-zinc-100 hover:border-red-500 hover:bg-zinc-800">
                  Repertuarı Aç
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/40 to-zinc-900 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">Devam Et</p>
              {continueSong ? (
                <div className="mt-4">
                  <h2 className="line-clamp-2 text-3xl font-black text-white">{continueSong.title}</h2>
                  <p className="mt-2 text-zinc-300">{continueSong.artist || "Sanatçı belirtilmemiş"}</p>
                  <p className="mt-3 text-sm text-zinc-400">
                    {continueSong.favorite ? "Favorilerinden bir şarkı seçtim." : "Son eklediğin şarkıdan devam edebilirsin."}
                  </p>
                  <Link href={`/sarki/${continueSong.id}`} className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 font-black text-zinc-950 hover:bg-red-100">
                    Şarkıyı Aç
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <h2 className="text-3xl font-black text-white">İlk şarkını ekleyelim</h2>
                  <p className="mt-3 text-zinc-300">Şarkı Ara’dan bir parça bulup repertuarına ekleyebilirsin.</p>
                  <Link href="/sarki-ara" className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 font-black text-zinc-950 hover:bg-red-100">
                    Şarkı Bul
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">Panel yükleniyor...</div>
        ) : (
          <>
            <section className="hidden gap-4 lg:grid lg:grid-cols-3">
              <StatCard label="Repertuar" value={songs.length.toString()} helper="Kaydettiğin toplam şarkı" actionLabel="Repertuvara git" href="/repertuar" />
              <StatCard label="Favoriler" value={favoriteCount.toString()} helper="Sık döndüğün parçalar" actionLabel="Favorileri göster" href="#favoriler" />
              <StatCard label="Son Eklenen" value={songs[0]?.title ?? "Henüz yok"} helper="En yeni repertuar kaydı" actionLabel={songs[0] ? "Şarkıyı aç" : "Şarkı ara"} href={songs[0] ? `/sarki/${songs[0].id}` : "/sarki-ara"} />
            </section>

            <section className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Repertuar akışı</p>
                    <h2 className="mt-1 text-2xl font-black">Son Eklenen Şarkılar</h2>
                  </div>
                  <Link href="/repertuar" className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-600 hover:text-white">
                    Tümünü gör
                  </Link>
                </div>

                <div className="space-y-3">
                  {songs.slice(0, 5).map((song) => (
                    <SongRow key={song.id} song={song} />
                  ))}

                  {songs.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-zinc-700 p-5 text-zinc-400">
                      Repertuarında henüz şarkı yok. İlk parçanı bulmak için Şarkı Ara’ya git.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6">
                <div id="favoriler" className="scroll-mt-24 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Favoriler</p>
                      <h2 className="mt-1 text-2xl font-black">Hızlı Aç</h2>
                    </div>
                    <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-zinc-400">{favoriteCount} favori</span>
                  </div>

                  <div className="space-y-3">
                    {favoriteSongs.slice(0, 3).map((song) => (
                      <SongRow key={song.id} song={song} actionLabel="Aç" />
                    ))}

                    {favoriteSongs.length === 0 && <p className="rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-400">Favori şarkı işaretlediğinde burada hızlıca açabileceksin.</p>}
                  </div>
                </div>

              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
