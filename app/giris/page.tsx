"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GhButton } from "@/app/components/ui/GhButton";
import { GhCard } from "@/app/components/ui/GhCard";
import { GhInput } from "@/app/components/ui/GhInput";
import { supabase } from "@/lib/supabase";
import { usernameToAuthEmail, normalizeUsername } from "@/lib/authUsername";

export default function Giris() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function girisYap() {
    setMessage("");

    const trimmedLoginId = loginId.trim();
    const authEmail = trimmedLoginId.includes("@") ? trimmedLoginId : usernameToAuthEmail(normalizeUsername(trimmedLoginId));

    if (!authEmail || !password.trim()) {
      setMessage("Kullanıcı adı/e-posta ve şifre zorunludur.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) void girisYap();
  }

  return (
    <main className="gh-page flex min-h-screen items-center justify-center p-4 text-white sm:p-6">
      <GhCard glow className="w-full max-w-md p-5 sm:p-7">
        <p className="gh-kicker text-xs">GuitarHub</p>
        <h1 className="mt-2 text-3xl font-black text-white">Giriş Yap</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Kaldığın şarkıdan devam etmek için hesabına gir.</p>

        <form onSubmit={handleSubmit}>
        <div className="mt-6 space-y-4">
          <GhInput
            label="Kullanıcı Adı veya E-posta"
            type="text"
            placeholder=""
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
          />
          <GhInput
            label="Şifre"
            type="password"
            placeholder=""
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {message && <p className="mt-4 rounded-2xl bg-red-950/70 p-3 text-sm font-bold text-red-100 ring-1 ring-red-500/20">{message}</p>}

        <GhButton type="submit" disabled={loading} fullWidth className="mt-6">
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </GhButton>
        </form>

        <div className="mt-5 text-center text-sm">
          <Link href="/kayit" className="font-bold text-zinc-300 hover:text-white">Kayıt Ol</Link>
        </div>
      </GhCard>
    </main>
  );
}
