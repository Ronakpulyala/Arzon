import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/attendance";
import { PageHeader } from "@/components/page-header";
import { CreateEmployeeForm } from "@/components/employees/create-employee-form";
import { EmployeesTable, type EmployeeRow } from "@/components/employees/employees-table";

export default async function EmployeesPage() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) redirect("/dashboard");

  const today = todayDateOnly();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));

  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      salesReports: { where: { status: "CLOSED_WON", reportDate: { gte: monthStart, lte: monthEnd } } },
      leaves: { where: { status: "PENDING" } }
    }
  });

  const employees: EmployeeRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    designation: u.designation,
    dateJoined: u.dateJoined,
    isActive: u.isActive,
    baseSalary: u.baseSalary,
    commissionRate: u.commissionRate,
    dealsWonThisMonth: u.salesReports.length,
    wonValueThisMonth: u.salesReports.reduce((s, r) => s + r.dealValue, 0),
    pendingLeaves: u.leaves.length
  }));

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Directory of everyone at Arzon Global. Only Admins can see this page."
      />

      <div className="mb-6">
        <CreateEmployeeForm />
      </div>

      <EmployeesTable employees={employees} currentUserId={session.user.id} />
    </div>
  );
}
