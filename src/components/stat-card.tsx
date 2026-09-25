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
  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-navy-900/5 text-navy-800">
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
