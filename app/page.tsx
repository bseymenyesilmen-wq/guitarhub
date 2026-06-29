"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { getTimeGreeting } from "@/lib/music-theory";
import { supabase } from "@/lib/supabase";
import type { PracticeLog, Song } from "@/lib/types";

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours} sa ${rest} dk` : `${rest} dk`;
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("Gitarist");
  const [songs, setSongs] = useState<Song[]>([]);
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
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

      setName(String(session.user.user_metadata?.name ?? session.user.email ?? "Gitarist"));

      const { data: songData } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const { data: practiceData } = await supabase
        .from("practice_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("practiced_at", { ascending: false });

      setSongs((songData ?? []) as Song[]);
      setPracticeLogs((practiceData ?? []) as PracticeLog[]);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const totalMinutes = useMemo(
    () => practiceLogs.reduce((total, log) => total + Number(log.minutes || 0), 0),
    [practiceLogs],
  );

  const favoriteCount = songs.filter((song) => Boolean(song.favorite)).length;
  const greeting = useMemo(() => getTimeGreeting(), []);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            Kisisel gitar merkezi
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            {greeting}, {name}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Repertuarini, favorilerini, pratik surelerini ve muzik teorisi notlarini tek panelden takip et.
          </p>
        </section>

        {loading ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            Panel yukleniyor...
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Toplam Sarki", songs.length.toString()],
                ["Favoriler", favoriteCount.toString()],
                ["Calisma Suresi", formatMinutes(totalMinutes)],
                ["Son Eklenen", songs[0]?.title ?? "Henuz yok"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                  <p className="text-sm text-zinc-400">{label}</p>
                  <p className="mt-3 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">Son Eklenen Sarkilar</h2>
                  <Link href="/repertuar" className="text-sm font-semibold text-red-400 hover:text-red-300">
                    Repertuara git
                  </Link>
                </div>

                <div className="space-y-3">
                  {songs.slice(0, 5).map((song) => (
                    <Link
                      key={song.id}
                      href={`/sarki/${song.id}`}
                      className="flex items-center justify-between rounded-lg bg-zinc-950 p-4 hover:bg-zinc-800"
                    >
                      <span>
                        <strong>{song.title}</strong>
                        <span className="block text-sm text-zinc-400">{song.artist}</span>
                      </span>
                      <span className="text-sm text-red-400">{song.favorite ? "Favori" : "Detay"}</span>
                    </Link>
                  ))}

                  {songs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-zinc-700 p-5 text-zinc-400">
                      Repertuarinda henuz sarki yok.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <h2 className="text-xl font-bold">Hizli Baslangic</h2>
                <div className="mt-4 grid gap-3">
                  <Link href="/sarki-ara" className="rounded-lg bg-red-600 px-4 py-3 text-center font-bold hover:bg-red-500">
                    Sarki ara
                  </Link>
                  <Link href="/akor-kutuphanesi" className="rounded-lg bg-zinc-800 px-4 py-3 text-center font-bold hover:bg-zinc-700">
                    Akor kutuphanesi
                  </Link>
                  <Link href="/pratik" className="rounded-lg bg-zinc-800 px-4 py-3 text-center font-bold hover:bg-zinc-700">
                    Pratik takibi
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
