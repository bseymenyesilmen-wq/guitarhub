"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "guitarhub-songwriter-draft";
const OWN_SONG_MARKER = "GUITARHUB_OWN_SONG";
const DEFAULT_NOTEBOOK = `Am        F
Buraya ilk söz satırını yaz

C         G
Akorları sözlerin üstüne denk getir`;
const SECTION_IDEAS = ["Verse", "Pre-chorus", "Nakarat", "Bridge", "Solo", "Outro"];
const SECTION_BLOCKS = ["[Verse]", "[Nakarat]", "[Bridge]", "[Solo]", "[Outro]"];
const SUGGESTION_TYPES = [
  { value: "continue", label: "Devamını yaz", hint: "Aynı havada 1-2 satır devam önerir." },
  { value: "chorus", label: "Nakarat üret", hint: "Daha akılda kalan, yükselen bölüm önerir." },
  { value: "bridge", label: "Bridge öner", hint: "Nakarata geçiş için farklı renk verir." },
  { value: "sadder", label: "Daha hüzünlü yap", hint: "Söz ve akoru daha duygusal tarafa çeker." },
] as const;

type Draft = {
  title: string;
  keyName: string;
  tempo: string;
  sectionName: string;
  suggestionType: string;
  notebook: string;
};

type SystemSuggestion = {
  mood: string;
  idea: string;
  suggestedChords: string;
  suggestedLyrics: string;
};

function makeDraft(): Draft {
  return {
    title: "Yeni Şarkı",
    keyName: "Am",
    tempo: "90",
    sectionName: "Verse",
    suggestionType: "continue",
    notebook: DEFAULT_NOTEBOOK,
  };
}

function loadDraft() {
  if (typeof window === "undefined") return makeDraft();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return makeDraft();
    return { ...makeDraft(), ...(JSON.parse(saved) as Partial<Draft>) };
  } catch {
    return makeDraft();
  }
}

export default function SarkiYaz() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => loadDraft());
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [autoSaveMessage, setAutoSaveMessage] = useState("");
  const [autoSaveReady, setAutoSaveReady] = useState(false);
  const [suggestion, setSuggestion] = useState<SystemSuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [savingToRepertuar, setSavingToRepertuar] = useState(false);

  useEffect(() => {
    async function loadExistingSongDraft() {
      const songId = new URLSearchParams(window.location.search).get("songId");
      if (!songId) {
        setAutoSaveReady(true);
        return;
      }
      const parsedSongId = Number(songId);
      if (!Number.isFinite(parsedSongId)) {
        setAutoSaveReady(true);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", parsedSongId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        setSavedMessage(error?.message ?? "Şarkı bulunamadı.");
        setAutoSaveReady(true);
        return;
      }

      setEditingSongId(parsedSongId);
      setDraft({
        ...makeDraft(),
        title: String(data.title ?? "Yeni Şarkı"),
        keyName: String(data.key ?? ""),
        tempo: data.bpm ? String(data.bpm) : "",
        sectionName: String(data.notes ?? "").match(/Bölüm:\s*([^\n]+)/)?.[1] ?? "Verse",
        notebook: String(data.chords ?? data.lyrics ?? ""),
      });
      setAutoSaveReady(true);
    }

    const timer = window.setTimeout(() => {
      void loadExistingSongDraft();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!autoSaveReady) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setAutoSaveMessage("Otomatik kaydedildi");
    }, 500);
    return () => window.clearTimeout(timer);
  }, [autoSaveReady, draft]);

  function saveDraft() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedMessage("Taslak bu cihazda kaydedildi kanka.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  async function getSystemSuggestion() {
    setSuggestionLoading(true);
    setSavedMessage("");
    try {
      const response = await fetch("/api/songwriter/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as SystemSuggestion;
      setSuggestion(data);
    } catch {
      setSavedMessage("Sistem önerisi alınamadı. Birazdan tekrar dene.");
    } finally {
      setSuggestionLoading(false);
    }
  }

  function applySuggestion() {
    if (!suggestion) return;
    const block = `${suggestion.suggestedChords}\n${suggestion.suggestedLyrics}`;
    setDraft((current) => ({
      ...current,
      notebook: `${current.notebook.trim()}\n\n${block}`.trim(),
    }));
  }

  function insertSectionBlock(sectionBlock: string) {
    const block = `${sectionBlock}\n\n`;
    setDraft((current) => ({
      ...current,
      notebook: `${current.notebook.trim()}\n\n${block}`.trim(),
      sectionName: sectionBlock.replace(/[\[\]]/g, ""),
    }));
  }

  async function saveToRepertuar() {
    setSavingToRepertuar(true);
    setSavedMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/giris");
      return;
    }

    const payload = {
      title: draft.title.trim() || "Yeni Şarkı",
      artist: "Kendi Şarkım",
      key: draft.keyName.trim() || null,
      bpm: Number(draft.tempo) || null,
      chords: draft.notebook,
      lyrics: draft.notebook,
      notes: `${OWN_SONG_MARKER}\nBölüm: ${draft.sectionName}`,
      difficulty: "Kendi Şarkıların",
      user_id: session.user.id,
    };

    const { data: created, error } = editingSongId
      ? await supabase
        .from("songs")
        .update({
          title: payload.title,
          artist: payload.artist,
          key: payload.key,
          bpm: payload.bpm,
          chords: payload.chords,
          lyrics: payload.lyrics,
          notes: payload.notes,
          difficulty: payload.difficulty,
        })
        .eq("id", editingSongId)
        .eq("user_id", session.user.id)
        .select("id")
        .single()
      : await supabase
        .from("songs")
        .insert(payload)
        .select("id")
        .single();

    setSavingToRepertuar(false);

    if (error || !created) {
      setSavedMessage(error?.message ?? "Repertuvara kaydedilemedi.");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    router.push(`/sarki/${created.id}`);
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
              <label className="block sm:col-span-3 lg:col-span-1">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Öneri tipi</span>
                <select value={draft.suggestionType} onChange={(event) => setDraft({ ...draft, suggestionType: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 font-bold text-white outline-none focus:border-red-500">
                  {SUGGESTION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{SUGGESTION_TYPES.find((type) => type.value === draft.suggestionType)?.hint}</p>
              </label>
            </div>
          </aside>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Şarkı defteri</h2>
                <p className="mt-1 text-sm text-zinc-400">Akor ve sözleri tek alana yaz. Örnek: akor satırı, altına söz satırı.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={getSystemSuggestion} disabled={suggestionLoading} className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-500 disabled:opacity-60">
                  {suggestionLoading ? "Sistem düşünüyor..." : "Sistemden öneri al"}
                </button>
                <button onClick={saveDraft} className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-black text-red-300 hover:bg-zinc-800">
                  Taslağı kaydet
                </button>
                <button onClick={saveToRepertuar} disabled={savingToRepertuar} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 hover:bg-red-100 disabled:opacity-60">
                  {savingToRepertuar ? "Kaydediliyor..." : editingSongId ? "Repertuvarda Güncelle" : "Repertuvara Kaydet"}
                </button>
              </div>
            </div>

            {savedMessage && <p className="mt-3 rounded-2xl bg-green-950/50 p-3 text-sm font-bold text-green-200">{savedMessage}</p>}
            {autoSaveMessage && <p className="mt-3 text-xs font-bold text-zinc-500">{autoSaveMessage}</p>}

            {suggestion && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Sistem önerisi · {SUGGESTION_TYPES.find((type) => type.value === draft.suggestionType)?.label} · {suggestion.mood}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{suggestion.idea}</p>
                  </div>
                  <button onClick={applySuggestion} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-zinc-950 hover:bg-red-100">
                    Öneriyi uygula
                  </button>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 p-3 font-mono text-sm leading-7 text-zinc-100">{`${suggestion.suggestedChords}\n${suggestion.suggestedLyrics}`}</pre>
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Bölüm ekle</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SECTION_BLOCKS.map((sectionBlock) => (
                  <button key={sectionBlock} onClick={() => insertSectionBlock(sectionBlock)} className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-600 hover:text-white">
                    Bölümü deftere ekle {sectionBlock}
                  </button>
                ))}
              </div>
            </div>

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
