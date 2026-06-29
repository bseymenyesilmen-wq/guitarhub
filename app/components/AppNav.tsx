"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: "⌂" },
  { href: "/repertuar", label: "Repertuar", icon: "♪" },
  { href: "/sarki-ara", label: "Şarkı Ara", icon: "⌕" },
  { href: "/akor-kutuphanesi", label: "Akorlar", icon: "♬" },
  { href: "/gam-kutuphanesi", label: "Gamlar", icon: "◎" },
  { href: "/teori", label: "Eğitim", icon: "✦" },
  { href: "/pratik", label: "Pratik", icon: "✓" },
];

const MOBILE_ITEMS = NAV_ITEMS.filter((item) => ["/", "/repertuar", "/sarki-ara", "/pratik", "/teori"].includes(item.href));

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/giris");
  }

  return (
    <>
      <nav className="mb-8 hidden flex-wrap items-center gap-2 border-b border-zinc-800 pb-4 md:flex">
        <Link href="/" className="mr-2 text-xl font-black tracking-tight text-white">
          GuitarHub
        </Link>

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={signOut}
          className="ml-auto rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-red-700 hover:text-white"
        >
          Çıkış
        </button>
      </nav>

      <div className="mb-6 flex items-center justify-between md:hidden">
        <Link href="/" className="text-xl font-black tracking-tight text-white">
          GuitarHub
        </Link>
        <button onClick={signOut} className="min-h-11 rounded-full bg-zinc-900 px-4 text-sm font-bold text-zinc-300 hover:bg-red-700">
          Çıkış
        </button>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {MOBILE_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-[11px] font-bold ${
                  active ? "bg-red-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="mt-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
