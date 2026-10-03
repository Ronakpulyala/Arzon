import { auth, canReview, isAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SalesReportForm } from "@/components/sales/sales-report-form";
import { MySalesTable } from "@/components/sales/my-sales-table";
import { TeamSalesTable } from "@/components/sales/team-sales-table";
import { PaymentsLedger, type LedgerRow } from "@/components/sales/payments-ledger";
import { PendingPaymentsQueue, type PendingPaymentRow } from "@/components/sales/pending-payments-queue";
import { SalesSummaryCards } from "@/components/sales/sales-summary-cards";

export default async function SalesReportsPage() {
  const session = await auth();
  const user = session!.user;
  const reviewer = canReview(user.role);
  const admin = isAdmin(user.role);

  const myReportsQuery = prisma.salesReport.findMany({
    where: { userId: user.id },
    orderBy: { reportDate: "desc" },
    include: { payments: true }
  });
  const teamReportsQuery = reviewer
    ? prisma.salesReport.findMany({
        orderBy: { reportDate: "desc" },
        include: { payments: true, user: { select: { id: true, name: true } } }
      })
    : null;

  const [myReports, teamResult] = await Promise.all([myReportsQuery, teamReportsQuery]);
  const teamReports = teamResult ?? [];

  const ledger: LedgerRow[] = teamReports
    .flatMap((r) =>
      r.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        status: p.status,
        paidOn: p.paidOn,
        reference: p.reference,
        clientName: r.clientName,
        courseOrPlan: r.courseOrPlan,
        employeeId: r.user.id,
        employeeName: r.user.name
      }))
    )
    .sort((a, b) => +b.paidOn - +a.paidOn);

  const pendingPayments: PendingPaymentRow[] = admin
    ? ledger
        .filter((p) => p.status === "PENDING")
        .map((p) => ({
          id: p.id,
          amount: p.amount,
          method: p.method,
          paidOn: p.paidOn,
          reference: p.reference,
          clientName: p.clientName,
          courseOrPlan: p.courseOrPlan,
          employeeName: p.employeeName
        }))
    : [];

  return (
    <div>
      <PageHeader
        title="Sales Reports"
        description={
          reviewer
            ? "Log your own deals, and track every employee's deals and payments in one place."
            : "Log your deals, then submit payments for Admin approval."
        }
      />

      <div className="mb-6">
        <SalesSummaryCards reports={reviewer ? teamReports : myReports} scope={reviewer ? "team" : "you"} />
      </div>

      {admin && (
        <div className="mb-6">
          <PendingPaymentsQueue payments={pendingPayments} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SalesReportForm />
        </div>
        <div className="lg:col-span-2">
          <MySalesTable reports={myReports} />
        </div>
      </div>

      {reviewer && (
        <div className="mt-6 space-y-6">
          <TeamSalesTable reports={teamReports} />
          <PaymentsLedger payments={ledger} />
        </div>
      )}
    </div>
  );
}
