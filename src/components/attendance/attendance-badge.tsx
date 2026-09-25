import type { AttendanceStatus } from "@prisma/client";
import { STATUS_STYLES } from "@/lib/attendance";
import { clsx } from "clsx";

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        style.badge
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
