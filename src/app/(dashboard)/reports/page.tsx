import { PageHeader } from "@/components/page-header";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Cross-team reporting: attendance trends, leave patterns, and sales performance."
      />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-ink-100 bg-surface-card text-sm text-ink-500">
        Charts and exportable reports build next, once the underlying modules have data.
      </div>
    </div>
  );
}
