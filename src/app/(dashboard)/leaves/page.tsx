import { auth, canReview } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/attendance";
import { PageHeader } from "@/components/page-header";
import { LeaveRequestForm } from "@/components/leaves/leave-request-form";
import { LeaveBalanceCards } from "@/components/leaves/leave-balance-cards";
import { MyLeavesTable } from "@/components/leaves/my-leaves-table";
import { ApprovalQueue } from "@/components/leaves/approval-queue";
import { AllLeavesTable } from "@/components/leaves/all-leaves-table";

export default async function LeavesPage() {
  const session = await auth();
  const user = session!.user;
  const year = todayDateOnly().getUTCFullYear();
  const reviewer = canReview(user.role);

  const myLeavesQuery = prisma.leave.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  const allLeavesQuery = reviewer
    ? prisma.leave.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, department: true } } }
      })
    : null;

  const [myLeaves, allLeavesResult] = await Promise.all([myLeavesQuery, allLeavesQuery]);
  const allLeaves = allLeavesResult ?? [];

  const pending = allLeaves.filter((l) => l.status === "PENDING").reverse();

  return (
    <div>
      <PageHeader
        title="Leaves"
        description="Apply for leave, track your balance, and (for HR/Admin) review your team's requests."
      />

      {reviewer && (
        <div className="mb-6">
          <ApprovalQueue pending={pending} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LeaveRequestForm name={user.name ?? "You"} />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <LeaveBalanceCards leaves={myLeaves} year={year} />
          <MyLeavesTable leaves={myLeaves} />
        </div>
      </div>

      {reviewer && (
        <div className="mt-6">
          <AllLeavesTable leaves={allLeaves} />
        </div>
      )}
    </div>
  );
}
