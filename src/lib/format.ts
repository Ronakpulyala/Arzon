/** Business timezone used for "today", late cut-offs and clock times. */
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? "Asia/Kolkata";

/**
 * Format a date-only value (Prisma @db.Date comes back as UTC midnight).
 * Explicit locale + UTC avoid server/client hydration mismatches and off-by-one days.
 */
export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(d).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    ...opts
  });
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  return s === e ? s : `${s} – ${e}`;
}

/** Format a real timestamp (check-in / check-out) in the business timezone. */
export function formatTime(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-IN", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

/** yyyy-mm-dd for a date-only value. */
export function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}
