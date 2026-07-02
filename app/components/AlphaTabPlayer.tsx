"use client";

import { useEffect, useRef, useState } from "react";

type AlphaTabApiLike = {
  destroy?: () => void;
  playPause?: () => void;
  playbackSpeed?: number;
  playerReady?: { on: (callback: () => void) => void };
  playerStateChanged?: { on: (callback: (args: { state?: number }) => void) => void };
};

type AlphaTabModule = {
  AlphaTabApi: new (element: HTMLElement, settings: Record<string, unknown>) => AlphaTabApiLike;
};

type AlphaTabPlayerProps = {
  fileUrl: string;
  title?: string;
};

const SOUND_FONT_URL = "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.3/dist/soundfont/sonivox.sf2";

export function AlphaTabPlayer({ fileUrl, title = "Guitar Pro Player" }: AlphaTabPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const alphaTabRef = useRef<AlphaTabApiLike | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function bootAlphaTab() {
      if (!containerRef.current || !fileUrl.trim()) return;
      try {
        const AlphaTab = (await import("@coderline/alphatab")) as AlphaTabModule;
        if (cancelled || !containerRef.current) return;

        alphaTabRef.current?.destroy?.();
        containerRef.current.innerHTML = "";

        const api = new AlphaTab.AlphaTabApi(containerRef.current, {
          file: fileUrl,
          core: {
            tex: false,
          },
          display: {
            scale: 0.9,
            staveProfile: "ScoreTab",
          },
          player: {
            enablePlayer: true,
            soundFont: SOUND_FONT_URL,
            scrollElement: containerRef.current,
          },
        });

        api.playerReady?.on(() => setIsReady(true));
        api.playerStateChanged?.on((args) => setIsPlaying(args.state === 1));
        alphaTabRef.current = api;
      } catch (caughtError) {
        console.error(caughtError);
        setError("Guitar Pro dosyası yüklenemedi. URL izinli/public olmalı ve CORS engeli olmamalı.");
      }
    }

    bootAlphaTab();

    return () => {
      cancelled = true;
      alphaTabRef.current?.destroy?.();
      alphaTabRef.current = null;
    };
  }, [fileUrl]);

  function togglePlay() {
    alphaTabRef.current?.playPause?.();
    setIsPlaying((value) => !value);
  }

  function changeSpeed(nextSpeed: number) {
    setSpeed(nextSpeed);
    if (alphaTabRef.current) {
      alphaTabRef.current.playbackSpeed = nextSpeed;
    }
  }

  return (
    <section className="rounded-[2rem] border border-red-500/30 bg-zinc-950/90 p-4 shadow-2xl shadow-red-950/20 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Guitar Pro Player</p>
          <h2 className="mt-1 text-2xl font-black">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">AlphaTab ile GP/GP5/GPX dosyasını nota + tab + ses olarak oynatır.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!isReady && !fileUrl}
            className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlaying ? "Durdur ⏸" : "Oynat ▶"}
          </button>
          {[0.5, 0.75, 1, 1.25].map((speedOption) => (
            <button
              key={speedOption}
              type="button"
              onClick={() => changeSpeed(speedOption)}
              className={`rounded-xl px-3 py-2 text-sm font-black ${speed === speedOption ? "bg-white text-zinc-950" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
            >
              {speedOption}x
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-100">{error}</p>}
      {!fileUrl && <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">GP dosyası URL girince interaktif tab burada açılacak.</p>}

      <div className="max-h-[70vh] overflow-auto rounded-3xl bg-white p-3 text-black">
        <div ref={containerRef} />
      </div>
    </section>
  );
}
