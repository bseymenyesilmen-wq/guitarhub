"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/app/components/AppNav";

const STORAGE_KEY = "guitarhub-songwriter-draft";

const PROGRESSIONS = [
  { mood: "Hüzünlü", vibe: "Duygusal verse", chords: "Am  F  C  G", hint: "Akustik balad / iç dökme." },
  { mood: "Mutlu", vibe: "Parlak nakarat", chords: "C  G  Am  F", hint: "Umutlu pop hissi." },
  { mood: "Karanlık", vibe: "Gece / gerilim", chords: "Em  C  G  D", hint: "Koyu ama akılda kalır." },
  { mood: "Pop", vibe: "Modern hit", chords: "G  D  Em  C", hint: "Nakaratı büyütür." },
  { mood: "Rock", vibe: "Duman/Pilli Bebek", chords: "Em  G  D  A", hint: "Ritim gitarla güçlü akar." },
  { mood: "Arabesk", vibe: "Dramatik", chords: "Dm  Bb  C  A", hint: "Acılı vokal için." },
  { mood: "Umutlu", vibe: "Yükselen bölüm", chords: "D  A  Bm  G", hint: "Bridge/nakarat geçişi." },
  { mood: "Lo-fi", vibe: "Sakin", chords: "Am7  Dm7  G7  Cmaj7", hint: "Loş ve yumuşak." },
];

const SECTION_IDEAS = ["Verse", "Pre-chorus", "Nakarat", "Bridge", "Solo", "Outro"];

const DEFAULT_NOTEBOOK = `Am        F
Buraya ilk söz satırını yaz

C         G
Akorları sözlerin üstüne denk getir`;

type Draft = {
  title: string;
  keyName: string;
  tempo: string;
  sectionName: string;
  selectedProgression: string;
  notebook: string;
};

function makeDraft(): Draft {
  return {
    title: "Yeni Şarkı",
    keyName: "Am",
    tempo: "90",
    sectionName: "Verse",
    selectedProgression: PROGRESSIONS[0].chords,
    notebook: DEFAULT_NOTEBOOK,
  };
}

function loadDraft() {
  if (typeof window === "undefined") return makeDraft();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Draft) : makeDraft();
  } catch {
    return makeDraft();
  }
}

export default function SarkiYaz() {
  const [draft, setDraft] = useState<Draft>(() => loadDraft());
  const [savedMessage, setSavedMessage] = useState("");

  const preview = useMemo(() => draft.notebook.trim() || "Akor ve söz yazınca burada görünecek.", [draft.notebook]);

  function insertProgression() {
    setDraft((current) => {
      const block = `${current.selectedProgression}\nYeni söz satırını buraya yaz`;
      const separator = current.notebook.trim() ? "\n\n" : "";
      return { ...current, notebook: `${current.notebook}${separator}${block}` };
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
            Sözlerini ve akorlarını tek defter alanında yaz. Hazır Chord Progression seç, deftere ekle, altta repertuvar gibi oku.
          </p>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
              <h2 className="text-2xl font-black">Şarkı bilgisi</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <label className="block sm:col-span-3 xl:col-span-1">
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
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Chord Progression</p>
              <h2 className="mt-1 text-2xl font-black">Ruh halini seç</h2>
              <button onClick={insertProgression} className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-500">
                {"Progression'u deftere ekle"}
              </button>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {PROGRESSIONS.map((progression) => (
                  <button
                    key={progression.mood}
                    onClick={() => setDraft({ ...draft, selectedProgression: progression.chords })}
                    className={`rounded-2xl border p-3 text-left transition ${draft.selectedProgression === progression.chords ? "border-red-500 bg-red-950/40" : "border-zinc-800 bg-zinc-950 hover:border-red-500/50"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-white">{progression.mood}</span>
                      <span className="font-mono text-xs text-red-300">{progression.chords}</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-zinc-300">{progression.vibe}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{progression.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Şarkı defteri</h2>
                  <p className="mt-1 text-sm text-zinc-400">Akor ve sözleri tek alana yaz. Her akor satırının altına söz satırı gelecek.</p>
                </div>
                <button onClick={saveDraft} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 hover:bg-red-100">
                  Taslağı kaydet
                </button>
              </div>

              {savedMessage && <p className="mt-3 rounded-2xl bg-green-950/50 p-3 text-sm font-bold text-green-200">{savedMessage}</p>}

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Akor ve sözleri tek alana yaz</span>
                <textarea
                  value={draft.notebook}
                  onChange={(event) => setDraft({ ...draft, notebook: event.target.value })}
                  rows={16}
                  spellCheck={false}
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm leading-7 text-zinc-100 outline-none focus:border-red-500"
                  placeholder={DEFAULT_NOTEBOOK}
                />
              </label>
            </div>

            <div className="rounded-3xl border border-red-500/25 bg-gradient-to-br from-zinc-900 to-red-950/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Repertuvar önizlemesi</p>
                  <h2 className="mt-1 text-2xl font-black">{draft.title || "Yeni Şarkı"}</h2>
                  <p className="mt-1 text-sm text-zinc-400">Ton: {draft.keyName || "-"} · BPM: {draft.tempo || "-"} · {draft.sectionName}</p>
                </div>
              </div>

              <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm leading-7 text-zinc-100" style={{ whiteSpace: "pre" }}>
                {preview}
              </pre>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
