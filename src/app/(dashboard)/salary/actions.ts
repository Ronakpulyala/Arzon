"use server";

import { revalidatePath } from "next/cache";
import { auth, canReview } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { commissionEarned, netPay } from "@/lib/salary";
import { todayDateOnly } from "@/lib/attendance";
import type { ActionState } from "@/lib/use-form-action";

function refresh() {
  revalidatePath("/salary");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

async function assertCanRunPayroll() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (!canReview(session.user.role)) throw new Error("Not authorized to run payroll.");
  return session;
}

/**
 * Runs (or re-runs) this month's payroll for one employee: base salary +
 * commission on deals they've closed-won so far this month. Re-running
 * before month end recalculates the commission as new deals close.
 */
export async function runPayroll(userId: string): Promise<ActionState> {
  await assertCanRunPayroll();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Employee not found." };

  const today = todayDateOnly();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0));

  const reports = await prisma.salesReport.findMany({ where: { userId } });
  const commission = commissionEarned(reports, user.commissionRate, monthStart, monthEnd);
  const basic = user.baseSalary;
  const total = netPay(basic, 0, commission, 0);

  await prisma.salary.upsert({
    where: { userId_month_year: { userId, month: month + 1, year } },
    update: { basic, bonus: commission, netPay: total, paidOn: new Date() },
    create: {
      userId,
      month: month + 1,
      year,
      basic,
      bonus: commission,
      deductions: 0,
      allowances: 0,
      netPay: total,
      paidOn: new Date()
    }
  });

  refresh();
  return { success: true };
}

export async function updateCompensation(formData: FormData): Promise<ActionState> {
  await assertCanRunPayroll();

  const userId = formData.get("userId") as string;
  const baseSalary = Number(formData.get("baseSalary"));
  const commissionPct = Number(formData.get("commissionPct"));

  if (!userId) return { error: "Missing employee." };
  if (!Number.isFinite(baseSalary) || baseSalary < 0) return { error: "Base salary must be 0 or more." };
  if (!Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100) {
    return { error: "Commission % must be between 0 and 100." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { baseSalary, commissionRate: commissionPct / 100 }
  });

  refresh();
  revalidatePath("/employees");
  return { success: true };
}
