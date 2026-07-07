"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "@/lib/chatbot";

type UiMessage = ChatMessage & { id: string };

function renderMessage(content: string) {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return <span key={index}>{part}</span>;

    const [, label, href] = match;
    if (!href.startsWith("/")) return <span key={index}>{label}</span>;

    return (
      <Link key={index} href={href} className="font-bold text-red-300 underline underline-offset-4">
        {label}
      </Link>
    );
  });
}

const SUGGESTIONS = [
  "Duman tarzı akor yürüyüşü öner",
  "F#m nasıl basılır?",
  "Beste yaparken nakarat nasıl güçlenir?",
  "Mix mastering için vokali nasıl öne alırım?",
];

function getConversationId() {
  const key = "guitarhub-yoda-conversation-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const created = makeClientId();
  window.localStorage.setItem(key, created);
  return created;
}

function makeClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `yoda-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatError, setChatError] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Selam, ben Yoda. Müzik hakkında her şeyi sorabilirsin: şarkı, akor, gam, gitar, beste, prodüksiyon, mix mastering, repertuvar ve GuitarHub kullanımı. Müzik dışı konulara girmem kanka.",
    },
  ]);

  const apiHistory = useMemo<ChatMessage[]>(
    () => messages.filter((message) => message.id !== "welcome").map(({ role, content }) => ({ role, content })),
    [messages],
  );

  useEffect(() => {
    function openYoda() {
      setOpen(true);
    }

    window.addEventListener("guitarhub:open-yoda", openYoda);
    return () => window.removeEventListener("guitarhub:open-yoda", openYoda);
  }, []);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: UiMessage = { id: makeClientId(), role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setChatError("");
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed, history: apiHistory, conversationId: getConversationId() }),
      }).catch(() => null);

      const payload = response ? await response.json().catch(() => null) : null;
      if (!response) setChatError("Yoda gönderemedi kanka. Bağlantıyı kontrol edip tekrar dene.");
      const reply = typeof payload?.reply === "string" ? payload.reply : "Yoda cevap veremedi kanka. Tekrar dener misin?";

      setMessages((current) => [...current, { id: makeClientId(), role: "assistant", content: reply }]);
    } catch {
      setChatError("Yoda gönderemedi kanka. Bağlantıyı kontrol edip tekrar dene.");
      setMessages((current) => [...current, { id: makeClientId(), role: "assistant", content: "Yoda gönderemedi kanka. Tekrar dener misin?" }]);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
      {open && (
        <section className="mb-3 flex h-[540px] w-[calc(100vw-2rem)] max-w-[410px] flex-col overflow-hidden rounded-[2rem] border border-red-500/20 bg-zinc-950/95 shadow-2xl shadow-red-950/20 ring-1 ring-white/10 backdrop-blur-xl">
          <header className="border-b border-white/10 bg-gradient-to-br from-red-950/50 to-zinc-950 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">GuitarHub Yardımcı</p>
                <h2 className="mt-1 text-lg font-black text-white">Yoda · Müzik Asistanı</h2>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black text-red-100">
                  <button type="button" onClick={() => void sendMessage("Akor soracağım")} className="rounded-full bg-white/10 px-3 py-2 hover:bg-white/15">Akor sor</button>
                  <button type="button" onClick={() => void sendMessage("Söz yazmama yardım et")} className="rounded-full bg-white/10 px-3 py-2 hover:bg-white/15">Söz yaz</button>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="min-h-10 min-w-10 rounded-full bg-zinc-800 text-xl font-black text-white hover:bg-zinc-700">
                ×
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-100"}`}>
                  {renderMessage(message.content)}
                </div>
              </div>
            ))}
            {loading && <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-zinc-400">Yoda cevaplıyor...</div>}
          </div>

          <div className="border-t border-zinc-800 p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {SUGGESTIONS.map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => void sendMessage(suggestion)} className="shrink-0 rounded-full bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800">
                  {suggestion}
                </button>
              ))}
            </div>
            {chatError && <p className="mb-2 rounded-xl bg-red-950/70 px-3 py-2 text-xs font-bold text-red-100">{chatError}</p>}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Bir şey sor..."
                className="min-h-11 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none focus:border-red-500"
              />
              <button type="submit" disabled={loading} className="min-h-11 rounded-2xl bg-red-600 px-4 text-sm font-black text-white hover:bg-red-500 disabled:opacity-60">
                Gönder
              </button>
            </form>
          </div>
        </section>
      )}

      <button onClick={() => setOpen((value) => !value)} className="group relative flex min-h-14 items-center gap-2 rounded-full bg-gradient-to-br from-red-500 to-red-700 px-5 font-black text-white shadow-2xl shadow-red-950/40 ring-2 ring-red-400/20 transition hover:-translate-y-0.5 hover:shadow-red-900/60">
        <span className="absolute -inset-1 -z-10 rounded-full bg-red-600/30 blur-xl transition group-hover:bg-red-500/40" />
        <span>Yoda</span>
        <span className="text-xl">✦</span>
      </button>
    </div>
  );
}
