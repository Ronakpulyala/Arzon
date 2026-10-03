"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export function ReportBarChart({
  title,
  description,
  data,
  color = "#16213E",
  valueType = "number"
}: {
  title: string;
  description?: string;
  data: Array<{ label: string; value: number }>;
  color?: string;
  /** Plain string (not a function) so this can be rendered from a Server Component. */
  valueType?: "number" | "currency";
}) {
  const isEmpty = data.every((d) => d.value === 0);
  const tickFormat = (v: number) => (valueType === "currency" ? `₹${compact.format(v)}` : compact.format(v));
  const tooltipFormat = (v: number) => (valueType === "currency" ? currency.format(v) : String(v));

  return (
    <div className="rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
      <h2 className="font-display text-sm font-semibold text-ink-900">{title}</h2>
      {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}

      <div className="relative mt-4 h-56">
        {isEmpty && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-xs text-ink-500">
            No data for this period yet.
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={{ stroke: "#EEF0F4" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={tickFormat}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(232,150,60,0.08)" }}
              formatter={(value) => tooltipFormat(Number(value))}
              contentStyle={{ borderRadius: 6, borderColor: "#EEF0F4", fontSize: 12 }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
