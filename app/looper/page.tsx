"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/app/components/AppNav";

type LooperStatus = "empty" | "count-in" | "recording" | "playing" | "stopped" | "overdub-armed" | "overdubbing";
type Layer = { id: string; name: string; blob: Blob; url: string; buffer?: AudioBuffer; volume: number; muted: boolean; solo: boolean; createdAt: number };
type SavedLoop = { id: string; name: string; bpm: number; duration: number; layers: number; createdAt: number };
type SpeechRecognitionEventLike = Event & { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionLike = EventTarget & { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; onresult: ((event: SpeechRecognitionEventLike) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
type MicStatus = "off" | "opening" | "ready" | "recording" | "blocked";

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

const STORAGE_KEY = "guitarhub.savedLoops";
const DB_NAME = "guitarhub-looper";
const DB_STORE = "loops";
const COUNT_IN_OPTIONS = [1, 2, 4];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00.0";
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${rest}`;
}

function openLooperDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLoopBlobs(id: string, blobs: Blob[]) {
  if (typeof indexedDB === "undefined") return;
  const db = await openLooperDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put({ id, blobs });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export default function LooperPage() {
  const [status, setStatus] = useState<LooperStatus>("empty");
  const [bpm, setBpm] = useState(90);
  const [countInBars, setCountInBars] = useState(1);
  const [metronomeOn, setMetronomeOn] = useState(true);
  const [metronomeVolume, setMetronomeVolume] = useState(0.55);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [redoStack, setRedoStack] = useState<Layer[]>([]);
  const [loopDuration, setLoopDuration] = useState(0);
  const [message, setMessage] = useState("Looper hazır. RECORD ile count-in başlat.");
  const [countLabel, setCountLabel] = useState("—");
  const [currentBeat, setCurrentBeat] = useState(1);
  const [progress, setProgress] = useState(0);
  const [savedLoops, setSavedLoops] = useState<SavedLoop[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed as SavedLoop[] : [];
    } catch {
      return [];
    }
  });
  const [loopName, setLoopName] = useState("Blues Jam 01");
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [stageMode, setStageMode] = useState(false);
  const [micStatus, setMicStatus] = useState<MicStatus>("off");
  const [inputLevel, setInputLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const inputFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartedAtRef = useRef(0);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const layerGainRefs = useRef<Map<string, GainNode>>(new Map());
  const loopStartedAtRef = useRef(0);
  const scheduledOverdubTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const metronomeTimerRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const beatMs = useMemo(() => 60000 / bpm, [bpm]);
  const statusLabel = useMemo(() => {
    const labels: Record<LooperStatus, string> = {
      empty: "Hazır",
      "count-in": "Count-In",
      recording: "KAYIT",
      playing: "Çalıyor",
      stopped: "Durdu",
      "overdub-armed": "Overdub bekliyor",
      overdubbing: "OVERDUB",
    };
    return labels[status];
  }, [status]);
  const hasSolo = layers.some((layer) => layer.solo);

  useEffect(() => {
    return () => {
      stopAllPlayback();
      stopRecording(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (inputFrameRef.current) window.cancelAnimationFrame(inputFrameRef.current);
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      if (metronomeTimerRef.current) window.clearInterval(metronomeTimerRef.current);
      if (scheduledOverdubTimerRef.current) window.clearTimeout(scheduledOverdubTimerRef.current);
      void audioContextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    layers.forEach((layer) => {
      const gain = layerGainRefs.current.get(layer.id);
      if (gain) gain.gain.value = layer.muted || (hasSolo && !layer.solo) ? 0 : layer.volume;
    });
  }, [layers, hasSolo]);

  useEffect(() => {
    if (!stageMode) {
      void wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
      return;
    }
    const navWithWake = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } };
    void navWithWake.wakeLock?.request("screen").then((lock) => {
      wakeLockRef.current = lock;
    }).catch(() => undefined);
  }, [stageMode]);

  function getAudioContext() {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ latencyHint: "interactive" });
    return audioContextRef.current;
  }

  async function ensureMic() {
    if (streamRef.current) return streamRef.current;
    try {
      setMicStatus("opening");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume().catch(() => undefined);
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      inputAnalyserRef.current = analyser;
      streamRef.current = stream;
      setMicStatus("ready");
      startInputMeter();
      return stream;
    } catch (error) {
      setMicStatus("blocked");
      setMessage("Mikrofon açılamadı. HTTPS/Netlify üzerinden aç ve mikrofon izni ver.");
      throw error;
    }
  }

  function startInputMeter() {
    if (inputFrameRef.current) window.cancelAnimationFrame(inputFrameRef.current);
    const buffer = new Float32Array(inputAnalyserRef.current?.fftSize ?? 1024);
    const tickInput = () => {
      const analyser = inputAnalyserRef.current;
      if (!analyser) return;
      analyser.getFloatTimeDomainData(buffer);
      let level = 0;
      for (const sample of buffer) level += sample * sample;
      setInputLevel(Math.min(1, Math.sqrt(level / buffer.length) * 24));
      inputFrameRef.current = window.requestAnimationFrame(tickInput);
    };
    inputFrameRef.current = window.requestAnimationFrame(tickInput);
  }

  function tick(accent = false) {
    if (!metronomeOn) return;
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = accent ? 1220 : 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, metronomeVolume), ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  function startMetronomeClock() {
    if (metronomeTimerRef.current) window.clearInterval(metronomeTimerRef.current);
    let beat = 1;
    setCurrentBeat(beat);
    metronomeTimerRef.current = window.setInterval(() => {
      tick(beat === 1);
      setCurrentBeat(beat);
      beat = beat === 4 ? 1 : beat + 1;
    }, beatMs);
  }

  function stopMetronomeClock() {
    if (metronomeTimerRef.current) window.clearInterval(metronomeTimerRef.current);
    metronomeTimerRef.current = null;
  }

  function startProgressClock(duration: number) {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = window.setInterval(() => {
      if (!loopStartedAtRef.current || !duration) return;
      const elapsed = (performance.now() - loopStartedAtRef.current) / 1000;
      setProgress((elapsed % duration) / duration);
    }, 60);
  }

  async function decodeLayer(layer: Layer) {
    if (layer.buffer) return layer.buffer;
    const ctx = getAudioContext();
    const arrayBuffer = await layer.blob.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    layer.buffer = buffer;
    return buffer;
  }

  async function playLayers(startAt = 0) {
    if (!layers.length || !loopDuration) return;
    stopAllPlayback(false);
    const ctx = getAudioContext();
    await ctx.resume();
    layerGainRefs.current.clear();
    sourcesRef.current = [];
    const soloActive = layers.some((layer) => layer.solo);
    for (const layer of layers) {
      const buffer = await decodeLayer(layer);
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.loop = true;
      source.loopEnd = loopDuration;
      gain.gain.value = layer.muted || (soloActive && !layer.solo) ? 0 : layer.volume;
      source.connect(gain).connect(ctx.destination);
      source.start(ctx.currentTime + startAt);
      sourcesRef.current.push(source);
      layerGainRefs.current.set(layer.id, gain);
    }
    loopStartedAtRef.current = performance.now() + startAt * 1000;
    startProgressClock(loopDuration);
    startMetronomeClock();
    setStatus("playing");
    setMessage("Loop dönüyor. Overdub için sıradaki tur başına kilitlenir.");
  }

  function stopAllPlayback(updateState = true) {
    sourcesRef.current.forEach((source) => {
      try { source.stop(); } catch {}
    });
    sourcesRef.current = [];
    layerGainRefs.current.clear();
    stopMetronomeClock();
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
    setProgress(0);
    if (updateState) setStatus(layers.length ? "stopped" : "empty");
  }

  async function startRecording() {
    const stream = await ensureMic();
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : undefined });
    recorderRef.current = recorder;
    setMicStatus("recording");
    recordStartedAtRef.current = performance.now();
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.start(80);
  }

  function stopRecording(createLayer = true, namePrefix = "Layer") {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return Promise.resolve<Layer | null>(null);
    return new Promise<Layer | null>((resolve) => {
      recorder.onstop = async () => {
        if (!createLayer || !chunksRef.current.length) return resolve(null);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const layer: Layer = {
          id: crypto.randomUUID(),
          name: `${namePrefix} ${layers.length + 1}`,
          blob,
          url: URL.createObjectURL(blob),
          volume: 1,
          muted: false,
          solo: false,
          createdAt: Date.now(),
        };
        await decodeLayer(layer).catch(() => undefined);
        resolve(layer);
      };
      recorder.stop();
      recorderRef.current = null;
      setMicStatus(streamRef.current ? "ready" : "off");
    });
  }

  async function countInThenRecord() {
    try {
      await getAudioContext().resume();
      await ensureMic();
      setStatus("count-in");
      setMessage(`${countInBars} ölçü count-in...`);
      const totalBeats = countInBars * 4;
      for (let beat = 1; beat <= totalBeats; beat += 1) {
        const shown = ((beat - 1) % 4) + 1;
        setCountLabel(String(shown));
        tick(shown === 1);
        await new Promise((resolve) => window.setTimeout(resolve, beatMs));
      }
      setCountLabel("KAYIT");
      setStatus("recording");
      setMessage("İlk loop kaydı başladı. Bitirmek için RECORD'a tekrar bas.");
      await startRecording();
    } catch {
      setStatus("empty");
      setMessage("Mikrofon açılamadı. HTTPS/Netlify üzerinden aç ve mikrofon izni ver.");
    }
  }

  async function handleRecord() {
    if (status === "empty" || status === "stopped") {
      await countInThenRecord();
      return;
    }
    if (status === "recording") {
      const duration = (performance.now() - recordStartedAtRef.current) / 1000;
      const layer = await stopRecording(true, "Ritim gitar");
      if (!layer) return;
      const cleanDuration = Math.max(1, duration);
      setLoopDuration(cleanDuration);
      setLayers([layer]);
      setRedoStack([]);
      setStatus("playing");
      setMessage("İlk loop kaydedildi ve otomatik dönüyor.");
      window.setTimeout(() => void playLayers(), 60);
    }
  }

  function nextLoopDelayMs() {
    if (!loopStartedAtRef.current || !loopDuration) return 0;
    const elapsedMs = performance.now() - loopStartedAtRef.current;
    const loopMs = loopDuration * 1000;
    const remainder = elapsedMs % loopMs;
    return Math.max(0, loopMs - remainder);
  }

  function armOverdub() {
    if (!layers.length || !loopDuration || status === "overdubbing") return;
    const delay = status === "playing" ? nextLoopDelayMs() : 0;
    setStatus("overdub-armed");
    setMessage("Overdub sıradaki tur başında başlayacak.");
    if (scheduledOverdubTimerRef.current) window.clearTimeout(scheduledOverdubTimerRef.current);
    scheduledOverdubTimerRef.current = window.setTimeout(async () => {
      setStatus("overdubbing");
      setMessage("Overdub kaydı başladı. Bir tur sonunda katman eklenecek.");
      await startRecording();
      window.setTimeout(async () => {
        const layer = await stopRecording(true, "Layer");
        if (layer) {
          setLayers((current) => [...current, { ...layer, name: `Layer ${current.length + 1}` }]);
          setRedoStack([]);
        }
        setStatus("playing");
        setMessage("Overdub yeni katman olarak eklendi.");
        window.setTimeout(() => void playLayers(), 80);
      }, loopDuration * 1000);
    }, delay);
  }

  async function stopOverdubNow() {
    if (status !== "overdubbing") return;
    const layer = await stopRecording(true, "Layer");
    if (layer) setLayers((current) => [...current, { ...layer, name: `Layer ${current.length + 1}` }]);
    setStatus("playing");
    setMessage("Overdub durdu ve katman eklendi.");
    window.setTimeout(() => void playLayers(), 80);
  }

  function undo() {
    setLayers((current) => {
      if (!current.length) return current;
      const removed = current[current.length - 1];
      setRedoStack((stack) => [removed, ...stack]);
      setMessage(`${removed.name} kaldırıldı.`);
      return current.slice(0, -1);
    });
    window.setTimeout(() => void playLayers(), 80);
  }

  function redo() {
    setRedoStack((stack) => {
      if (!stack.length) return stack;
      const [restored, ...rest] = stack;
      setLayers((current) => [...current, restored]);
      setMessage(`${restored.name} geri alındı.`);
      window.setTimeout(() => void playLayers(), 80);
      return rest;
    });
  }

  function clearLoop() {
    stopAllPlayback(false);
    layers.forEach((layer) => URL.revokeObjectURL(layer.url));
    setLayers([]);
    setRedoStack([]);
    setLoopDuration(0);
    setStatus("empty");
    setInputLevel(0);
    setMessage("Loop temizlendi.");
  }

  function updateLayer(id: string, patch: Partial<Layer>) {
    setLayers((current) => current.map((layer) => layer.id === id ? { ...layer, ...patch } : layer));
  }

  function deleteLayer(id: string) {
    setLayers((current) => current.filter((layer) => layer.id !== id));
    setMessage("Katman silindi.");
    window.setTimeout(() => void playLayers(), 80);
  }

  function tapTempo() {
    const now = performance.now();
    tapTimesRef.current = [...tapTimesRef.current.filter((time) => now - time < 2200), now].slice(-5);
    if (tapTimesRef.current.length >= 2) {
      const diffs = tapTimesRef.current.slice(1).map((time, index) => time - tapTimesRef.current[index]);
      const avg = diffs.reduce((sum, item) => sum + item, 0) / diffs.length;
      setBpm(clamp(Math.round(60000 / avg), 40, 240));
    }
  }

  async function saveLoop() {
    if (!layers.length) {
      setMessage("Kaydedilecek loop yok.");
      return;
    }
    const id = crypto.randomUUID();
    const item: SavedLoop = { id, name: loopName.trim() || "GuitarHub Loop", bpm, duration: loopDuration, layers: layers.length, createdAt: Date.now() };
    const next = [item, ...savedLoops].slice(0, 25);
    setSavedLoops(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    await saveLoopBlobs(id, layers.map((layer) => layer.blob)).catch(() => undefined);
    setMessage(`“${item.name}” My Loops içine kaydedildi.`);
  }

  function executeVoiceCommand(raw: string) {
    const command = raw.toLocaleLowerCase("tr-TR");
    if (command.includes("kayıt başlat")) void handleRecord();
    else if (command.includes("kayıt durdur")) void handleRecord();
    else if (command.includes("overdub başlat")) armOverdub();
    else if (command.includes("overdub durdur")) void stopOverdubNow();
    else if (command.includes("loopu başlat") || command.includes("loop başlat")) void playLayers();
    else if (command.includes("loopu durdur") || command.includes("loop durdur")) stopAllPlayback();
    else if (command.includes("son katmanı sil")) undo();
    else if (command.includes("loopu temizle") || command.includes("loop temizle")) clearLoop();
    else if (command.includes("metronomu aç")) setMetronomeOn(true);
    else if (command.includes("metronomu kapat")) setMetronomeOn(false);
  }

  function toggleVoice() {
    if (voiceOn) {
      recognitionRef.current?.stop();
      setVoiceOn(false);
      return;
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceSupported(false);
      setMessage("Bu tarayıcı Türkçe sesli komutu desteklemiyor.");
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "tr-TR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
      if (last) {
        setMessage(`Sesli komut: ${last}`);
        executeVoiceCommand(last);
      }
    };
    recognition.onend = () => {
      if (voiceOn) recognition.start();
    };
    recognition.onerror = () => setMessage("Sesli komut mikrofonu bekliyor. Gitar sesleri komut gibi algılanırsa kapatabilirsin.");
    recognitionRef.current = recognition;
    recognition.start();
    setVoiceOn(true);
  }

  return (
    <main className={`gh-page min-h-screen overflow-x-hidden p-3 pb-32 text-white sm:p-6 md:pb-8 ${stageMode ? "bg-black" : ""}`}>
      <div className="mx-auto w-full max-w-7xl">
        <AppNav />

        <section className="gh-hero mb-4 p-4 sm:mb-6 sm:p-8">
          <p className="gh-kicker relative z-10 text-xs">GuitarHub Pedalboard</p>
          <div className="relative z-10 mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="gh-title text-4xl font-black sm:text-6xl">Looper</h1>
              <p className="gh-muted mt-2 max-w-2xl text-sm sm:text-base">Count-in, metronom, senkron overdub ve katman kontrollü pratik looper.</p>
            </div>
            <button onClick={() => setStageMode((value) => !value)} className={`min-h-12 rounded-2xl px-5 text-sm font-black ${stageMode ? "bg-red-600 text-white" : "bg-white/10 text-zinc-200"}`}>
              Sahne Modu
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="gh-card gh-pedal relative overflow-hidden rounded-[2rem] p-4 sm:p-6">
            <div className="gh-led-sweep pointer-events-none absolute inset-0 opacity-80" />
            <div className="relative z-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/35 p-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Durum</p>
                <div className="mt-3 rounded-[1.5rem] border border-red-500/30 bg-black p-5 shadow-inner shadow-red-950/40">
                  <p className={`text-4xl font-black sm:text-6xl ${status === "recording" || status === "overdubbing" ? "text-red-400" : "text-white"}`}>{statusLabel}</p>
                  <p className="mt-2 text-5xl font-black text-red-500 sm:text-7xl">{status === "count-in" ? countLabel : currentBeat}</p>
                  <p className="mt-2 text-sm font-bold text-zinc-400">{formatTime(loopDuration)} · {layers.length} layer</p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-900">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-orange-400 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <p className="mt-3 min-h-10 text-sm font-bold text-zinc-300">{message}</p>
              </div>

              <div className="grid content-start gap-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <button onClick={handleRecord} className="min-h-24 rounded-[1.4rem] bg-red-600 text-xl font-black shadow-xl shadow-red-950/50 active:scale-95">● RECORD</button>
                  <button onClick={status === "overdubbing" ? stopOverdubNow : armOverdub} disabled={!layers.length} className="min-h-24 rounded-[1.4rem] bg-white/10 text-xl font-black text-white disabled:opacity-40 active:scale-95">⊕ OVERDUB</button>
                  <button onClick={() => void playLayers()} disabled={!layers.length} className="min-h-24 rounded-[1.4rem] bg-emerald-600 text-xl font-black disabled:opacity-40 active:scale-95">▶ PLAY</button>
                  <button onClick={() => stopAllPlayback()} className="min-h-20 rounded-[1.4rem] bg-zinc-900 text-lg font-black active:scale-95">■ STOP</button>
                  <button onClick={undo} disabled={!layers.length} className="min-h-20 rounded-[1.4rem] bg-zinc-900 text-lg font-black disabled:opacity-40 active:scale-95">↶ UNDO</button>
                  <button onClick={redo} disabled={!redoStack.length} className="min-h-20 rounded-[1.4rem] bg-zinc-900 text-lg font-black disabled:opacity-40 active:scale-95">↷ REDO</button>
                </div>
                <button onClick={clearLoop} className="min-h-14 rounded-[1.25rem] border border-red-500/30 bg-red-950/40 text-base font-black text-red-100">🗑 CLEAR</button>
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="gh-card rounded-[1.7rem] p-4">
              <h2 className="text-xl font-black">Metronom</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="rounded-2xl bg-black/35 p-3">
                  <span className="text-xs font-bold text-zinc-400">BPM</span>
                  <input type="number" min={40} max={240} value={bpm} onChange={(event) => setBpm(clamp(Number(event.target.value), 40, 240))} className="mt-1 w-full bg-transparent text-3xl font-black outline-none" />
                </label>
                <button onClick={tapTempo} className="rounded-2xl bg-red-600 px-4 text-xl font-black">Tap Tempo</button>
              </div>
              <input type="range" min={40} max={240} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} className="mt-4 w-full accent-red-600" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => setMetronomeOn((value) => !value)} className={`min-h-12 rounded-2xl font-black ${metronomeOn ? "bg-red-600" : "bg-zinc-900 text-zinc-300"}`}>Metronom {metronomeOn ? "Açık" : "Kapalı"}</button>
                <label className="rounded-2xl bg-zinc-950 p-3 text-xs font-bold text-zinc-400">Ses
                  <input type="range" min={0} max={1} step={0.05} value={metronomeVolume} onChange={(event) => setMetronomeVolume(Number(event.target.value))} className="mt-2 w-full accent-red-600" />
                </label>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {COUNT_IN_OPTIONS.map((bars) => <button key={bars} onClick={() => setCountInBars(bars)} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-black ${countInBars === bars ? "bg-red-600" : "bg-zinc-950 text-zinc-300"}`}>{bars} ölçü count-in</button>)}
              </div>
            </div>

            <div className="gh-card rounded-[1.7rem] p-4">
              <h2 className="text-xl font-black">Sesli Komut</h2>
              <button onClick={toggleVoice} className={`mt-3 min-h-12 w-full rounded-2xl font-black ${voiceOn ? "bg-red-600" : "bg-zinc-950 text-zinc-300"}`}>{voiceOn ? "Dinliyor" : "Türkçe komutları aç"}</button>
              {!voiceSupported && <p className="mt-2 text-sm text-red-200">Tarayıcı ses tanımayı desteklemiyor.</p>}
              <p className="mt-3 text-xs font-bold leading-6 text-zinc-400">“Kayıt başlat”, “Overdub başlat”, “Loopu durdur”, “Son katmanı sil”, “Metronomu aç”.</p>
            </div>
          </aside>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="gh-card rounded-[1.7rem] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">Katmanlar</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${micStatus === "ready" || micStatus === "recording" ? "bg-emerald-600/20 text-emerald-200" : micStatus === "opening" ? "bg-amber-600/20 text-amber-200" : micStatus === "blocked" ? "bg-red-600/20 text-red-200" : "bg-zinc-900 text-zinc-400"}`}>{micStatus === "recording" ? "Mic kayıt alıyor" : micStatus === "ready" ? "Mic hazır" : micStatus === "opening" ? "Mic hazırlanıyor" : micStatus === "blocked" ? "Mic engelli" : "Mic kapalı"}</span>
            </div>
            <div className="mt-3 rounded-2xl bg-black/30 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-zinc-500"><span>Mic giriş seviyesi</span><span>{micStatus === "off" ? "Record ile açılır" : inputLevel < 0.02 ? "Sinyal yok" : `${Math.round(inputLevel * 100)}%`}</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-950"><div className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500 transition-all" style={{ width: `${Math.round(inputLevel * 100)}%` }} /></div>
            </div>
            <div className="mt-3 grid gap-3">
              {layers.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 p-5 text-center text-sm font-bold text-zinc-500">İlk ritmi kaydedince Layer 1 burada görünecek.</div>}
              {layers.map((layer, index) => (
                <div key={layer.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black">Layer {index + 1} <span className="text-zinc-400">· {layer.name}</span></p>
                    <div className="flex gap-2">
                      <button onClick={() => updateLayer(layer.id, { muted: !layer.muted })} className={`rounded-full px-3 py-1 text-xs font-black ${layer.muted ? "bg-red-600" : "bg-zinc-900"}`}>Mute</button>
                      <button onClick={() => updateLayer(layer.id, { solo: !layer.solo })} className={`rounded-full px-3 py-1 text-xs font-black ${layer.solo ? "bg-emerald-600" : "bg-zinc-900"}`}>Solo</button>
                      <button onClick={() => deleteLayer(layer.id)} className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-black text-red-200">Delete</button>
                    </div>
                  </div>
                  <label className="mt-3 block text-xs font-bold text-zinc-400">Volume
                    <input type="range" min={0} max={1} step={0.01} value={layer.volume} onChange={(event) => updateLayer(layer.id, { volume: Number(event.target.value) })} className="mt-2 w-full accent-red-600" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="gh-card rounded-[1.7rem] p-4">
            <h2 className="text-xl font-black">My Loops</h2>
            <div className="mt-3 flex gap-2">
              <input value={loopName} onChange={(event) => setLoopName(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 font-bold outline-none focus:border-red-500" placeholder="Loop adı" />
              <button onClick={saveLoop} className="min-h-12 rounded-2xl bg-red-600 px-4 font-black">Kaydet</button>
            </div>
            <div className="mt-3 grid gap-2">
              {savedLoops.length === 0 && <p className="rounded-2xl border border-dashed border-zinc-800 p-4 text-sm font-bold text-zinc-500">Kaydedilmiş loop yok.</p>}
              {savedLoops.map((loop) => (
                <div key={loop.id} className="rounded-2xl bg-black/30 p-3">
                  <p className="font-black">{loop.name}</p>
                  <p className="mt-1 text-xs font-bold text-zinc-400">{loop.bpm} BPM · {formatTime(loop.duration)} · {loop.layers} layer</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
