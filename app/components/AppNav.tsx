"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: "⌂" },
  { href: "/repertuar", label: "Repertuvar", icon: "♪" },
  { href: "/sarki-ara", label: "Şarkı Ara", mobileLabel: "Ara", icon: "⌕" },
  { href: "/sarki-yaz", label: "Şarkı Yaz", mobileLabel: "Yaz", icon: "✎" },
  { href: "/akor-kutuphanesi", label: "Akorlar", icon: "♬" },
  { href: "/gam-kutuphanesi", label: "Gamlar", icon: "◎" },
  { href: "/tuner", label: "Tuner", icon: "♩" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/giris");
  }

  return (
    <>
      <nav className="mb-8 hidden flex-wrap items-center gap-2 rounded-[1.75rem] border border-white/10 bg-zinc-950/70 p-2 shadow-xl shadow-black/20 backdrop-blur-xl md:flex">
        <Link href="/" className="mr-2 rounded-2xl bg-gradient-to-br from-red-600/25 to-zinc-900 px-4 py-2 text-xl font-black tracking-tight text-white ring-1 ring-red-500/20">
          GuitarHub
        </Link>

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
                active
                  ? "bg-red-600 text-white shadow-lg shadow-red-950/40"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={signOut}
          className="ml-auto rounded-2xl bg-white/5 px-3 py-2 text-sm font-black text-zinc-300 transition hover:bg-red-700 hover:text-white"
        >
          Çıkış
        </button>
      </nav>

      <div className="mb-6 flex min-w-0 items-center justify-between rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-2 pl-4 shadow-lg shadow-black/20 backdrop-blur-xl md:hidden">
        <Link href="/" className="text-xl font-black tracking-tight text-white">
          GuitarHub
        </Link>
        <button onClick={signOut} className="min-h-11 rounded-full bg-white/5 px-4 text-sm font-bold text-zinc-300 hover:bg-red-700">
          Çıkış
        </button>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/70 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 shadow-2xl shadow-black backdrop-blur-2xl md:hidden">
        <div className="mx-auto max-w-[calc(100vw-1rem)] overflow-x-auto overscroll-x-contain rounded-[1.4rem] border border-white/10 bg-zinc-950/70 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-14 w-[4.35rem] shrink-0 flex-col items-center justify-center rounded-2xl text-[10px] font-black transition ${
                    active ? "scale-[1.02] bg-red-600 text-white shadow-lg shadow-red-950/50" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="mt-1 max-w-full truncate px-1">{item.mobileLabel ?? item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
