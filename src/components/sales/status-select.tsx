"use client";

import { useState } from "react";
import type { SalesStatus } from "@prisma/client";
import { clsx } from "clsx";
import { updateSalesStatus } from "@/app/(dashboard)/sales-reports/actions";
import { SALES_STATUS_LABELS, SALES_STATUS_STYLES } from "@/lib/sales";

export function StatusSelect({ reportId, status }: { reportId: string; status: SalesStatus }) {
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);
  const options = Object.keys(SALES_STATUS_LABELS) as SalesStatus[];

  async function change(next: SalesStatus) {
    const previous = value;
    setValue(next); // optimistic
    setPending(true);
    try {
      await updateSalesStatus(reportId, next);
    } catch {
      setValue(previous); // roll back if the server rejected it
    } finally {
      setPending(false);
    }
  }

  return (
    <select
      value={value}
      disabled={pending}
      aria-label="Deal stage"
      onChange={(e) => change(e.target.value as SalesStatus)}
      className={clsx(
        "cursor-pointer rounded-sm border-0 px-2 py-1 text-xs font-medium outline-none transition-opacity",
        SALES_STATUS_STYLES[value],
        pending && "opacity-50"
      )}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-white text-ink-900">
          {SALES_STATUS_LABELS[opt]}
        </option>
      ))}
    </select>
  );
}
