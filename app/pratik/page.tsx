"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { supabase } from "@/lib/supabase";
import type { PracticeLog } from "@/lib/types";

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours > 0) {
    return `${hours} saat ${rest} dakika`;
  }

  return `${rest} dakika`;
}

export default function Pratik() {
  const router = useRouter();

  const [logs, setLogs] = useState<PracticeLog[]>([]);
  const [userId, setUserId] = useState("");
  const [minutes, setMinutes] = useState("45");
  const [goalMinutes, setGoalMinutes] = useState("450");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/giris");
      return;
    }

    setUserId(session.user.id);

    const { data, error } = await supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("practiced_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLogs([]);
    } else {
      setLogs((data ?? []) as PracticeLog[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLogs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadLogs]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = now.toDateString();

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const today = logs
      .filter((log) => new Date(log.practiced_at).toDateString() === todayKey)
      .reduce((total, log) => total + Number(log.minutes || 0), 0);

    const week = logs
      .filter((log) => new Date(log.practiced_at) >= weekStart)
      .reduce((total, log) => total + Number(log.minutes || 0), 0);

    const goal = Number(goalMinutes) || logs[0]?.goal_minutes || 450;
    const progress = goal > 0 ? Math.min(100, Math.round((week / goal) * 100)) : 0;

    return {
      today,
      week,
      goal,
      progress,
    };
  }, [goalMinutes, logs]);

  async function addLog() {
    setMessage("");

    const parsedMinutes = Number(minutes);
    const parsedGoal = Number(goalMinutes);

    if (!userId) {
      setMessage("Oturum bulunamadi.");
      return;
    }

    if (!parsedMinutes || parsedMinutes < 1) {
      setMessage("Calisma suresi en az 1 dakika olmali.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("practice_logs").insert({
      user_id: userId,
      minutes: parsedMinutes,
      goal_minutes: parsedGoal > 0 ? parsedGoal : 450,
      note: note.trim() || null,
      practiced_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMinutes("45");
    setNote("");
    setMessage("Pratik kaydi eklendi.");
    await loadLogs();
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6">
          <h1 className="text-4xl font-black">Pratik Takibi</h1>
          <p className="mt-2 text-zinc-400">
            Gunluk calisma surelerini kaydet, haftalik hedefini ve ilerlemeni gor.
          </p>
        </section>

        {loading ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            Pratik kayitlari yukleniyor...
          </div>
        ) : (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-sm text-zinc-400">Bugun</p>
                <p className="mt-2 text-3xl font-black">{formatMinutes(stats.today)}</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-sm text-zinc-400">Bu hafta</p>
                <p className="mt-2 text-3xl font-black">{formatMinutes(stats.week)}</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-zinc-400">Ilerleme</p>
                  <p className="text-sm text-zinc-500">Hedef: {formatMinutes(stats.goal)}</p>
                </div>

                <p className="mt-2 text-3xl font-black">%{stats.progress}</p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-3 rounded-full bg-red-600"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <h2 className="text-xl font-black">Yeni Kayit</h2>

                <div className="mt-4 space-y-3">
                  <input
                    value={minutes}
                    onChange={(event) => setMinutes(event.target.value.replace(/\D/g, ""))}
                    placeholder="Bugun kac dakika calistin?"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
                  />

                  <input
                    value={goalMinutes}
                    onChange={(event) => setGoalMinutes(event.target.value.replace(/\D/g, ""))}
                    placeholder="Haftalik hedef dakika"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
                  />

                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Calisma notu"
                    className="min-h-28 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 outline-none focus:border-red-500"
                  />
                </div>

                {message && (
                  <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">
                    {message}
                  </p>
                )}

                <button
                  onClick={addLog}
                  disabled={saving}
                  className="mt-4 w-full rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <h2 className="text-xl font-black">Kayit Listesi</h2>

                <div className="mt-4 space-y-3">
                  {logs.map((log) => {
                    const barWidth = Math.min(100, Math.round((Number(log.minutes) / 120) * 100));

                    return (
                      <div key={log.id} className="rounded-lg bg-zinc-950 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <strong>{formatMinutes(Number(log.minutes))}</strong>
                          <span className="text-sm text-zinc-400">
                            {new Date(log.practiced_at).toLocaleDateString("tr-TR")}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-red-600"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>

                        {log.note && (
                          <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-400">
                            {log.note}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {logs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                      Henuz pratik kaydi yok.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}