import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "warn";
}) {
  const iconTone = {
    neutral: "bg-navy-900/5 text-navy-800 group-hover:bg-navy-900/10",
    positive: "bg-success/10 text-success group-hover:bg-success/15",
    warn: "bg-warn/10 text-warn group-hover:bg-warn/15"
  }[tone];

  return (
    <div className="group rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <div
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-sm transition-colors duration-200",
            iconTone
          )}
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{value}</p>
      {sub && (
        <p
          className={clsx(
            "mt-1 text-xs",
            tone === "positive" && "text-success",
            tone === "warn" && "text-warn",
            tone === "neutral" && "text-ink-500"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
