import { clsx } from "clsx";
import type { LeaveStatus } from "@prisma/client";
import { LEAVE_STATUS_STYLES } from "@/lib/leaves";

export function LeaveBadge({ status }: { status: LeaveStatus }) {
  const style = LEAVE_STATUS_STYLES[status];
  return (
    <span
      className={clsx("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium", style.badge)}
    >
      {style.label}
    </span>
  );
}
