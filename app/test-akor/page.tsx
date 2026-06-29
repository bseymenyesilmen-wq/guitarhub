import Link from "next/link";

export default function TestAkor() {
  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <section className="mx-auto max-w-2xl rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
          Test sayfası
        </p>
        <h1 className="mt-3 text-3xl font-black">Akor testi devre dışı</h1>
        <p className="mt-3 text-zinc-300">
          Bu sayfa production build’i bozduğu için görsel akor paketi yerine güvenli bir yer tutucuya çevrildi.
          Akor arama ve repertuar özellikleri ana uygulamada çalışmaya devam eder.
        </p>
        <Link href="/" className="mt-5 inline-block rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-500">
          Ana sayfaya dön
        </Link>
      </section>
    </main>
  );
}
