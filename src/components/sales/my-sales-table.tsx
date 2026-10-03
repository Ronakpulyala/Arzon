"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock3 } from "lucide-react";
import { StatusSelect } from "@/components/sales/status-select";
import { PaymentPanel } from "@/components/sales/payment-panel";
import { formatDate } from "@/lib/format";
import { formatCurrency, outstanding, totalCollected, type SalesReportWithPayments } from "@/lib/sales";

export function MySalesTable({ reports }: { reports: SalesReportWithPayments[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink-900">Your sales reports</h2>
        <p className="text-xs text-ink-500">Click a deal to log or review payments</p>
      </div>

      {reports.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">No sales reports yet — add your first deal.</p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {reports.map((report) => {
            const isOpen = expanded === report.id;
            const due = outstanding(report);
            const collected = totalCollected(report);
            const pendingCount = report.payments.filter((p) => p.status === "PENDING").length;

            return (
              <li key={report.id}>
                <div className="flex w-full items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ink-100/40">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : report.id)}
                    aria-expanded={isOpen}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown size={15} className="shrink-0 text-ink-500" />
                    ) : (
                      <ChevronRight size={15} className="shrink-0 text-ink-500" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {report.clientName}
                        <span className="ml-2 text-xs font-normal text-ink-500">{report.courseOrPlan}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatDate(report.reportDate, { year: "numeric" })}
                        {report.payments.length > 0 && ` · ${report.payments.length} payment(s)`}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-ink-900">{formatCurrency(report.dealValue)}</p>
                      <p className={`text-[11px] ${due > 0 ? "text-warn" : "text-ink-500"}`}>
                        {report.status === "CLOSED_LOST"
                          ? "Lost"
                          : due > 0
                            ? `${formatCurrency(due)} due`
                            : collected >= report.dealValue
                              ? "Fully collected"
                              : `${formatCurrency(collected)} collected`}
                      </p>
                    </div>
                  </button>

                  {pendingCount > 0 && (
                    <span
                      title={`${pendingCount} payment(s) awaiting Admin approval`}
                      className="flex shrink-0 items-center gap-1 rounded-sm bg-warn/10 px-1.5 py-0.5 text-[10px] font-medium text-warn"
                    >
                      <Clock3 size={10} />
                      {pendingCount}
                    </span>
                  )}

                  <div className="shrink-0">
                    <StatusSelect reportId={report.id} status={report.status} />
                  </div>
                </div>

                {isOpen && <PaymentPanel report={report} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
