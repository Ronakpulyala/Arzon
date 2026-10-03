import { redirect } from "next/navigation";
import { auth, canReview, isAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import type { NavBadgeKey } from "@/lib/nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id } = session.user;
  const reviewer = canReview(role);
  const admin = isAdmin(role);

  const [pendingLeaves, pendingPayments] = await Promise.all([
    reviewer
      ? prisma.leave.count({ where: { status: "PENDING" } })
      : prisma.leave.count({ where: { userId: id, status: "PENDING" } }),
    admin ? prisma.salesPayment.count({ where: { status: "PENDING" } }) : Promise.resolve(0)
  ]);

  const badges: Partial<Record<NavBadgeKey, number>> = {
    pendingLeaves,
    pendingPayments
  };

  return (
    <Providers>
      <AppShell role={role} name={session.user.name ?? "Team member"} badges={badges}>
        {children}
      </AppShell>
    </Providers>
  );
}
