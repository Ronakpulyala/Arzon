"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { signOut } from "next-auth/react";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Topbar({
  name,
  role
}: {
  name: string;
  role: string;
}) {
  const now = useClock();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-ink-100 bg-surface-card px-6">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-sm font-medium text-ink-900">
          {now
            ? now.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric"
              })
            : ""}
        </p>
        <p className="text-xs text-ink-500 tabular-nums">
          {now ? now.toLocaleTimeString(undefined, { hour12: true }) : "--:--:--"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Bell size={17} strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-3 border-l border-ink-100 pl-4">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-ink-900">{name}</p>
            <p className="text-[11px] capitalize text-ink-500">{role.toLowerCase()}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-xs font-medium text-white">
            {initials}
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-ink-500 hover:text-danger transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
