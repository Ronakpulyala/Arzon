import { auth, canReview } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { monthRange, parseMonthParam, statusCounts, todayDateOnly } from "@/lib/attendance";
import { PageHeader } from "@/components/page-header";
import { CheckInCard } from "@/components/attendance/check-in-card";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { MonthSummary } from "@/components/attendance/month-summary";
import { TeamAttendanceTable } from "@/components/attendance/team-table";

export default async function AttendancePage({
  searchParams
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const session = await auth();
  const user = session!.user;

  const today = todayDateOnly();
  const { year, month } = parseMonthParam(monthParam);
  const { start, end } = monthRange(year, month);

  const [monthRecords, todaysRecord] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId: user.id, date: { gte: start, lte: end } },
      orderBy: { date: "asc" }
    }),
    prisma.attendance.findUnique({ where: { userId_date: { userId: user.id, date: today } } })
  ]);

  const counts = statusCounts(monthRecords);
  const showTeam = canReview(user.role);

  const team = showTeam
    ? await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          department: true,
          designation: true,
          attendance: { where: { date: today } }
        }
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Daily check-in/out tracking. Browse previous months with the arrows on the calendar."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <CheckInCard today={todaysRecord} />
          <MonthSummary
            present={counts.PRESENT}
            late={counts.LATE}
            absent={counts.ABSENT}
            onLeave={counts.ON_LEAVE}
          />
        </div>
        <div className="lg:col-span-2">
          <AttendanceCalendar year={year} month={month} records={monthRecords} />
        </div>
      </div>

      {showTeam && (
        <div className="mt-6">
          <TeamAttendanceTable employees={team} />
        </div>
      )}
    </div>
  );
}
