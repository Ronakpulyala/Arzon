"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import type { NavBadgeKey } from "@/lib/nav";

export function AppShell({
  role,
  name,
  badges,
  children
}: {
  role: "ADMIN" | "HR" | "EMPLOYEE";
  name: string;
  badges: Partial<Record<NavBadgeKey, number>>;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-page">
      <Sidebar role={role} badges={badges} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="md:pl-64">
        <Topbar name={name} role={role} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-enter px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
