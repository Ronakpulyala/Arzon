"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { navItems } from "@/lib/nav";
import { GraduationCap } from "lucide-react";

export function Sidebar({ role }: { role: "ADMIN" | "HR" | "EMPLOYEE" }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-navy-900">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-navy-700/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-500">
          <GraduationCap className="h-4.5 w-4.5 text-navy-900" size={18} />
        </div>
        <div className="leading-tight">
          <p className="font-display font-semibold text-white text-sm tracking-tight">
            Arzon Global
          </p>
          <p className="text-[11px] text-navy-300/70">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-navy-800 text-white"
                      : "text-navy-300 hover:bg-navy-800/60 hover:text-white"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-amber-500 transition-opacity",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-navy-700/60">
        <p className="text-[11px] text-navy-300/60">
          Arzon Global &middot; Edtech &amp; Sales Ops
        </p>
      </div>
    </aside>
  );
}
