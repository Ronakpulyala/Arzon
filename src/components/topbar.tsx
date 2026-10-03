"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}

export function Topbar({
  name,
  role,
  onMenuClick
}: {
  name: string;
  role: string;
  onMenuClick: () => void;
}) {
  const now = useClock();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-ink-100 bg-surface-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 md:hidden"
        >
          <Menu size={19} />
        </button>
        <div className="flex items-baseline gap-3">
          <p className="hidden font-display text-sm font-medium text-ink-900 sm:block">
            {now
              ? now.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })
              : ""}
          </p>
          <p className="text-xs tabular-nums text-ink-500">
            {now ? now.toLocaleTimeString("en-IN", { hour12: true }) : "--:--:--"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100"
        >
          <Bell size={17} strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-3 border-l border-ink-100 pl-3 sm:pl-4">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-medium text-ink-900">{name}</p>
            <p className="text-[11px] capitalize text-ink-500">{role.toLowerCase()}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-xs font-medium text-white">
            {initials}
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-ink-500 transition-colors hover:text-danger"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
