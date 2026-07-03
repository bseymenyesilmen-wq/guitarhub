"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/app/components/AppNav";
import { AlphaTabPlayer } from "@/app/components/AlphaTabPlayer";
import { supabase } from "@/lib/supabase";
import type { LearningTab, LearningTabTrack } from "@/lib/types";

type LearningRevision = {
  id: number;
  revision_number: number;
  change_note?: string | null;
  created_at?: string | null;
};

type LoadedLearningTab = LearningTab & {
  learning_tab_tracks?: LearningTabTrack[];
  learning_tab_revisions?: LearningRevision[];
};

const DEMO_TAB: LoadedLearningTab = {
  id: 0,
  slug: "demo",
  title: "Demo Tab",
  artist: "GuitarHub Studio",
  artist_slug: "guitarhub-studio",
  status: "published",
  source_type: "demo",
  tuning: "E A D G B E",
  bpm: 90,
  key: "C",
  instruments: ["Gitar", "Bas", "Davul"],
  tab_text: [
    "e|----------------|----------------|",
    "B|-----0-----1----|-----3-----1----|",
    "G|---0-----0------|---0-----0------|",
    "D|----------------|----------------|",
    "A|-3-----3--------|-2-----2--------|",
    "E|----------------|----------------|",
  ].join("\n"),
  gp_file_url: null,
  contributor_name: "GuitarHub",
  revision_number: 1,
  learning_tab_tracks: [
    { id: 0, tab_id: 0, name: "Lead Guitar", instrument: "Gitar", tuning: "E A D G B E", volume: 80, muted: false, solo: true, tab_text: "", position: 1 },
    { id: 1, tab_id: 0, name: "Bass", instrument: "Bas", tuning: "E A D G", volume: 75, muted: false, solo: false, tab_text: "", position: 2 },
    { id: 2, tab_id: 0, name: "Drums", instrument: "Davul", tuning: null, volume: 70, muted: false, solo: false, tab_text: "", position: 3 },
  ],
  learning_tab_revisions: [{ id: 0, revision_number: 1, change_note: "İlk demo sürüm", created_at: null }],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function SongLearnDetailPage() {
  const params = useParams<{ tabId: string }>();
  const tabId = params.tabId;
  const [tab, setTab] = useState<LoadedLearningTab | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [countInEnabled, setCountInEnabled] = useState(true);
  const [currentMeasure, setCurrentMeasure] = useState(0);
  const [mutedTrackIds, setMutedTrackIds] = useState<number[]>([]);
  const [soloTrackId, setSoloTrackId] = useState<number | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [gpFileUrl, setGpFileUrl] = useState("");
  const [uploadingGpFile, setUploadingGpFile] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [editorStatus, setEditorStatus] = useState<LearningTab["status"]>("published");
  const [revisionNote, setRevisionNote] = useState("");
  const [savingEditor, setSavingEditor] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const measureRailRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const recordHistory = useCallback(async (openedTabId: number) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId || !openedTabId) return;
    await supabase.from("learning_history").upsert(
      { user_id: userId, tab_id: openedTabId, opened_at: new Date().toISOString() },
      { onConflict: "user_id,tab_id" },
    );
  }, []);

  useEffect(() => {
    async function loadTabDetail() {
      setLoading(true);
      setMessage("");
      const numericId = Number(tabId);
      const query = supabase.from("learning_tabs")
        .select("*, learning_tab_tracks(*), learning_tab_revisions(*)")
        .eq(Number.isFinite(numericId) ? "id" : "slug", Number.isFinite(numericId) ? numericId : tabId)
        .single();
      const { data, error } = await query;

      if (error || !data) {
        setTab(DEMO_TAB);
        setGpFileUrl(DEMO_TAB.gp_file_url ?? "");
        setEditorText(DEMO_TAB.tab_text);
        setEditorStatus(DEMO_TAB.status);
        setSelectedTrackId(DEMO_TAB.learning_tab_tracks?.[0]?.id ?? null);
        setMessage("Tab bulunamadı veya Supabase erişimi yok; demo player açıldı.");
      } else {
        const loaded = data as LoadedLearningTab;
        setTab(loaded);
        setGpFileUrl(loaded.gp_file_url ?? "");
        setEditorText(loaded.tab_text || "");
        setEditorStatus(loaded.status);
        setSelectedTrackId(loaded.learning_tab_tracks?.[0]?.id ?? null);
        await recordHistory(loaded.id);
      }
      setLoading(false);
    }

    loadTabDetail();
  }, [recordHistory, tabId]);

  async function toggleFavorite() {
    if (!tab?.id) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      setMessage("Favori için giriş yapmalısın.");
      return;
    }

    if (favorite) {
      await supabase.from("learning_favorites").delete().eq("user_id", userId).eq("tab_id", tab.id);
      setFavorite(false);
      setMessage("Favorilerden çıkarıldı.");
      return;
    }

    await supabase.from("learning_favorites").upsert({ user_id: userId, tab_id: tab.id }, { onConflict: "user_id,tab_id" });
    setFavorite(true);
    setMessage("Favoriye eklendi.");
  }

  async function handleGpFileUpload(file: File | null) {
    if (!file || !tab?.id) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["gp", "gp3", "gp4", "gp5", "gpx"].includes(extension)) {
      setMessage("Sadece .gp, .gp3, .gp4, .gp5 veya .gpx dosyası yükle.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      setMessage("GP dosyası yüklemek için giriş yapmalısın.");
      return;
    }

    setUploadingGpFile(true);
    setMessage("");
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${userId}/${tab.id}/${Date.now()}-${safeFileName}`;
    const { error: uploadError } = await supabase.storage.from("learning-tabs").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });

    if (uploadError) {
      setUploadingGpFile(false);
      setMessage(`GP dosyası yüklenemedi: ${uploadError.message}`);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("learning-tabs").getPublicUrl(storagePath);
    const publicUrl = publicUrlData.publicUrl;
    setGpFileUrl(publicUrl);

    const { error: updateError } = await supabase.from("learning_tabs").update({ gp_file_url: publicUrl }).eq("id", tab.id);
    setUploadingGpFile(false);
    if (updateError) {
      setMessage("GP dosyası yüklendi ve player'a verildi; ama bu tab kaydını güncelleme iznin yoksa URL kalıcı yazılamaz.");
      return;
    }
    setMessage("GP dosyası yüklendi ve AlphaTab player'a bağlandı.");
  }

  async function handleSaveTabEdit() {
    if (!tab?.id) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      setMessage("Tab düzenlemek için giriş yapmalısın.");
      return;
    }

    setSavingEditor(true);
    setMessage("");
    const nextRevision = (tab.revision_number || 1) + 1;
    const { error: updateError } = await supabase.from("learning_tabs").update({
      tab_text: editorText,
      status: editorStatus,
      revision_number: nextRevision,
      updated_at: new Date().toISOString(),
    }).eq("id", tab.id);

    if (updateError) {
      setSavingEditor(false);
      setMessage(`Tab kaydedilemedi: ${updateError.message}`);
      return;
    }

    await supabase.from("learning_tab_revisions").insert({
      tab_id: tab.id,
      user_id: userId,
      revision_number: nextRevision,
      change_note: revisionNote || "Tab editörü ile güncellendi",
      tab_snapshot: {
        title: tab.title,
        artist: tab.artist,
        status: editorStatus,
        tab_text: editorText,
        gp_file_url: gpFileUrl,
      },
    });

    setTab((current) => current ? { ...current, tab_text: editorText, status: editorStatus, revision_number: nextRevision } : current);
    setRevisionNote("");
    setSavingEditor(false);
    setMessage("Tab kaydedildi ve yeni revizyon oluşturuldu.");
  }

  const tracks = tab?.learning_tab_tracks?.length ? tab.learning_tab_tracks : DEMO_TAB.learning_tab_tracks ?? [];
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  const selectedTrackNumericId = selectedTrack?.id;
  const playerText = selectedTrack?.tab_text || tab?.tab_text || DEMO_TAB.tab_text;
  const lines = useMemo(() => playerText.split(/\r?\n/).filter(Boolean), [playerText]);
  const measureCount = 10;

  const setMeasureRef = useCallback((index: number, element: HTMLSpanElement | null) => {
    measureRefs.current[index] = element;
  }, []);

  const advanceCurrentMeasure = useCallback(() => {
    setCurrentMeasure((current) => {
      if (current >= measureCount - 1) {
        if (loopEnabled) return 0;
        setPlaying(false);
        return loopEnabled ? 0 : measureCount - 1;
      }
      return current + 1;
    });
  }, [loopEnabled]);

  useEffect(() => {
    const activeMeasure = measureRefs.current[currentMeasure];
    activeMeasure?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    if (measureRailRef.current) {
      measureRailRef.current.dataset.currentMeasure = String(currentMeasure + 1);
    }
  }, [currentMeasure]);

  useEffect(() => {
    if (!playing) return;
    const beatMs = Math.max(260, 60000 / Math.max(40, speed));
    const intervalId = window.setInterval(advanceCurrentMeasure, beatMs);
    return () => window.clearInterval(intervalId);
  }, [advanceCurrentMeasure, playing, speed]);

  const toggleSelectedTrackMute = useCallback(() => {
    if (selectedTrackNumericId == null) return;
    setMutedTrackIds((current) =>
      current.includes(selectedTrackNumericId) ? current.filter((trackId) => trackId !== selectedTrackNumericId) : [...current, selectedTrackNumericId],
    );
  }, [selectedTrackNumericId]);

  const toggleSelectedTrackSolo = useCallback(() => {
    if (selectedTrackNumericId == null) return;
    setSoloTrackId((current) => (current === selectedTrackNumericId ? null : selectedTrackNumericId));
  }, [selectedTrackNumericId]);

  const handlePlayerShortcut = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") return;

    if (event.code === "Space") {
      event.preventDefault();
      setPlaying((value) => !value);
      return;
    }
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      setSpeed((value) => (value >= 150 ? 100 : clamp(value + 5, 25, 150)));
      return;
    }
    if (event.key.toLowerCase() === "l") {
      event.preventDefault();
      setLoopEnabled((value) => !value);
      return;
    }
    if (event.key.toLowerCase() === "m" && event.altKey) {
      event.preventDefault();
      toggleSelectedTrackSolo();
      return;
    }
    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      toggleSelectedTrackMute();
      return;
    }
    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      setMetronomeEnabled((value) => !value);
      return;
    }
    if (event.key.toLowerCase() === "c") {
      event.preventDefault();
      setCountInEnabled((value) => !value);
      return;
    }
    if (event.key.toLowerCase() === "e") {
      event.preventDefault();
      setEditorOpen((value) => !value);
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      setCurrentMeasure(0);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setCurrentMeasure((value) => Math.min(measureCount - 1, value + 1));
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setCurrentMeasure((value) => Math.max(0, value - 1));
    }
  }, [toggleSelectedTrackMute, toggleSelectedTrackSolo]);

  useEffect(() => {
    window.addEventListener("keydown", handlePlayerShortcut);
    return () => window.removeEventListener("keydown", handlePlayerShortcut);
  }, [handlePlayerShortcut]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.16),transparent_34%),#09090b] p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-7xl">
        <AppNav />

        <Link href="/sarki-ogren" className="mb-4 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-800">
          ← Şarkı Öğren&apos;e dön
        </Link>

        {loading ? (
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-zinc-300">Tab yükleniyor...</section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
            <div className="space-y-6">
              <header className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Şarkı sayfası</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">{tab?.title}</h1>
                <Link href={`/sanatci/${tab?.artist_slug}`} className="mt-3 inline-flex text-lg font-bold text-red-300 hover:text-red-200">{tab?.artist}</Link>
                <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-zinc-200">
                  <span className="rounded-full bg-zinc-900 px-3 py-2">Akort: {tab?.tuning || "-"}</span>
                  <span className="rounded-full bg-zinc-900 px-3 py-2">BPM: {tab?.bpm || "-"}</span>
                  <span className="rounded-full bg-zinc-900 px-3 py-2">Ton: {tab?.key || "-"}</span>
                  <span className="rounded-full bg-zinc-900 px-3 py-2">Revizyon: v{tab?.revision_number || 1}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={toggleFavorite} className="rounded-2xl bg-red-600 px-5 py-3 font-black hover:bg-red-500">
                    {favorite ? "Favoriden Çıkar" : "Favoriye Ekle"}
                  </button>
                  <button onClick={() => setMessage("Playlist'e Ekle altyapısı hazır; playlist seçim popup'ı sonraki adımda bağlanacak.")} className="rounded-2xl bg-zinc-800 px-5 py-3 font-black hover:bg-zinc-700">
                    {"Playlist'e Ekle"}
                  </button>
                </div>
                {message && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-100">{message}</p>}
              </header>

              <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-4 sm:p-6">
                <label className="block text-sm font-black uppercase tracking-[0.16em] text-zinc-400" htmlFor="gp-file-url">GP dosyası URL</label>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <input
                    id="gp-file-url"
                    value={gpFileUrl}
                    onChange={(event) => setGpFileUrl(event.target.value)}
                    placeholder="https://.../dosya.gp5 veya Supabase Storage public URL"
                    className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-red-500"
                  />
                  <button type="button" onClick={() => setMessage("GP URL player'a yüklendi. Dosya public/CORS izinli olmalı.")} className="rounded-2xl bg-zinc-800 px-5 py-3 font-black hover:bg-zinc-700">
                    Player&apos;a Yükle
                  </button>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-4">
                  <label className="block text-sm font-black text-zinc-200" htmlFor="gp-file-upload">GP dosyası yükle</label>
                  <input
                    id="gp-file-upload"
                    type="file"
                    accept=".gp,.gp3,.gp4,.gp5,.gpx"
                    disabled={uploadingGpFile}
                    onChange={(event) => void handleGpFileUpload(event.target.files?.[0] ?? null)}
                    className="mt-3 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-black file:text-white hover:file:bg-red-500 disabled:opacity-60"
                  />
                  {uploadingGpFile && <p className="mt-2 text-sm font-bold text-red-300">Yükleniyor...</p>}
                </div>
                <p className="mt-2 text-xs text-zinc-500">Tab kaynağını sonra netleştireceğiz; bu alan şimdilik izinli/public GP dosyalarını AlphaTab motoruna verir.</p>
              </section>

              <AlphaTabPlayer fileUrl={gpFileUrl} title={tab?.title || "Guitar Pro Player"} />

              <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">Tab Editörü</p>
                    <h2 className="mt-1 text-2xl font-black">Nota / tab metnini düzenle</h2>
                    <p className="mt-1 text-sm text-zinc-400">E kısayolu ile aç/kapat. Kaydetme yeni revizyon oluşturur.</p>
                  </div>
                  <button type="button" onClick={() => setEditorOpen((value) => !value)} className="rounded-2xl bg-zinc-800 px-5 py-3 font-black hover:bg-zinc-700">
                    {editorOpen ? "Editörü Kapat" : "Editörü Aç"}
                  </button>
                </div>

                {editorOpen && (
                  <div className="mt-5 grid gap-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm font-bold">
                        Public edit
                        <select value={editorStatus} onChange={(event) => setEditorStatus(event.target.value as LearningTab["status"])} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-white">
                          <option value="published">Public edit</option>
                          <option value="private">Private edit</option>
                          <option value="draft">Taslak</option>
                        </select>
                      </label>
                      <label className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm font-bold sm:col-span-2">
                        Revizyon notu
                        <input value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} placeholder="Örn: solo kısmındaki 4. ölçü düzeltildi" className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-white" />
                      </label>
                    </div>
                    <textarea value={editorText} onChange={(event) => setEditorText(event.target.value)} className="min-h-[280px] rounded-2xl border border-zinc-700 bg-black p-4 font-mono text-sm text-zinc-100 outline-none focus:border-red-500" />
                    <button type="button" disabled={savingEditor} onClick={() => void handleSaveTabEdit()} className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60">
                      {savingEditor ? "Kaydediliyor..." : "Kaydet ve revizyon oluştur"}
                    </button>
                  </div>
                )}
              </section>

              <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-4 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Büyük Tab Player</p>
                    <h2 className="mt-1 text-2xl font-black">{selectedTrack?.name || "Ana Tab"}</h2>
                  </div>
                  <button onClick={() => setPlaying((value) => !value)} className={`min-h-12 rounded-2xl px-6 font-black ${playing ? "bg-white text-zinc-950" : "bg-red-600 text-white hover:bg-red-500"}`}>
                    {playing ? "Duraklat" : "Oynat"}
                  </button>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-black p-4 font-mono text-sm leading-8 text-zinc-100 sm:text-base">
                  <div ref={measureRailRef} className="mb-3 flex min-w-[760px] items-center gap-2 border-b border-zinc-800 pb-3 text-xs text-zinc-500">
                    {Array.from({ length: measureCount }, (_, index) => (
                      <span ref={(element) => setMeasureRef(index, element)} data-measure-index={index} key={index} className={`inline-flex w-20 justify-center rounded-full py-1 font-bold ${currentMeasure === index ? "bg-green-500 text-black shadow-lg shadow-green-500/30" : "bg-zinc-900"}`}>
                        Ölçü {index + 1}
                      </span>
                    ))}
                  </div>
                  <pre className="min-w-[760px] whitespace-pre">{lines.join("\n")}</pre>
                  <div className="mt-4 flex min-w-[760px] flex-wrap gap-2 border-t border-zinc-800 pt-3 text-xs font-bold text-zinc-300">
                    <span className="rounded-full bg-green-500 px-3 py-1 text-black">Yeşil imleç: Ölçü {currentMeasure + 1}</span>
                    <span className="rounded-full bg-zinc-900 px-3 py-1">İlerleme: {playing ? "Otomatik" : "Manuel"}</span>
                    <span className="rounded-full bg-zinc-900 px-3 py-1">Auto-scroll: Açık</span>
                    <span className="rounded-full bg-zinc-900 px-3 py-1">Metronom: {metronomeEnabled ? "Açık" : "Kapalı"}</span>
                    <span className="rounded-full bg-zinc-900 px-3 py-1">Count-in: {countInEnabled ? "Açık" : "Kapalı"}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <label className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Playback Speed</span>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => setSpeed((value) => clamp(value - 5, 25, 150))} className="rounded-lg bg-zinc-800 px-3 py-2 font-bold">-</button>
                      <strong className="min-w-16 text-center">{speed}%</strong>
                      <button onClick={() => setSpeed((value) => clamp(value + 5, 25, 150))} className="rounded-lg bg-zinc-800 px-3 py-2 font-bold">+</button>
                    </div>
                  </label>
                  <button onClick={() => setLoopEnabled((value) => !value)} className={`rounded-2xl border p-4 text-left font-black ${loopEnabled ? "border-red-500 bg-red-600" : "border-zinc-800 bg-zinc-950"}`}>
                    Loop
                    <span className="mt-1 block text-sm font-semibold opacity-80">Seçili ölçüleri döndür</span>
                  </button>
                  <button onClick={() => setCountInEnabled((value) => !value)} className={`rounded-2xl border p-4 text-left font-black ${countInEnabled ? "border-red-500 bg-red-600" : "border-zinc-800 bg-zinc-950"}`}>
                    Count In
                    <span className="mt-1 block text-sm font-semibold opacity-80">Çalmadan önce sayım</span>
                  </button>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
                <h2 className="text-2xl font-black">Enstrüman Trackleri</h2>
                <div className="mt-4 space-y-3">
                  {tracks.map((track) => (
                    <button key={track.id} onClick={() => setSelectedTrackId(track.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedTrack?.id === track.id ? "border-red-500 bg-red-950/30" : "border-zinc-800 bg-zinc-950"}`}>
                      <strong>{track.name}</strong>
                      <span className="mt-1 block text-sm text-zinc-400">{track.instrument} · Vol {track.volume}% · {track.tuning || "Standart"}</span>
                      <span className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                        {mutedTrackIds.includes(track.id) && <span className="rounded-full bg-white px-2 py-1 text-black">Muted</span>}
                        {soloTrackId === track.id && <span className="rounded-full bg-red-600 px-2 py-1 text-white">Solo</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
                <h2 className="text-2xl font-black">Revizyon Geçmişi</h2>
                <div className="mt-4 space-y-3">
                  {(tab?.learning_tab_revisions?.length ? tab.learning_tab_revisions : DEMO_TAB.learning_tab_revisions ?? []).map((revision) => (
                    <div key={revision.id} className="rounded-2xl bg-zinc-950 p-4">
                      <strong>v{revision.revision_number}</strong>
                      <p className="mt-1 text-sm text-zinc-400">{revision.change_note || "Revizyon notu yok"}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-5">
                <h2 className="text-2xl font-black">Kısayollar</h2>
                <div className="mt-4 grid gap-2 text-sm text-zinc-300">
                  <span>Space = Play/Pause</span>
                  <span>S = Speed</span>
                  <span>L = Loop</span>
                  <span>M = Mute</span>
                  <span>Alt+M = Solo</span>
                  <span>N = Metronome</span>
                  <span>C = Count-In</span>
                  <span>P = Print</span>
                  <span>E = Editor</span>
                  <span>T = Track listesi</span>
                  <span>Backspace = Başa dön</span>
                  <span>Ok tuşları = Gezinti</span>
                </div>
              </section>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
