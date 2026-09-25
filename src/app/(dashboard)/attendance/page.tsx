import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/attendance";
import { PageHeader } from "@/components/page-header";
import { CheckInCard } from "@/components/attendance/check-in-card";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { MonthSummary } from "@/components/attendance/month-summary";
import { TeamAttendanceTable } from "@/components/attendance/team-table";

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const today = todayDateOnly();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [myMonthRecords, todaysRecord] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
      orderBy: { date: "asc" }
    }),
    prisma.attendance.findUnique({
      where: { userId_date: { userId: user.id, date: today } }
    })
  ]);

  const summary = myMonthRecords.reduce(
    (acc, r) => {
      if (r.status === "PRESENT") acc.present++;
      else if (r.status === "LATE") acc.late++;
      else if (r.status === "ABSENT") acc.absent++;
      else if (r.status === "ON_LEAVE") acc.onLeave++;
      return acc;
    },
    { present: 0, late: 0, absent: 0, onLeave: 0 }
  );

  const canSeeTeam = user.role === "ADMIN" || user.role === "HR";

  const team = canSeeTeam
    ? await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
          attendance: {
            where: { date: today }
          }
        }
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Daily login/logout tracking and attendance status."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <CheckInCard today={todaysRecord} />
          <MonthSummary {...summary} />
        </div>
        <div className="lg:col-span-2">
          <AttendanceCalendar
            year={today.getFullYear()}
            month={today.getMonth()}
            records={myMonthRecords}
          />
        </div>
      </div>

      {canSeeTeam && (
        <div className="mt-6">
          <TeamAttendanceTable employees={team} />
        </div>
      )}
    </div>
  );
}
