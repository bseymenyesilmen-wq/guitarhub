import Link from "next/link";
import { AppNav } from "@/app/components/AppNav";
import { THEORY_TOPICS } from "@/lib/library";
import { SCALE_FORMULAS } from "@/lib/music-theory";

const LESSON_MODULES = [
  ["Akor Dersleri", "Açık akorlar, barre akorlar, 7’li/9’lu renkler ve akor kurulum mantığı."],
  ["Gam Dersleri", "Major, minor, pentatonik, blues ve klavye üzerinde interval okuma."],
  ["Mod Dersleri", "Dorian, Phrygian, Lydian, Mixolydian, Aeolian ve Locrian karakterleri."],
  ["Triadlar & Arpejler", "Kök-üçlü-beşli yapı, ters çevrimler ve solo içinde chord tone hedefleme."],
  ["Fonksiyonel Armoni", "Ton merkezi, derece akorları, dominant çözülme ve progresyon analizi."],
  ["Kulak Eğitimi", "Aralık duyma, akor rengi tanıma ve günlük kısa pratik egzersizleri."],
];

const AI_QUESTIONS = [
  "Bu şarkının tonu ne?",
  "F#m üzerine ne çalabilirim?",
  "Bu progresyon neden çalışıyor?",
  "Bu akor hangi gamın içinde?",
  "Blues öğrenmek için ne çalışmalıyım?",
];

export default function Teori() {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-28 text-white sm:p-6 md:pb-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-400">Gitar eğitim merkezi</p>
          <h1 className="mt-3 text-4xl font-black">Teori, Modlar ve AI Gitar Koçu</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            GuitarHub artık sadece repertuar değil; akor, gam, mod, armoni ve doğaçlama tarafında öğretici bir eğitim merkezi olacak şekilde hazırlandı.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/akor-kutuphanesi" className="min-h-11 rounded-full bg-red-600 px-5 py-3 font-bold hover:bg-red-500">
              Akorları çalış
            </Link>
            <Link href="/gam-kutuphanesi" className="min-h-11 rounded-full bg-zinc-800 px-5 py-3 font-bold hover:bg-zinc-700">
              Gam klavyesini aç
            </Link>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LESSON_MODULES.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{body}</p>
            </article>
          ))}
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-red-900/50 bg-red-950/25 p-5">
            <h2 className="text-2xl font-black">AI Gitar Koçu Tasarımı</h2>
            <p className="mt-3 text-zinc-300">
              Koç sistemi deterministik teori motorunu kullanıp öğretmen gibi kısa, uygulanabilir cevap verecek. İlk sürümde önerilen soru tipleri:
            </p>
            <div className="mt-4 grid gap-2">
              {AI_QUESTIONS.map((question) => (
                <div key={question} className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-red-100">
                  {question}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-2xl font-black">Mod Karakterleri</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SCALE_FORMULAS.filter((scale) => scale.category === "Mod" || scale.id === "major" || scale.id === "minor").map((scale) => (
                <div key={scale.id} className="rounded-2xl bg-zinc-950 p-4">
                  <h3 className="font-black text-red-300">{scale.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{scale.formula.join(" ")}</p>
                  <p className="mt-2 text-sm text-zinc-300">{scale.character}</p>
                  <p className="mt-2 text-xs text-zinc-500">Türler: {scale.genres.join(", ")}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {THEORY_TOPICS.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
