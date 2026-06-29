"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Giris() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function girisYap() {
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("E-posta ve sifre zorunludur.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">GuitarHub</p>
        <h1 className="text-3xl font-black">Giris yap</h1>
        <p className="mt-2 text-sm text-zinc-400">Repertuarina ve pratik paneline devam et.</p>

        <div className="mt-6 space-y-4">
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

        {message && <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-200">{message}</p>}

        <button
          onClick={girisYap}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-red-600 p-4 font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Giris yapiliyor..." : "Giris Yap"}
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/kayit" className="font-semibold text-zinc-300 hover:text-white">
            Kayit ol
          </Link>
          <Link href="/sifre-sifirla" className="font-semibold text-red-400 hover:text-red-300">
            Sifremi unuttum
          </Link>
        </div>
      </div>
    </main>
  );
}
