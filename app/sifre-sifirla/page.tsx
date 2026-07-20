"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { GhButton } from "@/app/components/ui/GhButton";
import { GhCard } from "@/app/components/ui/GhCard";
import { GhInput } from "@/app/components/ui/GhInput";
import { supabase } from "@/lib/supabase";

const AUTH_REDIRECT_URL = "https://guitarhub47.netlify.app/giris";

export default function SifreSifirla() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendReset() {
    setMessage("");

    if (!email.trim()) {
      setMessage("E-posta adresini yazmalısın.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: AUTH_REDIRECT_URL,
    });
    setLoading(false);

    setMessage(error ? error.message : "Şifre sıfırlama bağlantısı e-postana gönderildi.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) void sendReset();
  }

  return (
    <main className="gh-page flex min-h-screen items-center justify-center p-4 text-white sm:p-6">
      <GhCard glow className="w-full max-w-md p-5 sm:p-7">
        <p className="gh-kicker text-xs">Güvenli Erişim</p>
        <h1 className="mt-2 text-3xl font-black text-white">Şifre Sıfırla</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">E-postana güvenli bir sıfırlama bağlantısı gönderelim.</p>

        <form onSubmit={handleSubmit}>
        <div className="mt-6">
          <GhInput
            type="email"
            label="E-posta"
            placeholder=""
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {message && <p className="mt-4 rounded-2xl bg-zinc-900 p-3 text-sm font-bold text-zinc-100 ring-1 ring-white/10">{message}</p>}

        <GhButton type="submit" disabled={loading} fullWidth className="mt-6">
          {loading ? "Gönderiliyor..." : "Bağlantı Gönder"}
        </GhButton>
        </form>

        <Link href="/giris" className="mt-5 block text-center text-sm font-bold text-zinc-300 hover:text-white">
          Girişe Dön
        </Link>
      </GhCard>
    </main>
  );
}
