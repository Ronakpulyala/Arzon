import { clsx } from "clsx";
import type { SalesStatus } from "@prisma/client";
import { SALES_STATUS_LABELS, SALES_STATUS_STYLES } from "@/lib/sales";

export function SalesBadge({ status }: { status: SalesStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        SALES_STATUS_STYLES[status]
      )}
    >
      {SALES_STATUS_LABELS[status]}
    </span>
  );
}
