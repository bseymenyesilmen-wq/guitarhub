"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { Fretboard } from "@/app/components/Fretboard";
import { getScalePositions, NOTE_NAMES, SCALE_FORMULAS, type ScaleViewMode } from "@/lib/music-theory";

const VIEW_MODES: Array<{ id: ScaleViewMode; label: string; description: string }> = [
  { id: "full", label: "Full", description: "0-21 gerçek gitar klavyesi" },
  { id: "vertical", label: "Vertical", description: "Seçili pozisyon kutusu" },
  { id: "diagonal", label: "Diagonal", description: "Sap boyunca çapraz hat" },
];

export default function GamKutuphanesi() {
  const [root, setRoot] = useState("C");
  const [scaleId, setScaleId] = useState("major");
  const [category, setCategory] = useState("Tümü");
  const [showIntervals, setShowIntervals] = useState(false);
  const [viewMode, setViewMode] = useState<ScaleViewMode>("vertical");
  const [positionIndex, setPositionIndex] = useState(0);

  const scale = SCALE_FORMULAS.find((item) => item.id === scaleId) ?? SCALE_FORMULAS[0];
  const filteredScales = useMemo(
    () => SCALE_FORMULAS.filter((item) => category === "Tümü" || item.category === category),
    [category],
  );
  const positions = useMemo(() => getScalePositions(root, scaleId, viewMode), [root, scaleId, viewMode]);
  const selectedPosition = positions[Math.min(positionIndex, positions.length - 1)] ?? positions[0];
  const positionStartFret = viewMode === "full" ? null : selectedPosition?.startFret ?? null;
  const displayFrets = viewMode === "full" ? 21 : viewMode === "diagonal" ? 8 : selectedPosition?.displayFrets ?? 4;
  const fretboardStartFret = viewMode === "full" ? 0 : positionStartFret ?? 0;
  const positionEndFret = positionStartFret === null ? null : Math.min(21, positionStartFret + displayFrets);

  return (
    <main className="gh-page min-h-screen overflow-x-hidden p-3 pb-32 text-white sm:p-6 md:pb-6">
      <div className="mx-auto w-full max-w-6xl">
        <AppNav />

        <section className="gh-hero mb-4 p-4 sm:mb-6 sm:p-8">
          <h1 className="gh-title relative z-10 text-3xl font-black sm:text-5xl">Gam Kütüphanesi</h1>
          <p className="gh-muted relative z-10 mt-2 max-w-2xl text-xs sm:mt-3 sm:text-base">
            Root nota, gam türü, görünüm ve pozisyon seçerek gitar klavyesinde sadece seçili gam notalarını çalış.
          </p>
        </section>

        <section className="mb-4 grid min-w-0 gap-3 lg:mb-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="gh-card min-w-0 rounded-[1.7rem] p-3 sm:rounded-3xl sm:p-4">
            <h2 className="text-base font-black sm:text-lg">1. Root nota</h2>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {NOTE_NAMES.map((note) => (
                <button
                  key={note}
                  onClick={() => {
                    setRoot(note);
                    setPositionIndex(0);
                  }}
                  className={`min-h-11 rounded-2xl text-sm font-black sm:min-h-12 ${root === note ? "bg-red-600" : "bg-zinc-950 hover:bg-zinc-800"}`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          <div className="gh-card min-w-0 rounded-[1.7rem] p-3 sm:rounded-3xl sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-black sm:text-lg">2. Gam / Mod</h2>
              <label className="flex min-h-10 items-center gap-2 rounded-full bg-zinc-950 px-3 text-xs font-bold text-zinc-300 sm:min-h-11 sm:px-4 sm:text-sm">
                <input type="checkbox" checked={showIntervals} onChange={(event) => setShowIntervals(event.target.checked)} />
                Interval göster
              </label>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["Tümü", "Common", "Rare", "Exotic"].map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold sm:min-h-11 sm:text-sm ${category === item ? "bg-red-600" : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-3 grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:max-h-[520px] sm:grid-cols-2">
              {filteredScales.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setScaleId(item.id);
                    setPositionIndex(0);
                  }}
                  className={`rounded-2xl p-3 text-left ${scaleId === item.id ? "bg-red-600" : "bg-zinc-950 hover:bg-zinc-800"}`}
                >
                  <span className="block font-black">{root} {item.name}</span>
                  <span className="mt-1 block text-xs text-zinc-300">{item.formula.join(" ")}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="gh-card mb-6 min-w-0 rounded-[1.7rem] p-3 sm:rounded-3xl sm:p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="gh-section-title text-xl font-black sm:text-2xl">{root} {scale.name}</h2>
              <p className="gh-muted mt-1 text-sm">{scale.character}</p>
            </div>
            <span className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-bold text-red-300">
              {scale.genres.join(" · ")}
            </span>
          </div>

          <div className="mb-4 grid min-w-0 gap-3 rounded-[1.4rem] border border-zinc-800 bg-zinc-950 p-3 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <h3 className="font-black">3. Görünüm</h3>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setViewMode(mode.id);
                      setPositionIndex(0);
                    }}
                    className={`min-h-14 w-32 shrink-0 rounded-2xl px-4 py-3 text-left ${viewMode === mode.id ? "bg-red-600" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                  >
                    <span className="block text-sm font-black">{mode.label}</span>
                    <span className="mt-1 hidden text-[10px] text-zinc-300 sm:block">{mode.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black">4. Pozisyon çalış</h3>
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">
                  {viewMode === "full" ? "Genel harita" : selectedPosition?.label}
                </span>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {positions.map((position) => (
                  <button
                    key={`${viewMode}-${position.index}-${position.startFret}`}
                    onClick={() => {
                      setViewMode("vertical");
                      setPositionIndex(position.index);
                    }}
                    className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-black ${positionIndex === position.index && viewMode !== "full" ? "bg-red-600" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                  >
                    {position.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Fretboard root={root} scaleId={scaleId} showIntervals={showIntervals} startFret={fretboardStartFret} displayFrets={displayFrets} viewMode={viewMode} positionStartFret={positionStartFret} positionEndFret={positionEndFret} />
        </section>
      </div>
    </main>
  );
}
