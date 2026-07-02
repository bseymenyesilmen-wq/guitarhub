"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { supabase } from "@/lib/supabase";
import type { LearningTab } from "@/lib/types";

const INSTRUMENTS = ["Tümü", "Gitar", "Bas", "Davul", "Vokal", "Klavye"];

type SortMode = "recent" | "az";

type ArtistTab = Pick<LearningTab, "id" | "title" | "artist" | "artist_slug" | "instruments" | "tuning" | "bpm" | "revision_number" | "source_type" | "created_at">;

const DEMO_TABS: ArtistTab[] = [
  {
    id: 0,
    title: "GuitarHub Demo Riff",
    artist: "GuitarHub Studio",
    artist_slug: "guitarhub-studio",
    instruments: ["Gitar", "Bas", "Davul"],
    tuning: "E A D G B E",
    bpm: 90,
    revision_number: 1,
    source_type: "demo",
    created_at: null,
  },
  {
    id: 1,
    title: "Akustik Arpej Çalışması",
    artist: "GuitarHub Studio",
    artist_slug: "guitarhub-studio",
    instruments: ["Gitar", "Vokal"],
    tuning: "E A D G B E",
    bpm: 76,
    revision_number: 2,
    source_type: "demo",
    created_at: null,
  },
];

export default function ArtistPage() {
  const params = useParams<{ artistSlug: string }>();
  const artistSlug = params.artistSlug;
  const [tabs, setTabs] = useState<ArtistTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [instrumentFilter, setInstrumentFilter] = useState("Tümü");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadArtistTabs() {
      setLoading(true);
      setMessage("");
      const { data, error } = await supabase.from("learning_tabs")
        .select("id,title,artist,artist_slug,instruments,tuning,bpm,revision_number,source_type,created_at")
        .eq("artist_slug", artistSlug)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error || !data?.length) {
        setTabs(artistSlug === "guitarhub-studio" ? DEMO_TABS : []);
        setMessage(error ? "Supabase sanatçı verisi alınamadı; demo/fallback liste gösteriliyor." : "Bu sanatçı için henüz tab yok.");
      } else {
        setTabs(data as ArtistTab[]);
      }
      setLoading(false);
    }

    loadArtistTabs();
  }, [artistSlug]);

  const artistName = tabs[0]?.artist ?? artistSlug.split("-").map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1)).join(" ");
  const filteredTabs = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    const matched = tabs.filter((tab) => {
      const matchesQuery = !normalized || tab.title.toLocaleLowerCase("tr-TR").includes(normalized);
      const matchesInstrument = instrumentFilter === "Tümü" || tab.instruments.includes(instrumentFilter);
      return matchesQuery && matchesInstrument;
    });

    return [...matched].sort((a, b) => {
      if (sortMode === "az") return a.title.localeCompare(b.title, "tr");
      return String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
    });
  }, [instrumentFilter, query, sortMode, tabs]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.16),transparent_34%),#09090b] p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-7xl">
        <AppNav />

        <Link href="/sarki-ogren" className="mb-4 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-800">
          ← Şarkı Öğren
        </Link>

        <header className="mb-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Sanatçı sayfası</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">{artistName}</h1>
          <p className="mt-3 text-zinc-300">Sanatçı Tabları · {tabs.length} kayıt · Enstrüman filtresi ve hızlı arama</p>
          {message && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-100">{message}</p>}
        </header>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tab veya şarkı ara..."
              className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-red-500"
            />
            <select
              value={instrumentFilter}
              onChange={(event) => setInstrumentFilter(event.target.value)}
              className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-red-500"
            >
              {INSTRUMENTS.map((instrument) => <option key={instrument}>{instrument}</option>)}
            </select>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-red-500"
            >
              <option value="recent">Son eklenen</option>
              <option value="az">A-Z</option>
            </select>
          </div>

          {loading ? (
            <p className="mt-6 rounded-2xl bg-zinc-950 p-5 text-zinc-400">Sanatçı tabları yükleniyor...</p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredTabs.map((tab) => (
                <article key={tab.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                  <h2 className="line-clamp-2 text-xl font-black">{tab.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-zinc-300">
                    {tab.instruments.map((instrument) => <span key={instrument} className="rounded-full bg-zinc-900 px-3 py-1">{instrument}</span>)}
                  </div>
                  <div className="mt-4 grid gap-1 text-xs text-zinc-500">
                    <span>Akort: {tab.tuning || "-"}</span>
                    <span>BPM: {tab.bpm || "-"}</span>
                    <span>Revizyon: v{tab.revision_number || 1}</span>
                    <span>Kaynak: {tab.source_type}</span>
                  </div>
                  <Link href={`/sarki-ogren/${tab.id}`} className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-black hover:bg-red-500">
                    Tabı Aç
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
