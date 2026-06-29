import { AppNav } from "@/app/components/AppNav";
import { THEORY_TOPICS } from "@/lib/library";

export default function Teori() {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-6">
          <h1 className="text-4xl font-black">Gitar Teorisi</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Pratikte hemen karsiligi olan temel teori konulari.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {THEORY_TOPICS.map(([title, body]) => (
            <article key={title} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}