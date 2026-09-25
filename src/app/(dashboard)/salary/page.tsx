import { PageHeader } from "@/components/page-header";

export default function SalaryPage() {
  return (
    <div>
      <PageHeader
        title="Salary"
        description="Monthly payroll, payslips, and payment status per employee."
      />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-ink-100 bg-surface-card text-sm text-ink-500">
        Payroll table, payslip generation, and payment status build next.
      </div>
    </div>
  );
}
