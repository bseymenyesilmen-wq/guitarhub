"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Kayit() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function kayitOl() {
    setMessage("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("Isim, e-posta ve sifre zorunludur.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim(), username: name.trim() } },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        name: name.trim(),
        username: name.trim(),
      });
    }

    setLoading(false);
    setMessage("Kayit basarili. E-postani kontrol edebilirsin.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">GuitarHub</p>
        <h1 className="text-3xl font-black">Hesap olustur</h1>
        <p className="mt-2 text-sm text-zinc-400">Kişisel repertuar ve akor arşivini hazırla.</p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Kullanici adi"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-red-500"
          />
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-red-500"
          />
          <input
            type="password"
            placeholder="Sifre"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-red-500"
          />
        </div>

        {message && <p className="mt-4 rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200">{message}</p>}

        <button
          onClick={kayitOl}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-red-600 p-4 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Kayit olusturuluyor..." : "Kayit Ol"}
        </button>

        <Link href="/giris" className="mt-4 block text-center text-sm font-semibold text-zinc-300 hover:text-white">
          Zaten hesabim var
        </Link>
      </div>
    </main>
  );
}
