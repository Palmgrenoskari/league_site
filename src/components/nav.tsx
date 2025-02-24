"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sword } from "lucide-react";

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Sword className="h-7 w-7 text-blue-400" />
          <span className="hidden font-bold text-lg sm:inline-block text-blue-100">
            LoL Analytics
          </span>
        </Link>
        <nav className="flex items-center space-x-2">
          <Link
            href="/"
            className={`px-4 py-2 text-base font-medium transition-colors hover:text-blue-400 ${
              pathname === "/" ? "text-blue-400" : "text-slate-400"
            }`}
          >
            Home
          </Link>
          <Link
            href="/leaderboards"
            className={`px-4 py-2 text-base font-medium transition-colors hover:text-blue-400 ${
              pathname === "/leaderboards" ? "text-blue-400" : "text-slate-400"
            }`}
          >
            Leaderboards
          </Link>
          <Link
            href="/tier-list"
            className={`px-4 py-2 text-base font-medium transition-colors hover:text-blue-400 ${
              pathname === "/tier-list" ? "text-blue-400" : "text-slate-400"
            }`}
          >
            Tier List
          </Link>
          <Link
            href="/champions"
            className={`px-4 py-2 text-base font-medium transition-colors hover:text-blue-400 ${
              pathname === "/champions" ? "text-blue-400" : "text-slate-400"
            }`}
          >
            Champions
          </Link>
        </nav>
      </div>
    </header>
  );
}
