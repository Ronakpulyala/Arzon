import { auth, canReview } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/attendance";
import { projectedNextPayout } from "@/lib/salary";
import { PageHeader } from "@/components/page-header";
import { SalarySummaryCards } from "@/components/salary/salary-summary-cards";
import { MySalaryTable } from "@/components/salary/my-salary-table";
import { PayrollTable } from "@/components/salary/payroll-table";
import { SalaryLedger } from "@/components/salary/salary-ledger";

export default async function SalaryPage() {
  const session = await auth();
  const user = session!.user;
  const reviewer = canReview(user.role);

  const today = todayDateOnly();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));

  const [me, mySalaries, myReports] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
    prisma.salary.findMany({ where: { userId: user.id } }),
    prisma.salesReport.findMany({ where: { userId: user.id } })
  ]);

  const projected = projectedNextPayout({
    baseSalary: me.baseSalary,
    commissionRate: me.commissionRate,
    reportsThisMonth: myReports,
    monthStart,
    monthEnd
  });

  let payrollRows: Awaited<ReturnType<typeof buildPayrollRows>> = [];
  let allSalaries: Awaited<ReturnType<typeof fetchAllSalaries>> = [];

  if (reviewer) {
    [payrollRows, allSalaries] = await Promise.all([buildPayrollRows(), fetchAllSalaries()]);
  }

  return (
    <div>
      <PageHeader
        title="Salary"
        description={
          reviewer
            ? "Run monthly payroll (base + sales commission) and review payout history for the team."
            : "Your payout history, and an estimate of next month's payout based on deals you've closed."
        }
      />

      <div className="space-y-6">
        <div>
          <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">Your salary</h2>
          <div className="space-y-4">
            <SalarySummaryCards salaries={mySalaries} projected={projected} />
            <MySalaryTable salaries={mySalaries} />
          </div>
        </div>

        {reviewer && (
          <div>
            <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">Team payroll</h2>
            <div className="space-y-4">
              <PayrollTable employees={payrollRows} />
              <SalaryLedger salaries={allSalaries} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function buildPayrollRows() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      department: true,
      baseSalary: true,
      commissionRate: true,
      salesReports: true,
      salaries: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 1 }
    }
  });

  return users.map((u) => {
    const last = u.salaries[0];
    return {
      id: u.id,
      name: u.name,
      department: u.department,
      baseSalary: u.baseSalary,
      commissionRate: u.commissionRate,
      reports: u.salesReports,
      lastPaidAmount: last?.netPay ?? null,
      lastPaidLabel: last
        ? new Date(Date.UTC(last.year, last.month - 1, 1)).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
            timeZone: "UTC"
          })
        : null
    };
  });
}

async function fetchAllSalaries() {
  return prisma.salary.findMany({
    include: { user: { select: { name: true, department: true } } }
  });
}
