"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
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

  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Selam, ben Yoda. Müzik hakkında her şeyi sorabilirsin: şarkı, akor, gam, gitar, beste, prodüksiyon, mix mastering, repertuar ve GuitarHub kullanımı. Müzik dışı konulara girmem kanka.",
    },
  ]);

  const apiHistory = useMemo<ChatMessage[]>(
    () => messages.filter((message) => message.id !== "welcome").map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: UiMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: trimmed, history: apiHistory, conversationId: getConversationId() }),
    }).catch(() => null);

    const payload = response ? await response.json().catch(() => null) : null;
    const reply = typeof payload?.reply === "string" ? payload.reply : "Şu an cevap veremedim. Biraz sonra tekrar dener misin?";

    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    setLoading(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
      {open && (
        <section className="mb-3 flex h-[520px] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
          <header className="border-b border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">GuitarHub Yardımcı</p>
                <h2 className="mt-1 text-lg font-black text-white">Yoda Chatbot</h2>
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
                <button key={suggestion} onClick={() => void sendMessage(suggestion)} className="shrink-0 rounded-full bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800">
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Bir şey sor..."
                className="min-h-11 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none focus:border-red-500"
              />
              <button disabled={loading} className="min-h-11 rounded-2xl bg-red-600 px-4 text-sm font-black text-white hover:bg-red-500 disabled:opacity-60">
                Gönder
              </button>
            </form>
          </div>
        </section>
      )}

      <button onClick={() => setOpen((value) => !value)} className="flex min-h-14 items-center gap-2 rounded-full bg-red-600 px-5 font-black text-white shadow-xl shadow-black/30 hover:bg-red-500">
        <span>Yoda</span>
        <span className="text-xl">✦</span>
      </button>
    </div>
  );
}
