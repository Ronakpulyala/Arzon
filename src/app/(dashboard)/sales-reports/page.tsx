import { PageHeader } from "@/components/page-header";

export default function SalesReportsPage() {
  return (
    <div>
      <PageHeader
        title="Sales Reports"
        description="Employees log deals and leads here; admins track team performance."
      />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-ink-100 bg-surface-card text-sm text-ink-500">
        &quot;Add sales report&quot; form and the team&apos;s deal pipeline table build next.
      </div>
    </div>
  );
}
