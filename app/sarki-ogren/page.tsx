"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";

const INSTRUMENTS = ["Tümü", "Gitar", "Bas", "Davul", "Vokal", "Klavye"];
const TRACKS = ["Lead Guitar", "Rhythm Guitar", "Bass", "Drums", "Vocal", "Keys"];

const SAMPLE_TAB = [
  "e|----------------|----------------|",
  "B|-----0-----1----|-----3-----1----|",
  "G|---0-----0------|---0-----0------|",
  "D|----------------|----------------|",
  "A|-3-----3--------|-2-----2--------|",
  "E|----------------|----------------|",
];

const TAB_LIBRARY = [
  {
    id: "gh-demo-1",
    title: "GuitarHub Demo Riff",
    artist: "GuitarHub Studio",
    instruments: ["Gitar", "Bas", "Davul"],
    tuning: "E A D G B E",
    revision: "v1",
    contributor: "GuitarHub",
    source: "GuitarHub kaynaklı demo tab",
    tab: SAMPLE_TAB.join("\n"),
  },
  {
    id: "gh-demo-2",
    title: "Akustik Arpej Çalışması",
    artist: "GuitarHub Studio",
    instruments: ["Gitar", "Vokal"],
    tuning: "E A D G B E",
    revision: "v2",
    contributor: "Yoda",
    source: "GuitarHub kaynaklı demo tab",
    tab: [
      "e|-----0-------0--|-----0-------0--|",
      "B|---1---1---1----|---3---3---3----|",
      "G|-0-------0------|-0-------0------|",
      "D|----------------|----------------|",
      "A|3---------------|2---------------|",
      "E|----------------|----------------|",
    ].join("\n"),
  },
  {
    id: "gh-demo-3",
    title: "Bas Groove 90 BPM",
    artist: "GuitarHub Studio",
    instruments: ["Bas", "Davul", "Klavye"],
    tuning: "E A D G",
    revision: "v1",
    contributor: "Community",
    source: "GuitarHub kaynaklı demo tab",
    tab: [
      "G|----------------|----------------|",
      "D|-----2-----2----|-----4-----2----|",
      "A|---2-----2------|---2-----2------|",
      "E|-0-----0--------|-3-----3--------|",
    ].join("\n"),
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function SarkiOgren() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [transpose, setTranspose] = useState(0);
  const [loop, setLoop] = useState(true);
  const [solo, setSolo] = useState("Lead Guitar");
  const [muted, setMuted] = useState<string[]>(["Drums"]);
  const [metronome, setMetronome] = useState(false);
  const [countIn, setCountIn] = useState(true);
  const [query, setQuery] = useState("");
  const [instrumentFilter, setInstrumentFilter] = useState("Tümü");
  const [activeTabId, setActiveTabId] = useState(TAB_LIBRARY[0].id);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);

  const activeTab = TAB_LIBRARY.find((tab) => tab.id === activeTabId) ?? TAB_LIBRARY[0];
  const [tabText, setTabText] = useState(activeTab.tab);

  const filteredTabs = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return TAB_LIBRARY.filter((tab) => {
      const matchesQuery = !normalized || `${tab.title} ${tab.artist}`.toLocaleLowerCase("tr-TR").includes(normalized);
      const matchesInstrument = instrumentFilter === "Tümü" || tab.instruments.includes(instrumentFilter);
      return matchesQuery && matchesInstrument;
    });
  }, [instrumentFilter, query]);

  const visibleLines = useMemo(() => tabText.split(/\r?\n/).filter(Boolean), [tabText]);
  const favoriteTabs = TAB_LIBRARY.filter((tab) => favorites.includes(tab.id));
  const historyTabs = history.map((id) => TAB_LIBRARY.find((tab) => tab.id === id)).filter(Boolean);
  const playlistTabs = playlist.map((id) => TAB_LIBRARY.find((tab) => tab.id === id)).filter(Boolean);

  function addToHistory(tabId: string) {
    setHistory((current) => [tabId, ...current.filter((id) => id !== tabId)].slice(0, 8));
  }

  function openTab(tabId: string) {
    const tab = TAB_LIBRARY.find((item) => item.id === tabId);
    if (!tab) return;
    setActiveTabId(tab.id);
    setTabText(tab.tab);
    addToHistory(tab.id);
  }

  function toggleFavorite(tabId: string) {
    setFavorites((current) => (current.includes(tabId) ? current.filter((id) => id !== tabId) : [...current, tabId]));
  }

  function addToPlaylist(tabId: string) {
    setPlaylist((current) => (current.includes(tabId) ? current : [...current, tabId]));
  }

  function toggleMute(track: string) {
    setMuted((current) => (current.includes(track) ? current.filter((item) => item !== track) : [...current, track]));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.16),transparent_34%),#09090b] p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-7xl">
        <AppNav />

        <section className="mb-6 overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">Reklamsız pratik modu</p>
          <div className="mt-3 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Şarkı Öğren</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
                GuitarHub’ın kendi tab öğrenme alanı: arama, sanatçı sayfası, şarkı sayfası, revizyon geçmişi, Kullanıcı katkıları,
                favoriler, geçmiş, playlist, enstrüman filtresi ve player araçları. Telifli/paralı servisleri kopyalamadan; Songsterr verisi çekilmez; izinli kaynaklar,
                kullanıcı katkıları, import ve AI transkripsiyon ile kendi arşivimizi büyütürüz.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-2">
              {["Arama", "Enstrüman filtresi", "Playlist", "Offline hazırlık"].map((item) => (
                <div key={item} className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4 font-bold text-red-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tab veya sanatçı ara..."
                className="min-h-12 flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-red-500"
              />
              <select
                value={instrumentFilter}
                onChange={(event) => setInstrumentFilter(event.target.value)}
                className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-red-500"
              >
                {INSTRUMENTS.map((instrument) => (
                  <option key={instrument}>{instrument}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {filteredTabs.map((tab) => (
                <article key={tab.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => openTab(tab.id)} className="min-w-0 text-left">
                      <h2 className="line-clamp-1 text-xl font-black hover:text-red-300">{tab.title}</h2>
                      <p className="mt-1 text-sm text-zinc-400">{tab.artist}</p>
                    </button>
                    <button onClick={() => toggleFavorite(tab.id)} className="rounded-full bg-zinc-900 px-3 py-2 text-sm font-black text-red-300">
                      {favorites.includes(tab.id) ? "★" : "☆"}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-zinc-300">
                    {tab.instruments.map((instrument) => (
                      <span key={instrument} className="rounded-full bg-zinc-900 px-3 py-1">{instrument}</span>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                    <span>Akort: {tab.tuning}</span>
                    <span>Revizyon geçmişi: {tab.revision}</span>
                    <span>Katkı: {tab.contributor}</span>
                    <span>{tab.source}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openTab(tab.id)} className="rounded-full bg-red-600 px-4 py-2 text-sm font-black hover:bg-red-500">Şarkı sayfası</button>
                    <button onClick={() => addToPlaylist(tab.id)} className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-black hover:bg-zinc-700">Playlist</button>
                    <button className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-black text-zinc-300">Sanatçı sayfası</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Panel title="Favoriler" items={favoriteTabs.map((tab) => `${tab.artist} - ${tab.title}`)} empty="Henüz favori yok." />
            <Panel title="Geçmiş" items={historyTabs.map((tab) => `${tab?.artist} - ${tab?.title}`)} empty="Açtığın tablar burada." />
            <Panel title="Playlist" items={playlistTabs.map((tab) => `${tab?.artist} - ${tab?.title}`)} empty="Masaüstü playlist mantığının temeli." />
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Practice Player</p>
                <h2 className="mt-1 text-2xl font-black">{activeTab.artist} - {activeTab.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">Akort bilgisini gösterme: {activeTab.tuning}</p>
              </div>
              <button
                onClick={() => setPlaying((value) => !value)}
                className={`min-h-12 rounded-2xl px-6 font-black ${playing ? "bg-white text-zinc-950" : "bg-red-600 text-white hover:bg-red-500"}`}
              >
                {playing ? "Duraklat" : "Oynat"}
              </button>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-black p-4 font-mono text-sm leading-8 text-zinc-100 sm:text-base">
              <div className="mb-3 flex min-w-[680px] items-center gap-2 border-b border-zinc-800 pb-3 text-xs text-zinc-500">
                {Array.from({ length: 8 }, (_, index) => (
                  <span key={index} className="inline-flex w-20 justify-center rounded-full bg-zinc-900 py-1 font-bold">
                    Ölçü {index + 1}
                  </span>
                ))}
              </div>
              <pre className="min-w-[680px] whitespace-pre">{visibleLines.join("\n")}</pre>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Hız</span>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => setSpeed((value) => clamp(value - 5, 25, 150))} className="rounded-lg bg-zinc-800 px-3 py-2 font-bold">-</button>
                  <strong className="min-w-16 text-center">{speed}%</strong>
                  <button onClick={() => setSpeed((value) => clamp(value + 5, 25, 150))} className="rounded-lg bg-zinc-800 px-3 py-2 font-bold">+</button>
                </div>
              </label>

              <label className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Transpose</span>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => setTranspose((value) => clamp(value - 1, -12, 12))} className="rounded-lg bg-zinc-800 px-3 py-2 font-bold">-1</button>
                  <strong className="min-w-14 text-center">{transpose > 0 ? `+${transpose}` : transpose}</strong>
                  <button onClick={() => setTranspose((value) => clamp(value + 1, -12, 12))} className="rounded-lg bg-zinc-800 px-3 py-2 font-bold">+1</button>
                </div>
              </label>

              <button onClick={() => setLoop((value) => !value)} className={`rounded-2xl border p-4 text-left font-black ${loop ? "border-red-500 bg-red-600" : "border-zinc-800 bg-zinc-950"}`}>
                Loop
                <span className="mt-1 block text-sm font-semibold opacity-80">Riff / solo / zor pasaj çalışma</span>
              </button>

              <button onClick={() => setMetronome((value) => !value)} className={`rounded-2xl border p-4 text-left font-black ${metronome ? "border-red-500 bg-red-600" : "border-zinc-800 bg-zinc-950"}`}>
                Metronom
                <span className="mt-1 block text-sm font-semibold opacity-80">Count-in: {countIn ? "Açık" : "Kapalı"}</span>
              </button>
            </div>
          </div>

          <aside className="grid gap-6">
            <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
              <h2 className="text-2xl font-black">Mixer</h2>
              <p className="mt-2 text-sm text-zinc-400">Solo ve Mute davranışının ilk temelini kurduk.</p>
              <div className="mt-4 space-y-3">
                {TRACKS.map((track) => (
                  <div key={track} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <strong>{track}</strong>
                      <span className="text-xs text-zinc-500">Vol 80%</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setSolo(track)} className={`rounded-full px-3 py-2 text-xs font-black ${solo === track ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300"}`}>
                        Solo
                      </button>
                      <button onClick={() => toggleMute(track)} className={`rounded-full px-3 py-2 text-xs font-black ${muted.includes(track) ? "bg-white text-zinc-950" : "bg-zinc-800 text-zinc-300"}`}>
                        Mute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
              <h2 className="text-2xl font-black">Kendi tabın</h2>
              <p className="mt-2 text-sm text-zinc-400">Tab düzenleme, nota silme/ekleme ve Guitar Pro import bir sonraki adım.</p>
              <textarea
                value={tabText}
                onChange={(event) => setTabText(event.target.value)}
                className="mt-4 min-h-40 w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 outline-none focus:border-red-500"
              />
            </section>

            <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
              <h2 className="text-2xl font-black">Tuner</h2>
              <p className="mt-2 text-sm text-zinc-400">Mikrofonlu chromatic tuner burada açılacak. Kısayol desteği: N metronom, C count-in.</p>
              <button onClick={() => setCountIn((value) => !value)} className="mt-4 w-full rounded-2xl bg-zinc-950 px-4 py-3 font-black text-red-300 hover:bg-zinc-800">
                Count-in {countIn ? "Kapat" : "Aç"}
              </button>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item} className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200">
              {item}
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">{empty}</p>
        )}
      </div>
    </section>
  );
}
