"use client";

import Link from "next/link";
import { useState } from "react";
import { GhButton } from "@/app/components/ui/GhButton";
import { GhCard } from "@/app/components/ui/GhCard";
import { GhInput } from "@/app/components/ui/GhInput";
import { supabase } from "@/lib/supabase";

const onboardingSteps = ["Hesabını oluştur", "Mail doğrulamasını tamamla", "İlk setlistini kur"];
const AUTH_REDIRECT_URL = "https://guitarhub47.netlify.app/giris";

export default function Kayit() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function kayitOl() {
    setMessage("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("İsim, e-posta ve şifre zorunludur.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim(), username: name.trim() },
        emailRedirectTo: AUTH_REDIRECT_URL,
      },
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
    setMessage("Kayıt başarılı. Doğrulama maili için e-postanı kontrol et.");
  }

  return (
    <main className="gh-page flex min-h-screen items-center justify-center p-4 text-white sm:p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <GhCard glow className="order-2 p-5 sm:p-7 lg:order-1">
          <p className="gh-kicker text-xs">Yeni Hesap</p>
          <h1 className="mt-2 text-3xl font-black text-white">Hesap Oluştur</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">GitarHub hesabınla repertuvarını, setlistlerini ve bestelerini sakla.</p>

          <div className="mt-6 space-y-4">
            <GhInput label="Kullanıcı Adı" type="text" placeholder="" value={name} onChange={(event) => setName(event.target.value)} />
            <GhInput label="E-posta" type="email" placeholder="" value={email} onChange={(event) => setEmail(event.target.value)} />
            <GhInput label="Şifre" type="password" placeholder="" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>

          {message && <p className="mt-4 rounded-2xl bg-zinc-900 p-3 text-sm font-bold text-zinc-100 ring-1 ring-white/10">{message}</p>}

          <GhButton onClick={kayitOl} disabled={loading} fullWidth className="mt-6">
            {loading ? "Kayıt Oluşturuluyor..." : "Kayıt Ol"}
          </GhButton>

          <Link href="/giris" className="mt-5 block text-center text-sm font-bold text-zinc-300 hover:text-white">
            Zaten hesabım var
          </Link>
        </GhCard>

        <section className="gh-hero order-1 p-6 sm:p-8 lg:order-2">
          <p className="gh-kicker text-xs">Babayaga Tarafından Yaratıldı</p>
          <h2 className="gh-title relative z-10 mt-3 text-4xl font-black sm:text-6xl">Kendi Gitar Dünyanı Kur</h2>
          <div className="relative z-10 mt-6 grid gap-3">
            {onboardingSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-600 text-sm font-black text-white">{index + 1}</span>
                <span className="font-bold text-zinc-100">{step}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
