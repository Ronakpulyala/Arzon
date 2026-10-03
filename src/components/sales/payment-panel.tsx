"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, PlusCircle, Trash2 } from "lucide-react";
import { addPayment, deletePayment } from "@/app/(dashboard)/sales-reports/actions";
import { useFormAction } from "@/lib/use-form-action";
import { formatDate } from "@/lib/format";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_STYLES,
  formatCurrency,
  outstanding,
  pendingApprovalAmount,
  totalCollected,
  type SalesReportWithPayments
} from "@/lib/sales";
import type { PaymentMethod } from "@prisma/client";
import { clsx } from "clsx";

const input =
  "mt-1 rounded-md border border-ink-100 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:border-amber-500";

export function PaymentPanel({ report }: { report: SalesReportWithPayments }) {
  const { state, isPending, onSubmit } = useFormAction(addPayment);
  const [removing, setRemoving] = useState<string | null>(null);
  const methods = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

  const collected = totalCollected(report);
  const pending = pendingApprovalAmount(report);
  const claimed = report.payments
    .filter((p) => p.status !== "REJECTED")
    .reduce((s, p) => s + p.amount, 0);
  const pct = report.dealValue > 0 ? Math.min((collected / report.dealValue) * 100, 100) : 0;
  const canLog = report.status !== "CLOSED_LOST" && claimed < report.dealValue;

  async function remove(id: string) {
    setRemoving(id);
    try {
      await deletePayment(id);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="border-t border-ink-100 bg-ink-100/30 px-5 py-4">
      <div className="mb-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          <span className="text-ink-500">
            Collected <span className="font-medium text-success">{formatCurrency(collected)}</span> of{" "}
            {formatCurrency(report.dealValue)}
          </span>
          <span className="flex items-center gap-3">
            {pending > 0 && (
              <span className="flex items-center gap-1 text-warn">
                <Clock3 size={11} />
                {formatCurrency(pending)} awaiting approval
              </span>
            )}
            {report.status === "CLOSED_WON" && outstanding(report) > 0 && (
              <span className="text-ink-500">{formatCurrency(outstanding(report))} due</span>
            )}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {report.payments.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {[...report.payments]
            .sort((a, b) => +new Date(b.paidOn) - +new Date(a.paidOn))
            .map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-xs text-ink-700">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={clsx(
                      "shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium",
                      PAYMENT_STATUS_STYLES[p.status].badge
                    )}
                  >
                    {PAYMENT_STATUS_STYLES[p.status].label}
                  </span>
                  <span className="min-w-0 truncate">
                    {formatDate(p.paidOn, { year: "numeric" })} &middot; {PAYMENT_METHOD_LABELS[p.method]}
                    {p.reference && <span className="text-ink-500"> &middot; {p.reference}</span>}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={clsx(
                      "font-medium",
                      p.status === "REJECTED" ? "text-ink-300 line-through" : "text-ink-900"
                    )}
                  >
                    {formatCurrency(p.amount)}
                  </span>
                  {p.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      disabled={removing === p.id}
                      aria-label="Withdraw payment"
                      title="Withdraw this pending payment"
                      className="text-ink-300 transition-colors hover:text-danger disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </span>
              </li>
            ))}
        </ul>
      )}

      {canLog ? (
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="salesReportId" value={report.id} />
          <div>
            <label className="block text-[11px] text-ink-500">Amount (₹)</label>
            <input name="amount" type="number" min="1" step="1" required className={`${input} w-28`} />
          </div>
          <div>
            <label className="block text-[11px] text-ink-500">Date</label>
            <input name="paidOn" type="date" required className={input} />
          </div>
          <div>
            <label className="block text-[11px] text-ink-500">Method</label>
            <select name="method" defaultValue="BANK_TRANSFER" className={input}>
              {methods.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px] flex-1">
            <label className="block text-[11px] text-ink-500">Reference (optional)</label>
            <input name="reference" placeholder="UTR / receipt no." className={`${input} w-full`} />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy-800 active:scale-[0.98] disabled:opacity-60"
          >
            <PlusCircle size={13} strokeWidth={2} />
            {isPending ? "Submitting..." : "Submit payment"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-ink-500">
          {report.status === "CLOSED_LOST"
            ? "This deal is marked as lost — no payments can be logged."
            : "Fully claimed — nothing left to log."}
        </p>
      )}

      {canLog && (
        <p className="mt-2 text-[11px] text-ink-500">
          New payments need Admin approval before they count as collected.
        </p>
      )}

      {state.error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 size={12} strokeWidth={2} />
          Submitted — waiting on Admin approval.
        </p>
      )}
    </div>
  );
}
