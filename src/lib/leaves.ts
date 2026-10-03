import type { Leave, LeaveStatus, LeaveType } from "@prisma/client";

/** Annual allotment per leave type, in days. UNPAID has no cap. */
export const LEAVE_ALLOTMENTS: Record<LeaveType, number | null> = {
  SICK: 12,
  CASUAL: 12,
  EARNED: 15,
  UNPAID: null
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  SICK: "Sick leave",
  CASUAL: "Casual leave",
  EARNED: "Earned leave",
  UNPAID: "Unpaid leave"
};

export const LEAVE_STATUS_STYLES: Record<LeaveStatus, { label: string; badge: string }> = {
  PENDING: { label: "Pending", badge: "bg-warn/10 text-warn" },
  APPROVED: { label: "Approved", badge: "bg-success/10 text-success" },
  REJECTED: { label: "Rejected", badge: "bg-danger/10 text-danger" },
  CANCELLED: { label: "Cancelled", badge: "bg-ink-100 text-ink-500" }
};

const DAY_MS = 86_400_000;

/** Inclusive day count between two date-only (UTC midnight) values. */
export function leaveDayCount(start: Date | string, end: Date | string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / DAY_MS) + 1;
}

/** Days used per type for leaves starting in `year`, counting only the given statuses. */
export function usedDaysByType(
  leaves: Leave[],
  year: number,
  statuses: LeaveStatus[] = ["APPROVED"]
): Record<LeaveType, number> {
  const used: Record<LeaveType, number> = { SICK: 0, CASUAL: 0, EARNED: 0, UNPAID: 0 };
  for (const leave of leaves) {
    if (!statuses.includes(leave.status)) continue;
    if (new Date(leave.startDate).getUTCFullYear() !== year) continue;
    used[leave.type] += leaveDayCount(leave.startDate, leave.endDate);
  }
  return used;
}

/** Count of leave requests per type that overlap [start, end] (any status but cancelled). */
export function countByType(leaves: Leave[], start: Date, end: Date): Record<LeaveType, number> {
  const counts: Record<LeaveType, number> = { SICK: 0, CASUAL: 0, EARNED: 0, UNPAID: 0 };
  for (const l of leaves) {
    if (l.status === "CANCELLED") continue;
    if (new Date(l.startDate) <= end && new Date(l.endDate) >= start) counts[l.type]++;
  }
  return counts;
}
