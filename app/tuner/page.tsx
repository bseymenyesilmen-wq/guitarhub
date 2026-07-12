"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/app/components/AppNav";

type TuningPreset = {
  id: string;
  name: string;
  helper: string;
  strings: Array<{ label: string; frequency: number }>;
};

type Detection = {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  targetLabel: string;
  targetFrequency: number;
};

type MicStatus = "opening" | "ready" | "suspended" | "blocked";

const A4 = 440;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const GUITAR_SAMPLE_ROOT = "/audio/guitar";
const GUITAR_SAMPLE_NOTES: Record<string, string> = {
  "F#3": "Gb3",
};

function sampleFileName(label: string) {
  const note = GUITAR_SAMPLE_NOTES[label] ?? label;
  return `${GUITAR_SAMPLE_ROOT}/${note.replace("#", "s")}.mp3`;
}

const TUNINGS: TuningPreset[] = [
  {
    id: "standard",
    name: "Standart",
    helper: "E A D G B E",
    strings: [
      { label: "E2", frequency: 82.41 },
      { label: "A2", frequency: 110.0 },
      { label: "D3", frequency: 146.83 },
      { label: "G3", frequency: 196.0 },
      { label: "B3", frequency: 246.94 },
      { label: "E4", frequency: 329.63 },
    ],
  },
  {
    id: "half-step-down",
    name: "Yarım ses düşük",
    helper: "Eb Ab Db Gb Bb Eb",
    strings: [
      { label: "Eb2", frequency: 77.78 },
      { label: "Ab2", frequency: 103.83 },
      { label: "Db3", frequency: 138.59 },
      { label: "Gb3", frequency: 185.0 },
      { label: "Bb3", frequency: 233.08 },
      { label: "Eb4", frequency: 311.13 },
    ],
  },
  {
    id: "drop-d",
    name: "Drop D",
    helper: "D A D G B E",
    strings: [
      { label: "D2", frequency: 73.42 },
      { label: "A2", frequency: 110.0 },
      { label: "D3", frequency: 146.83 },
      { label: "G3", frequency: 196.0 },
      { label: "B3", frequency: 246.94 },
      { label: "E4", frequency: 329.63 },
    ],
  },
  {
    id: "d-standard",
    name: "D Standard",
    helper: "D G C F A D",
    strings: [
      { label: "D2", frequency: 73.42 },
      { label: "G2", frequency: 98.0 },
      { label: "C3", frequency: 130.81 },
      { label: "F3", frequency: 174.61 },
      { label: "A3", frequency: 220.0 },
      { label: "D4", frequency: 293.66 },
    ],
  },
  {
    id: "drop-c",
    name: "Drop C",
    helper: "C G C F A D",
    strings: [
      { label: "C2", frequency: 65.41 },
      { label: "G2", frequency: 98.0 },
      { label: "C3", frequency: 130.81 },
      { label: "F3", frequency: 174.61 },
      { label: "A3", frequency: 220.0 },
      { label: "D4", frequency: 293.66 },
    ],
  },
  {
    id: "dadgad",
    name: "DADGAD",
    helper: "D A D G A D",
    strings: [
      { label: "D2", frequency: 73.42 },
      { label: "A2", frequency: 110.0 },
      { label: "D3", frequency: 146.83 },
      { label: "G3", frequency: 196.0 },
      { label: "A3", frequency: 220.0 },
      { label: "D4", frequency: 293.66 },
    ],
  },
  {
    id: "open-g",
    name: "Open G",
    helper: "D G D G B D",
    strings: [
      { label: "D2", frequency: 73.42 },
      { label: "G2", frequency: 98.0 },
      { label: "D3", frequency: 146.83 },
      { label: "G3", frequency: 196.0 },
      { label: "B3", frequency: 246.94 },
      { label: "D4", frequency: 293.66 },
    ],
  },
  {
    id: "open-d",
    name: "Open D",
    helper: "D A D F# A D",
    strings: [
      { label: "D2", frequency: 73.42 },
      { label: "A2", frequency: 110.0 },
      { label: "D3", frequency: 146.83 },
      { label: "F#3", frequency: 185.0 },
      { label: "A3", frequency: 220.0 },
      { label: "D4", frequency: 293.66 },
    ],
  },
];

function noteFromFrequency(frequency: number) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / A4));
  const targetFrequency = A4 * 2 ** ((midi - 69) / 12);
  return {
    note: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    targetFrequency,
  };
}

function closestString(frequency: number, preset: TuningPreset) {
  return preset.strings.reduce((best, string) => {
    const bestDistance = Math.abs(1200 * Math.log2(frequency / best.frequency));
    const nextDistance = Math.abs(1200 * Math.log2(frequency / string.frequency));
    return nextDistance < bestDistance ? string : best;
  }, preset.strings[0]);
}

function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.012) return null;

  let start = 0;
  let end = buffer.length - 1;
  const threshold = 0.2;
  for (let i = 0; i < buffer.length / 2; i += 1) {
    if (Math.abs(buffer[i]) < threshold) {
      start = i;
      break;
    }
  }
  for (let i = 1; i < buffer.length / 2; i += 1) {
    if (Math.abs(buffer[buffer.length - i]) < threshold) {
      end = buffer.length - i;
      break;
    }
  }

  const sliced = buffer.slice(start, end);
  const correlations = new Array<number>(sliced.length).fill(0);
  for (let lag = 0; lag < sliced.length; lag += 1) {
    for (let i = 0; i < sliced.length - lag; i += 1) correlations[lag] += sliced[i] * sliced[i + lag];
  }

  let offset = 1;
  while (offset < correlations.length - 1 && correlations[offset] > correlations[offset + 1]) offset += 1;

  let bestOffset = -1;
  let bestCorrelation = -Infinity;
  for (let i = offset; i < correlations.length; i += 1) {
    if (correlations[i] > bestCorrelation) {
      bestCorrelation = correlations[i];
      bestOffset = i;
    }
  }

  if (bestOffset <= 0 || bestCorrelation < 0.01) return null;
  return sampleRate / bestOffset;
}

function directionLabel(cents: number) {
  if (Math.abs(cents) <= 5) return "Tamam";
  return cents < 0 ? "Sık · incelt" : "Gevşet · kalınlaştır";
}

function ringTone(cents: number, running: boolean) {
  if (!running) return "border-zinc-700 shadow-zinc-950/80";
  const abs = Math.abs(cents);
  if (abs <= 5) return "border-emerald-400 shadow-emerald-500/40";
  if (abs <= 18) return "border-amber-300 shadow-amber-500/35";
  return "border-red-500 shadow-red-500/35";
}

export default function TunerPage() {
  const [presetId, setPresetId] = useState(TUNINGS[0].id);
  const [selectedString, setSelectedString] = useState(0);
  const [autoDetect, setAutoDetect] = useState(true);
  const [tuningPickerOpen, setTuningPickerOpen] = useState(false);
  const [completedStrings, setCompletedStrings] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Mikrofon otomatik açılıyor...");
  const [micStatus, setMicStatus] = useState<MicStatus>("opening");
  const [detection, setDetection] = useState<Detection | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const toneContextRef = useRef<AudioContext | null>(null);
  const sampleCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  const preset = useMemo(() => TUNINGS.find((item) => item.id === presetId) ?? TUNINGS[0], [presetId]);
  const targetString = preset.strings[selectedString] ?? preset.strings[0];
  const cents = detection?.cents ?? 0;
  const needle = Math.max(-47, Math.min(47, cents));
  const tuned = detection ? Math.abs(detection.cents) <= 5 : false;
  const allStringsReady = preset.strings.every((string) => completedStrings.includes(`${preset.id}:${string.label}`));

  const stopTuner = useCallback(() => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setRunning(false);
    setMicStatus("opening");
    setInputLevel(0);
  }, []);

  const startTuner = useCallback(async () => {
    if (streamRef.current || audioContextRef.current) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("media-devices-missing");
      setMicStatus("opening");
      setMessage("Mikrofon dinleniyor...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) throw new Error("web-audio-missing");
      const audioContext = new AudioCtor({ latencyHint: "interactive" });
      if (audioContext.state === "suspended") {
        await audioContext.resume().catch(() => undefined);
      }
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setRunning(true);
      if (audioContext.state === "suspended") {
        setMicStatus("suspended");
        setMessage("Mikrofon izni var · sesi başlatmak için ekrana bir kez dokun");
      } else {
        setMicStatus("ready");
        setMessage("Dinleniyor · teli çal");
      }
    } catch {
      setMicStatus("blocked");
      setMessage("Mikrofon açılamadı. Tarayıcı izinlerinden GuitarHub mikrofonunu aç veya HTTPS üzerinden dene.");
      setRunning(false);
    }
  }, []);

  const playReferenceTone = useCallback(async (frequency: number, label: string) => {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const context = toneContextRef.current ?? new AudioCtor({ latencyHint: "interactive" });
    toneContextRef.current = context;
    if (context.state === "suspended") await context.resume();

    const now = context.currentTime;
    const master = context.createGain();
    const body = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    body.type = "lowpass";
    body.frequency.value = 7600;
    body.Q.value = 0.85;
    compressor.threshold.value = -9;
    compressor.knee.value = 20;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(2.6, now + 0.018);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 5.4);
    master.connect(body).connect(compressor).connect(context.destination);

    try {
      const sampleUrl = sampleFileName(label);
      let buffer = sampleCacheRef.current.get(sampleUrl);
      if (!buffer) {
        const response = await fetch(sampleUrl);
        if (!response.ok) throw new Error("sample-missing");
        const arrayBuffer = await response.arrayBuffer();
        buffer = await context.decodeAudioData(arrayBuffer.slice(0));
        sampleCacheRef.current.set(sampleUrl, buffer);
      }
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 1;
      source.connect(master);
      source.start(now);
      source.stop(now + Math.min(5.6, buffer.duration));
      return;
    } catch {
      // If a sample fails to load, keep a physical-model fallback instead of going silent.
    }

    const sustainSeconds = 5.0;
    const sampleRate = context.sampleRate;
    const sampleCount = Math.floor(sampleRate * sustainSeconds);
    const delaySamples = Math.max(2, Math.round(sampleRate / frequency));
    const stringBuffer = context.createBuffer(1, sampleCount, sampleRate);
    const stringData = stringBuffer.getChannelData(0);
    for (let i = 0; i < delaySamples && i < sampleCount; i += 1) {
      const pickShape = Math.sin((Math.PI * i) / delaySamples);
      stringData[i] = (Math.random() * 2 - 1) * pickShape;
    }
    for (let i = delaySamples; i < sampleCount; i += 1) {
      const lowpassAverage = 0.5 * (stringData[i - delaySamples] + stringData[Math.max(0, i - delaySamples - 1)]);
      const damping = 0.99935 - Math.min(0.011, frequency / 42000);
      stringData[i] = lowpassAverage * damping;
    }
    const stringSource = context.createBufferSource();
    stringSource.buffer = stringBuffer;
    stringSource.connect(master);
    stringSource.start(now);
    stringSource.stop(now + sustainSeconds);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void startTuner();
    }, 0);
    const resumeOnGesture = () => {
      const context = audioContextRef.current;
      if (context?.state === "suspended") {
        void context.resume().then(() => {
          setMicStatus("ready");
          setMessage("Dinleniyor · teli çal");
        }).catch(() => undefined);
      }
    };
    window.addEventListener("pointerdown", resumeOnGesture, { passive: true });
    window.addEventListener("touchstart", resumeOnGesture, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("touchstart", resumeOnGesture);
      stopTuner();
      void toneContextRef.current?.close();
      toneContextRef.current = null;
    };
  }, [startTuner, stopTuner]);

  useEffect(() => {
    if (!running) return;
    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;
    if (!analyser || !audioContext) return;

    const buffer = new Float32Array(analyser.fftSize);
    const tick = () => {
      analyser.getFloatTimeDomainData(buffer);
      let level = 0;
      for (const sample of buffer) level += sample * sample;
      const normalizedLevel = Math.min(1, Math.sqrt(level / buffer.length) * 28);
      setInputLevel(normalizedLevel);
      if (audioContext.state === "running" && micStatus === "suspended") {
        setMicStatus("ready");
        setMessage("Dinleniyor · teli çal");
      }

      const frequency = autoCorrelate(buffer, audioContext.sampleRate);
      if (frequency && frequency >= 60 && frequency <= 420) {
        const target = autoDetect ? closestString(frequency, preset) : targetString;
        const centsToString = Math.round(1200 * Math.log2(frequency / target.frequency));
        const note = noteFromFrequency(frequency);
        setDetection({
          frequency,
          note: note.note,
          octave: note.octave,
          cents: centsToString,
          targetLabel: target.label,
          targetFrequency: target.frequency,
        });
        const exactIndex = preset.strings.findIndex((string) => string.label === target.label);
        if (autoDetect && exactIndex >= 0) setSelectedString(exactIndex);
        if (Math.abs(centsToString) <= 5) {
          setCompletedStrings((current) => (current.includes(`${preset.id}:${target.label}`) ? current : [...current, `${preset.id}:${target.label}`]));
          if ("vibrate" in navigator) navigator.vibrate?.(18);
        }
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [autoDetect, micStatus, preset, running, targetString]);

  return (
    <main className="gh-page min-h-screen overflow-hidden p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="gh-hero mb-6 p-5 sm:p-8">
          <p className="gh-kicker relative z-10 text-xs sm:text-sm">Neon pedal tuner</p>
          <h1 className="gh-title relative z-10 mt-3 text-4xl font-black sm:text-6xl">Tuner</h1>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="gh-card relative z-20 rounded-[1.75rem] p-4 sm:p-5">
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-950/70 p-2">
              <button
                type="button"
                onClick={() => setAutoDetect(true)}
                className={`rounded-xl px-3 py-2 text-sm font-black ${autoDetect ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:bg-zinc-900"}`}
              >
                Otomatik
              </button>
              <button
                type="button"
                onClick={() => setAutoDetect(false)}
                className={`rounded-xl px-3 py-2 text-sm font-black ${!autoDetect ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-zinc-900"}`}
              >
                Manuel
              </button>
            </div>
            <h2 className="gh-section-title text-xl font-black">Akort modu</h2>
            <div className="relative mt-4">
              <button
                type="button"
                onClick={() => setTuningPickerOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-zinc-950/80 p-4 text-left shadow-lg shadow-black/20 transition hover:border-red-400"
              >
                <span>
                  <span className="block font-black text-white">{preset.name}</span>
                  <span className="mt-1 block text-sm text-zinc-400">{preset.helper}</span>
                </span>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-lg font-black text-white transition ${tuningPickerOpen ? "rotate-180" : ""}`}>⌄</span>
              </button>

              <div className={`absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 origin-top overflow-hidden rounded-[1.35rem] border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-200 ${tuningPickerOpen ? "max-h-80 translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-2 opacity-0"}`}>
                <div className="max-h-80 overflow-y-auto p-2 [scrollbar-width:thin]">
                  {TUNINGS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPresetId(item.id);
                        setSelectedString(0);
                        setDetection(null);
                        setCompletedStrings([]);
                        setTuningPickerOpen(false);
                      }}
                      className={`mb-1 w-full rounded-2xl border p-3 text-left transition last:mb-0 ${presetId === item.id ? "border-red-400 bg-red-600 text-white" : "border-white/5 bg-white/[0.03] text-zinc-300 hover:border-red-500/50 hover:bg-white/10"}`}
                    >
                      <span className="block font-black">{item.name}</span>
                      <span className="mt-1 block text-sm opacity-80">{item.helper}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <h2 className="gh-section-title mt-6 text-xl font-black">Tel sesi</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {preset.strings.map((string, index) => {
                const active = selectedString === index;
                const completed = completedStrings.includes(`${preset.id}:${string.label}`);
                return (
                  <button
                    key={`${preset.id}-${string.label}`}
                    type="button"
                    onClick={() => {
                      setSelectedString(index);
                      void playReferenceTone(string.frequency, string.label);
                    }}
                    className={`group relative min-h-16 overflow-hidden rounded-2xl border text-lg font-black transition hover:-translate-y-0.5 ${completed ? "border-emerald-300 bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25" : active ? "border-amber-300 bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20" : "border-white/10 bg-zinc-950 text-zinc-300 hover:border-red-500/50 hover:bg-zinc-900"}`}
                  >
                    <span className="relative z-10 block">{completed ? "✓ " : ""}{string.label}</span>
                    <span className="relative z-10 text-[10px] opacity-70">çal</span>
                    <span className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-white/20 group-active:bg-white" />
                  </button>
                );
              })}
            </div>

          </aside>

          <section className="gh-card gh-pedal relative overflow-hidden rounded-[2.2rem] p-5 sm:p-8">
            <div className="gh-led-sweep pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">GuitarHub Tune</p>
                <h2 className="gh-section-title mt-1 text-3xl font-black">{targetString.label}</h2>
              </div>
              <div className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${micStatus === "ready" ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30" : micStatus === "suspended" ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30" : "bg-red-950/70 text-red-100 ring-1 ring-red-500/30"}`}>
                {micStatus === "ready" ? "Mic hazır" : micStatus === "suspended" ? "Dokun · sesi aç" : micStatus === "blocked" ? "Mic engelli" : "Mic açılıyor"}
              </div>
            </div>

            <div className="relative z-10 mx-auto mt-8 max-w-2xl rounded-[2rem] border border-white/10 bg-black/50 p-5 text-center shadow-2xl shadow-black/40">
              <div className={`gh-neon-ring gh-tuner-pulse mx-auto flex h-64 w-64 items-center justify-center rounded-full border-4 shadow-2xl transition sm:h-80 sm:w-80 ${ringTone(cents, running)}`}>
                <div className="rounded-full border border-white/10 bg-zinc-950/90 px-8 py-7 shadow-inner shadow-black">
                  <div className="text-[4.8rem] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.25)] sm:text-[6.6rem]">
                    {detection ? `${detection.note}${detection.octave}` : targetString.label}
                  </div>
                  <div className={`mt-2 rounded-full px-3 py-1 text-sm font-black ${tuned ? "bg-emerald-500 text-zinc-950" : "bg-zinc-900 text-zinc-300"}`}>
                    {detection ? `${cents > 0 ? "+" : ""}${cents} cent` : message}
                  </div>
                </div>
              </div>

              <div className={`mx-auto mt-5 inline-flex rounded-full bg-gradient-to-br px-5 py-2 text-sm font-black ${tuned ? "from-emerald-400 to-green-700 text-white" : Math.abs(cents) <= 18 ? "from-amber-400 to-orange-600 text-zinc-950" : "from-red-500 to-red-800 text-white"}`}>
                {detection ? directionLabel(cents) : message}
              </div>

              <p className="mt-3 text-sm font-bold text-zinc-400">
                {detection ? `${detection.frequency.toFixed(1)} Hz · hedef ${detection.targetLabel} ${detection.targetFrequency.toFixed(1)} Hz` : `${targetString.frequency.toFixed(1)} Hz hedef`}
              </p>
              {allStringsReady && <p className="mx-auto mt-4 max-w-xs rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-500/30">✓ Gitar hazır!</p>}

              <div className="mx-auto mt-7 max-w-xl">
                <div className="relative h-28 rounded-t-full border-x border-t border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950">
                  <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-emerald-400/90 shadow-lg shadow-emerald-400/40" />
                  <div className="absolute left-[13%] top-8 text-xs font-black uppercase tracking-[0.18em] text-red-300">Gevşet</div>
                  <div className="absolute right-[15%] top-8 text-xs font-black uppercase tracking-[0.18em] text-red-300">Sık</div>
                  <div
                    className="absolute bottom-0 left-1/2 h-24 w-1 origin-bottom rounded-full bg-white shadow-lg shadow-red-500/50 transition-transform duration-200"
                    style={{ transform: `translateX(-50%) rotate(${needle}deg)` }}
                  />
                </div>
                <div className="grid grid-cols-3 overflow-hidden rounded-b-2xl border border-white/10 text-sm font-black">
                  <div className="bg-red-950/50 p-3 text-red-100">Kalınlaştır</div>
                  <div className={`${tuned ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-300"} p-3`}>Tamam</div>
                  <div className="bg-red-950/50 p-3 text-red-100">İncelt</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-zinc-900 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  <span>Giriş seviyesi</span>
                  <span>{micStatus === "ready" && inputLevel < 0.02 ? "Sinyal yok" : `${Math.round(inputLevel * 100)}%`}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-950">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500 transition-all" style={{ width: `${Math.round(inputLevel * 100)}%` }} />
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
