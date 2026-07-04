"use client";

import { useState } from "react";
import { AppNav } from "@/app/components/AppNav";

const STORAGE_KEY = "guitarhub-songwriter-draft";
const DEFAULT_NOTEBOOK = `Am        F
Buraya ilk söz satırını yaz

C         G
Akorları sözlerin üstüne denk getir`;
const SECTION_IDEAS = ["Verse", "Pre-chorus", "Nakarat", "Bridge", "Solo", "Outro"];

type Draft = {
  title: string;
  keyName: string;
  tempo: string;
  sectionName: string;
  notebook: string;
};

function makeDraft(): Draft {
  return {
    title: "Yeni Şarkı",
    keyName: "Am",
    tempo: "90",
    sectionName: "Verse",
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

  function saveDraft() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedMessage("Taslak bu cihazda kaydedildi kanka.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_34%),#09090b] p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-5xl">
        <AppNav />

        <section className="mb-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/75 p-5 shadow-2xl shadow-black/30 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-400">Şarkı Oluştur</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Şarkı Yaz</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
            Sözlerini ve akorlarını tek defter alanında yaz. Repertuvardaki gibi akor satırını sözün üstüne koy, taslağı bu cihazda sakla.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <h2 className="text-2xl font-black">Şarkı bilgisi</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <label className="block sm:col-span-3 lg:col-span-1">
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
          </aside>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Şarkı defteri</h2>
                <p className="mt-1 text-sm text-zinc-400">Akor ve sözleri tek alana yaz. Örnek: akor satırı, altına söz satırı.</p>
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
                rows={22}
                spellCheck={false}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm leading-7 text-zinc-100 outline-none focus:border-red-500"
                placeholder={DEFAULT_NOTEBOOK}
              />
            </label>
          </section>
        </section>
      </div>
    </main>
  );
}
