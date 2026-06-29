"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/", label: "Panel" },
  { href: "/repertuar", label: "Repertuar" },
  { href: "/sarki-ara", label: "Sarki Ara" },
  { href: "/akor-kutuphanesi", label: "Akorlar" },
  { href: "/gam-kutuphanesi", label: "Gamlar" },
  { href: "/teori", label: "Teori" },
  { href: "/pratik", label: "Pratik" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
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
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/giris");
        }}
        className="ml-auto rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-red-700 hover:text-white"
      >
        Cikis
      </button>
    </nav>
  );
}
