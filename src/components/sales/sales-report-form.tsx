"use client";

import { PlusCircle, CheckCircle2 } from "lucide-react";
import { addSalesReport } from "@/app/(dashboard)/sales-reports/actions";
import { useFormAction } from "@/lib/use-form-action";
import { SALES_STATUS_LABELS } from "@/lib/sales";
import type { SalesStatus } from "@prisma/client";

const field =
  "mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus-visible:border-amber-500";

export function SalesReportForm() {
  const { state, isPending, onSubmit } = useFormAction(addSalesReport);
  const statuses = Object.keys(SALES_STATUS_LABELS) as SalesStatus[];

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
      <h2 className="font-display text-sm font-semibold text-ink-900">Add sales report</h2>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="clientName" className="block text-xs font-medium text-ink-700">
            Client / student name
          </label>
          <input id="clientName" name="clientName" required placeholder="e.g. Priya Sharma" className={field} />
        </div>

        <div>
          <label htmlFor="courseOrPlan" className="block text-xs font-medium text-ink-700">
            Course / plan
          </label>
          <input
            id="courseOrPlan"
            name="courseOrPlan"
            required
            placeholder="e.g. Full Stack Bootcamp — Annual"
            className={field}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dealValue" className="block text-xs font-medium text-ink-700">
              Deal value (₹)
            </label>
            <input
              id="dealValue"
              name="dealValue"
              type="number"
              min="1"
              step="1"
              required
              placeholder="45000"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="reportDate" className="block text-xs font-medium text-ink-700">
              Date
            </label>
            <input id="reportDate" name="reportDate" type="date" required className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-xs font-medium text-ink-700">
            Stage
          </label>
          <select id="status" name="status" required defaultValue="LEAD" className={field}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {SALES_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="remarks" className="block text-xs font-medium text-ink-700">
            Remarks (optional)
          </label>
          <textarea
            id="remarks"
            name="remarks"
            rows={2}
            placeholder="Any context worth noting"
            className={`${field} resize-none`}
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 size={13} strokeWidth={2} />
          Report added.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
      >
        <PlusCircle size={16} strokeWidth={1.8} />
        {isPending ? "Saving..." : "Add report"}
      </button>
    </form>
  );
}
