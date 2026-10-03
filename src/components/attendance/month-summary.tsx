export function MonthSummary({
  present,
  late,
  absent,
  onLeave
}: {
  present: number;
  late: number;
  absent: number;
  onLeave: number;
}) {
  const items = [
    { label: "Present", value: present, tone: "text-success" },
    { label: "Late", value: late, tone: "text-warn" },
    { label: "Absent", value: absent, tone: "text-danger" },
    { label: "On leave", value: onLeave, tone: "text-navy-800" }
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-ink-100 rounded-lg border border-ink-100 bg-surface-card shadow-subtle">
      {items.map((item) => (
        <div key={item.label} className="px-2 py-3 text-center sm:px-4">
          <p className={`font-display text-lg font-semibold ${item.tone}`}>{item.value}</p>
          <p className="mt-0.5 text-[11px] text-ink-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
