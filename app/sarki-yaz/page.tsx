"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";

const STORAGE_KEY = "guitarhub-songwriter-draft";

const PROGRESSIONS = [
  {
    mood: "Hüzünlü",
    vibe: "Duygusal verse / iç dökme",
    chords: "Am  F  C  G",
    hint: "Türkçe pop-rock ve akustik balad için güvenli başlangıç.",
  },
  {
    mood: "Mutlu",
    vibe: "Parlak nakarat",
    chords: "C  G  Am  F",
    hint: "Kolay söylenen, umutlu ve radyo-pop hissi verir.",
  },
  {
    mood: "Karanlık",
    vibe: "Gece / gerilim",
    chords: "Em  C  G  D",
    hint: "Daha koyu ama hâlâ akılda kalan rock/pop yürüyüşü.",
  },
  {
    mood: "Pop",
    vibe: "Modern hit yürüyüşü",
    chords: "G  D  Em  C",
    hint: "Nakarat büyütmek ve kolay eşlik için iyi çalışır.",
  },
  {
    mood: "Rock",
    vibe: "Duman/Pilli Bebek tadı",
    chords: "Em  G  D  A",
    hint: "Ritim gitarla güçlü akar; distortion veya akustik ikisine de gider.",
  },
  {
    mood: "Arabesk",
    vibe: "Dramatik çözülme",
    chords: "Dm  Bb  C  A",
    hint: "Acılı vokal, uzun cümle ve dramatik nakarat için kullan.",
  },
  {
    mood: "Umutlu",
    vibe: "Yükselen bölüm",
    chords: "D  A  Bm  G",
    hint: "Bridge’den nakarata geçerken güzel açılır.",
  },
  {
    mood: "Lo-fi",
    vibe: "Sakin ve loş",
    chords: "Am7  Dm7  G7  Cmaj7",
    hint: "Yavaş tempo, konuşur gibi vokal ve yumuşak gitar için.",
  },
];

const SECTION_IDEAS = ["Verse", "Pre-chorus", "Nakarat", "Bridge", "Solo", "Outro"];

type LyricLine = {
  id: number;
  chords: string;
  lyrics: string;
};

type Draft = {
  title: string;
  keyName: string;
  tempo: string;
  sectionName: string;
  selectedProgression: string;
  lines: LyricLine[];
};

const DEFAULT_LINES: LyricLine[] = [
  { id: 1, chords: "Am        F", lyrics: "Buraya ilk söz satırını yaz" },
  { id: 2, chords: "C         G", lyrics: "Akorları sözlerin üstüne denk getir" },
];

function makeDraft(): Draft {
  return {
    title: "Yeni Şarkı",
    keyName: "Am",
    tempo: "90",
    sectionName: "Verse",
    selectedProgression: PROGRESSIONS[0].chords,
    lines: DEFAULT_LINES,
  };
}

function buildPreview(lines: LyricLine[]) {
  return lines
    .map((line) => `${line.chords}\n${line.lyrics}`)
    .join("\n\n");
}

export default function SarkiYaz() {
  const [draft, setDraft] = useState<Draft>(() => {
    if (typeof window === "undefined") return makeDraft();
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Draft) : makeDraft();
    } catch {
      return makeDraft();
    }
  });
  const [savedMessage, setSavedMessage] = useState("");

  const preview = useMemo(() => buildPreview(draft.lines), [draft.lines]);

  function updateLine(id: number, field: keyof Pick<LyricLine, "chords" | "lyrics">, value: string) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    }));
  }

  function addLine() {
    setDraft((current) => ({
      ...current,
      lines: [...current.lines, { id: Date.now(), chords: "", lyrics: "" }],
    }));
  }

  function insertProgression() {
    setDraft((current) => {
      const nextLines = current.lines.length ? [...current.lines] : [{ id: Date.now(), chords: "", lyrics: "" }];
      const firstEmptyIndex = nextLines.findIndex((line) => !line.chords.trim());
      const targetIndex = firstEmptyIndex >= 0 ? firstEmptyIndex : 0;
      nextLines[targetIndex] = { ...nextLines[targetIndex], chords: current.selectedProgression };
      return { ...current, lines: nextLines };
    });
  }

  function saveDraft() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedMessage("Taslak bu cihazda kaydedildi kanka.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_34%),#09090b] p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/75 p-5 shadow-2xl shadow-black/30 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-400">Şarkı Oluştur</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Şarkı Yaz</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
            Sözlerini yaz, üstüne akorları yerleştir, hazır Chord Progression fikirlerinden ruh halini seç ve repertuvar gibi okunabilir önizleme al.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
              <h2 className="text-2xl font-black">Şarkı bilgisi</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="block sm:col-span-3">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Başlık</span>
                  <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 font-bold text-white outline-none focus:border-red-500" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Ton</span>
                  <input value={draft.keyName} onChange={(event) => setDraft({ ...draft, keyName: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 font-bold text-white outline-none focus:border-red-500" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">BPM</span>
                  <input value={draft.tempo} onChange={(event) => setDraft({ ...draft, tempo: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 font-bold text-white outline-none focus:border-red-500" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Bölüm</span>
                  <select value={draft.sectionName} onChange={(event) => setDraft({ ...draft, sectionName: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 font-bold text-white outline-none focus:border-red-500">
                    {SECTION_IDEAS.map((section) => <option key={section}>{section}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Chord Progression</p>
                  <h2 className="mt-1 text-2xl font-black">Ruh halini seç</h2>
                </div>
                <button onClick={insertProgression} className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-500">
                  {"Progression'u akora yaz"}
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {PROGRESSIONS.map((progression) => (
                  <button
                    key={progression.mood}
                    onClick={() => setDraft({ ...draft, selectedProgression: progression.chords })}
                    className={`rounded-2xl border p-4 text-left transition ${draft.selectedProgression === progression.chords ? "border-red-500 bg-red-950/40" : "border-zinc-800 bg-zinc-950 hover:border-red-500/50"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-white">{progression.mood}</span>
                      <span className="font-mono text-sm text-red-300">{progression.chords}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-zinc-300">{progression.vibe}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">{progression.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Söz + Akor Editörü</h2>
                  <p className="mt-1 text-sm text-zinc-400">Repertuvardaki gibi: önce akor satırı, altına söz satırı.</p>
                </div>
                <button onClick={addLine} className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-black text-red-300 hover:bg-red-600 hover:text-white">
                  Satır ekle
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {draft.lines.map((line, index) => (
                  <div key={line.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Satır {index + 1}</p>
                    <label className="block">
                      <span className="text-xs font-bold text-red-300">Akor satırı</span>
                      <input value={line.chords} onChange={(event) => updateLine(line.id, "chords", event.target.value)} placeholder="Am        F        C        G" className="mt-2 min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 font-mono text-red-200 outline-none focus:border-red-500" />
                    </label>
                    <label className="mt-3 block">
                      <span className="text-xs font-bold text-zinc-300">Söz satırı</span>
                      <textarea value={line.lyrics} onChange={(event) => updateLine(line.id, "lyrics", event.target.value)} placeholder="Sözlerini buraya yaz" rows={2} className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-white outline-none focus:border-red-500" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/25 bg-gradient-to-br from-zinc-900 to-red-950/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Repertuvar önizlemesi</p>
                  <h2 className="mt-1 text-2xl font-black">{draft.title || "Yeni Şarkı"}</h2>
                  <p className="mt-1 text-sm text-zinc-400">Ton: {draft.keyName || "-"} · BPM: {draft.tempo || "-"} · {draft.sectionName}</p>
                </div>
                <button onClick={saveDraft} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 hover:bg-red-100">
                  Taslağı kaydet
                </button>
              </div>

              {savedMessage && <p className="mt-3 rounded-2xl bg-green-950/50 p-3 text-sm font-bold text-green-200">{savedMessage}</p>}

              <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm leading-7 text-zinc-100" style={{ whiteSpace: "pre" }}>
                {preview || "Akor ve söz yazınca burada görünecek."}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
