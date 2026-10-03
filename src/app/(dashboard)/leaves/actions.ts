"use server";

import { revalidatePath } from "next/cache";
import { auth, canReview } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LEAVE_ALLOTMENTS, LEAVE_TYPE_LABELS, leaveDayCount, usedDaysByType } from "@/lib/leaves";
import type { ActionState } from "@/lib/use-form-action";
import type { LeaveType } from "@prisma/client";

function refresh() {
  revalidatePath("/leaves");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function applyLeave(formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const type = formData.get("type") as LeaveType;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const reason = (formData.get("reason") as string)?.trim();

  if (!type || !startDate || !endDate || !reason) return { error: "All fields are required." };
  if (!(type in LEAVE_TYPE_LABELS)) return { error: "Choose a valid leave type." };

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Enter valid dates." };
  }
  if (end < start) return { error: "End date can't be before the start date." };

  const existing = await prisma.leave.findMany({
    where: { userId: session.user.id, status: { in: ["PENDING", "APPROVED"] } }
  });

  // Block overlapping requests.
  const overlap = existing.find((l) => start <= l.endDate && end >= l.startDate);
  if (overlap) {
    return { error: "You already have a pending or approved leave that overlaps these dates." };
  }

  // Block requests that exceed the remaining balance (counting pending ones too).
  const allotment = LEAVE_ALLOTMENTS[type];
  if (allotment !== null) {
    const used = usedDaysByType(existing, start.getUTCFullYear(), ["PENDING", "APPROVED"])[type];
    const requested = leaveDayCount(start, end);
    if (used + requested > allotment) {
      return {
        error: `Only ${Math.max(allotment - used, 0)} day(s) of ${LEAVE_TYPE_LABELS[type].toLowerCase()} left this year; you asked for ${requested}.`
      };
    }
  }

  await prisma.leave.create({
    data: { userId: session.user.id, type, startDate: start, endDate: end, reason }
  });

  refresh();
  return { success: true };
}

export async function cancelLeave(leaveId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
  if (!leave) throw new Error("Leave request not found.");
  if (leave.userId !== session.user.id) throw new Error("Not your request.");
  if (leave.status !== "PENDING") throw new Error("Only pending requests can be cancelled.");

  await prisma.leave.update({ where: { id: leaveId }, data: { status: "CANCELLED" } });
  refresh();
}

async function assertCanReview() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (!canReview(session.user.role)) throw new Error("Not authorized to review leave requests.");
  return session;
}

async function review(leaveId: string, status: "APPROVED" | "REJECTED") {
  const session = await assertCanReview();
  const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
  if (!leave || leave.status !== "PENDING") return; // already handled or withdrawn

  await prisma.leave.update({
    where: { id: leaveId },
    data: { status, reviewedBy: session.user.id }
  });
  refresh();
}

export async function approveLeave(leaveId: string) {
  await review(leaveId, "APPROVED");
}

export async function rejectLeave(leaveId: string) {
  await review(leaveId, "REJECTED");
}
