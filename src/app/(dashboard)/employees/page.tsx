import { PageHeader } from "@/components/page-header";

export default function EmployeesPage() {
  return (
    <div>
      <PageHeader
        title="Employees"
        description="Directory of all employees, roles, and departments."
      />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-ink-100 bg-surface-card text-sm text-ink-500">
        Employee directory with add/edit and role management builds next.
      </div>
    </div>
  );
}
