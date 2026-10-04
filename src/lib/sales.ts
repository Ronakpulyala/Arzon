import type {
  SalesReport,
  SalesPayment,
  SalesStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType
} from "@prisma/client";

export { formatCurrency } from "@/lib/format";

export const SALES_STATUS_LABELS: Record<SalesStatus, string> = {
  LEAD: "Lead",
  IN_PROGRESS: "In progress",
  CLOSED_WON: "Closed won",
  CLOSED_LOST: "Closed lost"
};

export const SALES_STATUS_STYLES: Record<SalesStatus, string> = {
  LEAD: "bg-navy-900/10 text-navy-800",
  IN_PROGRESS: "bg-warn/10 text-warn",
  CLOSED_WON: "bg-success/10 text-success",
  CLOSED_LOST: "bg-danger/10 text-danger"
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank transfer",
  UPI: "UPI",
  CARD: "Card",
  OTHER: "Other"
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  ADVANCE: "Pre-payment (advance)",
  FINAL: "Post-payment (final)",
  FULL: "Full payment"
};

export const PAYMENT_TYPE_TAGS: Record<PaymentType, string> = {
  ADVANCE: "Pre-payment",
  FINAL: "Post-payment",
  FULL: "Full"
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, { label: string; badge: string }> = {
  PENDING: { label: "Pending approval", badge: "bg-warn/10 text-warn" },
  APPROVED: { label: "Approved", badge: "bg-success/10 text-success" },
  REJECTED: { label: "Rejected", badge: "bg-danger/10 text-danger" }
};

export type SalesReportWithPayments = SalesReport & { payments: SalesPayment[] };

/** Only admin-approved payments count as actually collected. */
export function totalCollected(report: SalesReportWithPayments): number {
  return report.payments.filter((p) => p.status === "APPROVED").reduce((sum, p) => sum + p.amount, 0);
}

export function pendingApprovalAmount(report: SalesReportWithPayments): number {
  return report.payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);
}

/** What's still owed on a deal. Lost deals owe nothing; leads/in-progress aren't yet receivable. */
export function outstanding(report: SalesReportWithPayments): number {
  if (report.status !== "CLOSED_WON") return 0;
  return Math.max(report.dealValue - totalCollected(report), 0);
}

function inMonth(d: Date | string, year: number, month: number) {
  const x = new Date(d);
  return x.getUTCFullYear() === year && x.getUTCMonth() === month;
}

export function closedWonInMonth(reports: SalesReport[], year: number, month: number): number {
  return reports
    .filter((r) => r.status === "CLOSED_WON" && inMonth(r.reportDate, year, month))
    .reduce((sum, r) => sum + r.dealValue, 0);
}

/** Approved payments received within the given month. */
export function collectedInMonth(payments: SalesPayment[], year: number, month: number): number {
  return payments
    .filter((p) => p.status === "APPROVED" && inMonth(p.paidOn, year, month))
    .reduce((s, p) => s + p.amount, 0);
}

function lastMonthsBuckets(months: number) {
  const now = new Date();
  const buckets: Array<{ label: string; value: number; year: number; month: number }> = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.push({
      label: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      value: 0,
      year: d.getUTCFullYear(),
      month: d.getUTCMonth()
    });
  }
  return buckets;
}

/** Monthly CLOSED_WON deal value for the last `months` months, oldest first. */
export function monthlyClosedRevenue(reports: SalesReport[], months = 6) {
  const buckets = lastMonthsBuckets(months);
  for (const r of reports) {
    if (r.status !== "CLOSED_WON") continue;
    const d = new Date(r.reportDate);
    const b = buckets.find((x) => x.year === d.getUTCFullYear() && x.month === d.getUTCMonth());
    if (b) b.value += r.dealValue;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

/** Monthly APPROVED payments for the last `months` months, oldest first. */
export function monthlyCollections(payments: SalesPayment[], months = 6) {
  const buckets = lastMonthsBuckets(months);
  for (const p of payments) {
    if (p.status !== "APPROVED") continue;
    const d = new Date(p.paidOn);
    const b = buckets.find((x) => x.year === d.getUTCFullYear() && x.month === d.getUTCMonth());
    if (b) b.value += p.amount;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}
