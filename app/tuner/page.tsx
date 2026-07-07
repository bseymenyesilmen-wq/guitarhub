"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const A4 = 440;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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
];

function noteFromFrequency(frequency: number) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / A4));
  const targetFrequency = A4 * 2 ** ((midi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));
  return {
    note: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    cents,
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
    for (let i = 0; i < sliced.length - lag; i += 1) {
      correlations[lag] += sliced[i] * sliced[i + lag];
    }
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

function directionTone(cents: number) {
  const abs = Math.abs(cents);
  if (abs <= 5) return "from-emerald-500 to-green-700 text-white";
  if (abs <= 18) return "from-amber-400 to-orange-600 text-zinc-950";
  return "from-red-500 to-red-800 text-white";
}

export default function TunerPage() {
  const [presetId, setPresetId] = useState(TUNINGS[0].id);
  const [selectedString, setSelectedString] = useState(0);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Mikrofonu başlat, teli tek tek çal.");
  const [detection, setDetection] = useState<Detection | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  const preset = useMemo(() => TUNINGS.find((item) => item.id === presetId) ?? TUNINGS[0], [presetId]);
  const targetString = preset.strings[selectedString] ?? preset.strings[0];
  const cents = detection?.cents ?? 0;
  const needle = Math.max(-45, Math.min(45, cents));
  const tuned = detection ? Math.abs(detection.cents) <= 5 : false;

  function stopTuner() {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setRunning(false);
    setInputLevel(0);
    setMessage("Tuner durdu.");
  }

  async function startTuner() {
    try {
      setMessage("Mikrofon dinleniyor...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) throw new Error("Bu tarayıcı Web Audio desteklemiyor.");
      const audioContext = new AudioCtor();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setRunning(true);
      setMessage("Teli çal, ibreyi ortaya getir.");
    } catch {
      setMessage("Mikrofon izni verilmedi veya tarayıcı desteklemiyor.");
      setRunning(false);
    }
  }

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
      setInputLevel(Math.min(1, Math.sqrt(level / buffer.length) * 8));

      const frequency = autoCorrelate(buffer, audioContext.sampleRate);
      if (frequency && frequency >= 60 && frequency <= 420) {
        const closest = closestString(frequency, preset);
        const centsToString = Math.round(1200 * Math.log2(frequency / closest.frequency));
        const note = noteFromFrequency(frequency);
        const nextDetection = {
          frequency,
          note: note.note,
          octave: note.octave,
          cents: centsToString,
          targetLabel: closest.label,
          targetFrequency: closest.frequency,
        };
        setDetection(nextDetection);
        const exactIndex = preset.strings.findIndex((string) => string.label === closest.label);
        if (exactIndex >= 0) setSelectedString(exactIndex);
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [preset, running]);

  useEffect(() => () => stopTuner(), []);

  return (
    <main className="gh-page min-h-screen overflow-hidden p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="gh-hero mb-6 p-5 sm:p-8">
          <p className="gh-kicker relative z-10 text-xs sm:text-sm">Mikrofonlu gitar akordu</p>
          <h1 className="gh-title relative z-10 mt-3 text-4xl font-black sm:text-6xl">Tuner</h1>
          <p className="gh-muted relative z-10 mt-4 max-w-2xl text-sm sm:text-base">
            Teli çal, notayı seç, ibreyi ortaya getir. Ses cihazından çıkmaz; analiz tarayıcıda yapılır.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="gh-card rounded-[1.75rem] p-4 sm:p-5">
            <h2 className="gh-section-title text-xl font-black">Akort seç</h2>
            <div className="mt-4 grid gap-2">
              {TUNINGS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPresetId(item.id);
                    setSelectedString(0);
                  }}
                  className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${presetId === item.id ? "border-red-500 bg-red-600 text-white" : "border-white/10 bg-zinc-950/70 text-zinc-300 hover:border-red-500/50"}`}
                >
                  <span className="block font-black">{item.name}</span>
                  <span className="mt-1 block text-sm opacity-80">{item.helper}</span>
                </button>
              ))}
            </div>

            <h2 className="gh-section-title mt-6 text-xl font-black">Tel seç</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {preset.strings.map((string, index) => (
                <button
                  key={`${preset.id}-${string.label}`}
                  type="button"
                  onClick={() => setSelectedString(index)}
                  className={`min-h-16 rounded-2xl text-lg font-black transition ${selectedString === index ? "bg-white text-zinc-950" : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"}`}
                >
                  {string.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="gh-card relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
            <div className="pointer-events-none absolute inset-x-10 top-10 h-44 rounded-full bg-red-600/10 blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-red-300">Hedef tel</p>
                <h2 className="gh-section-title mt-1 text-3xl font-black">{targetString.label}</h2>
              </div>
              <button
                type="button"
                onClick={running ? stopTuner : startTuner}
                className={`min-h-12 rounded-2xl px-5 font-black shadow-lg ${running ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-red-600 text-white shadow-red-950/40 hover:bg-red-500"}`}
              >
                {running ? "Durdur" : "Mikrofonu Başlat"}
              </button>
            </div>

            <div className="relative z-10 mt-8 rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 text-center shadow-2xl shadow-black/25">
              <div className={`mx-auto inline-flex rounded-full bg-gradient-to-br px-5 py-2 text-sm font-black ${detection ? directionTone(cents) : "from-zinc-800 to-zinc-900 text-zinc-300"}`}>
                {detection ? directionLabel(cents) : message}
              </div>

              <div className="mt-6 text-[5rem] font-black leading-none tracking-tighter sm:text-[7rem]">
                {detection ? `${detection.note}${detection.octave}` : targetString.label}
              </div>
              <p className="mt-2 text-sm font-bold text-zinc-400">
                {detection ? `${detection.frequency.toFixed(1)} Hz · hedef ${detection.targetLabel} ${detection.targetFrequency.toFixed(1)} Hz` : `${targetString.frequency.toFixed(1)} Hz hedef`}
              </p>

              <div className="mx-auto mt-8 max-w-xl">
                <div className="relative h-24 rounded-t-full border-x border-t border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950">
                  <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-emerald-400/80" />
                  <div className="absolute left-[18%] top-6 text-xs font-black text-red-300">Kalın</div>
                  <div className="absolute right-[18%] top-6 text-xs font-black text-red-300">İnce</div>
                  <div
                    className="absolute bottom-0 left-1/2 h-20 w-1 origin-bottom rounded-full bg-white shadow-lg shadow-red-500/40 transition-transform"
                    style={{ transform: `translateX(-50%) rotate(${needle}deg)` }}
                  />
                </div>
                <div className="grid grid-cols-3 overflow-hidden rounded-b-2xl border border-white/10 text-sm font-black">
                  <div className="bg-red-950/50 p-3 text-red-100">Gevşet</div>
                  <div className={`${tuned ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-300"} p-3`}>Tamam</div>
                  <div className="bg-red-950/50 p-3 text-red-100">Sık</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-zinc-900 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  <span>Giriş seviyesi</span>
                  <span>{Math.round(inputLevel * 100)}%</span>
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
