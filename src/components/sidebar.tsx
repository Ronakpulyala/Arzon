"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clsx } from "clsx";
import { GraduationCap, X } from "lucide-react";
import { navItems, type NavBadgeKey } from "@/lib/nav";

type Role = "ADMIN" | "HR" | "EMPLOYEE";
type Badges = Partial<Record<NavBadgeKey, number>>;

function Brand({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-navy-700/60 px-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-500 transition-transform duration-200 hover:scale-105">
        <GraduationCap className="text-navy-900" size={18} />
      </div>
      <div className="flex-1 leading-tight">
        <p className="font-display text-sm font-semibold tracking-tight text-white">Arzon Global</p>
        <p className="text-[11px] text-navy-300/70">Admin Console</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-md p-1 text-navy-300 transition-colors hover:bg-navy-800 hover:text-white"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

function NavList({
  role,
  badges,
  onNavigate
}: {
  role: Role;
  badges: Badges;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-0.5 px-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          const badgeCount = item.badgeKey ? badges[item.badgeKey] ?? 0 : 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                  "transition-all duration-150 ease-out",
                  active
                    ? "bg-navy-800 text-white"
                    : "text-navy-300 hover:translate-x-0.5 hover:bg-navy-800/70 hover:text-white"
                )}
              >
                <span
                  className={clsx(
                    "absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-amber-500 transition-opacity duration-150",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  )}
                />
                <Icon
                  size={17}
                  strokeWidth={1.8}
                  className={clsx(
                    "shrink-0 transition-colors duration-150",
                    active ? "text-amber-500" : "text-navy-300 group-hover:text-amber-400"
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-navy-900">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <div className="shrink-0 border-t border-navy-700/60 px-6 py-4">
      <p className="text-[11px] text-navy-300/60">Arzon Global &middot; Edtech &amp; Sales Ops</p>
    </div>
  );
}

export function Sidebar({
  role,
  badges,
  mobileOpen,
  onClose
}: {
  role: Role;
  badges: Badges;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  // Close the drawer with Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Desktop — always visible from md breakpoint up, every section listed, nothing collapsed */}
      <aside className="hidden bg-navy-900 md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <Brand />
        <NavList role={role} badges={badges} />
        <Footer />
      </aside>

      {/* Mobile drawer */}
      <div className={clsx("fixed inset-0 z-40 md:hidden", mobileOpen ? "visible" : "invisible")}>
        <div
          onClick={onClose}
          aria-hidden="true"
          className={clsx(
            "absolute inset-0 bg-navy-950/50 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={clsx(
            "absolute inset-y-0 left-0 flex w-64 flex-col bg-navy-900 shadow-xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Brand onClose={onClose} />
          <NavList role={role} badges={badges} onNavigate={onClose} />
          <Footer />
        </aside>
      </div>
    </>
  );
}
