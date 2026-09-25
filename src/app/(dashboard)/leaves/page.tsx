import { PageHeader } from "@/components/page-header";

export default function LeavesPage() {
  return (
    <div>
      <PageHeader
        title="Leaves"
        description="Apply for leave, and review or approve requests from your team."
      />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-ink-100 bg-surface-card text-sm text-ink-500">
        Leave request form, balance tracker, and approval queue build next.
      </div>
    </div>
  );
}
