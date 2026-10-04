"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { approvePayment, rejectPayment } from "@/app/(dashboard)/sales-reports/actions";
import { formatDate } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_TAGS, formatCurrency } from "@/lib/sales";
import type { PaymentMethod, PaymentType } from "@prisma/client";

export type PendingPaymentRow = {
  id: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  paidOn: Date;
  reference: string | null;
  clientName: string;
  courseOrPlan: string;
  employeeName: string;
};

export function PendingPaymentsQueue({ payments }: { payments: PendingPaymentRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, fn: (id: string) => Promise<void>) {
    setBusy(id);
    try {
      await fn(id);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-100/30">
      <div className="flex items-center justify-between border-b border-amber-500/20 px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink-900">Payments awaiting approval</h2>
          <p className="mt-0.5 text-xs text-ink-500">Only approved payments count toward collected totals.</p>
        </div>
        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-medium text-navy-900">
          {payments.length}
        </span>
      </div>

      {payments.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">Nothing waiting on you — all caught up.</p>
      ) : (
        <ul className="divide-y divide-amber-500/20">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm text-ink-900">
                  <span className="font-medium">{p.employeeName}</span>
                  <span className="text-ink-500"> logged {formatCurrency(p.amount)} for </span>
                  {p.clientName}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {PAYMENT_TYPE_TAGS[p.type]} &middot; {p.courseOrPlan} &middot;{" "}
                  {PAYMENT_METHOD_LABELS[p.method]} &middot; {formatDate(p.paidOn, { year: "numeric" })}
                  {p.reference && ` · ${p.reference}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => act(p.id, approvePayment)}
                  className="flex h-8 items-center gap-1 rounded-md bg-success/10 px-2.5 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                >
                  <Check size={14} strokeWidth={2} />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => act(p.id, rejectPayment)}
                  className="flex h-8 items-center gap-1 rounded-md bg-danger/10 px-2.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
                >
                  <X size={14} strokeWidth={2} />
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
