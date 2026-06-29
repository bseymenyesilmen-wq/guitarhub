"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SifreSifirla() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendReset() {
    setMessage("");

    if (!email.trim()) {
      setMessage("E-posta adresini yazmalisin.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/giris`,
    });
    setLoading(false);

    setMessage(error ? error.message : "Sifre sifirlama baglantisi e-postana gonderildi.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-3xl font-black">Sifre sifirla</h1>
        <p className="mt-2 text-sm text-zinc-400">Supabase Auth uzerinden guvenli sifre sifirlama e-postasi gonderilir.</p>

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-6 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-red-500"
        />

        {message && <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">{message}</p>}

        <button
          onClick={sendReset}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-red-600 p-4 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Gonderiliyor..." : "Baglanti Gonder"}
        </button>

        <Link href="/giris" className="mt-4 block text-center text-sm font-semibold text-zinc-300 hover:text-white">
          Girise don
        </Link>
      </div>
    </main>
  );
}
