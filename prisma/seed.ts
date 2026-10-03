import { PrismaClient, Role, AttendanceStatus, LeaveStatus, LeaveType, PaymentMethod, SalesStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAY = 86_400_000;
const IST_OFFSET_MS = 5.5 * 3_600_000; // demo attendance timestamps are generated in IST

/** Today (UTC-midnight date) — matches how the app stores @db.Date values. */
function todayUtc(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}
const daysAgo = (n: number) => new Date(todayUtc().getTime() - n * DAY);
const daysFromNow = (n: number) => new Date(todayUtc().getTime() + n * DAY);
const key = (d: Date) => d.toISOString().slice(0, 10);

async function seedUsers() {
  const adminHash = await bcrypt.hash("Arzon@123", 10);
  const employeeHash = await bcrypt.hash("Employee@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@arzonglobal.com" },
    update: {},
    create: {
      name: "Arzon Admin",
      email: "admin@arzonglobal.com",
      passwordHash: adminHash,
      role: Role.ADMIN,
      department: "Operations",
      designation: "Administrator",
      baseSalary: 60000
    }
  });

  await prisma.user.upsert({
    where: { email: "hr@arzonglobal.com" },
    update: {},
    create: {
      name: "Meera Iyer",
      email: "hr@arzonglobal.com",
      passwordHash: employeeHash,
      role: Role.HR,
      department: "People & Culture",
      designation: "HR Manager",
      baseSalary: 45000
    }
  });

  const employees = [
    {
      name: "Ananya Rao",
      email: "ananya.rao@arzonglobal.com",
      department: "Sales",
      designation: "Sales Executive",
      baseSalary: 35000,
      commissionRate: 0.05
    },
    {
      name: "Rahul Mehta",
      email: "rahul.mehta@arzonglobal.com",
      department: "Sales",
      designation: "Sales Executive",
      baseSalary: 35000,
      commissionRate: 0.05
    },
    {
      name: "Priya Nair",
      email: "priya.nair@arzonglobal.com",
      department: "Academics",
      designation: "Curriculum Lead",
      baseSalary: 42000,
      commissionRate: 0.03
    }
  ];

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { ...emp, passwordHash: employeeHash, role: Role.EMPLOYEE }
    });
  }
}

type Deal = {
  emp: string;
  client: string;
  course: string;
  value: number;
  status: SalesStatus;
  ago: number;
  pays?: Array<[number, number, PaymentMethod, string?]>;
};

const B = PaymentMethod.BANK_TRANSFER;
const U = PaymentMethod.UPI;

const DEALS: Deal[] = [
  { emp: "ananya.rao", client: "Sneha Kapoor", course: "Full Stack Bootcamp", value: 65000, status: "CLOSED_WON", ago: 155, pays: [[150, 25000, U, "UPI-88421"], [122, 20000, B, "NEFT-1932"], [92, 20000, B, "NEFT-2240"]] },
  { emp: "ananya.rao", client: "Vikram Rao", course: "Data Science Pro", value: 82000, status: "CLOSED_WON", ago: 96, pays: [[94, 40000, B, "NEFT-3018"], [62, 42000, B, "NEFT-3377"]] },
  { emp: "ananya.rao", client: "Meghna Das", course: "UI/UX Fundamentals", value: 28000, status: "CLOSED_WON", ago: 41, pays: [[40, 28000, PaymentMethod.CARD, "POS-5521"]] },
  { emp: "ananya.rao", client: "Arjun Nair", course: "Cloud DevOps", value: 54000, status: "IN_PROGRESS", ago: 12 },
  { emp: "ananya.rao", client: "Kavya Menon", course: "Data Analytics Starter", value: 22000, status: "LEAD", ago: 4 },

  { emp: "rahul.mehta", client: "Rohan Gupta", course: "Full Stack Bootcamp", value: 65000, status: "CLOSED_WON", ago: 128, pays: [[125, 30000, B, "NEFT-1120"], [96, 35000, B, "NEFT-2011"]] },
  { emp: "rahul.mehta", client: "Ishita Verma", course: "Cyber Security Track", value: 71000, status: "CLOSED_WON", ago: 68, pays: [[66, 30000, U, "UPI-77310"], [35, 20000, U, "UPI-80122"], [8, 10000, PaymentMethod.CASH, "RCPT-204"]] },
  { emp: "rahul.mehta", client: "Manoj Pillai", course: "Corporate Training (10 seats)", value: 180000, status: "CLOSED_WON", ago: 22, pays: [[20, 90000, B, "NEFT-4410"], [5, 50000, B, "NEFT-4702"]] },
  { emp: "rahul.mehta", client: "Tanvi Shah", course: "Data Science Pro", value: 82000, status: "CLOSED_LOST", ago: 50 },
  { emp: "rahul.mehta", client: "Deepak Joshi", course: "UI/UX Fundamentals", value: 28000, status: "IN_PROGRESS", ago: 9 },

  { emp: "priya.nair", client: "Nisha Reddy", course: "Corporate Training (5 seats)", value: 95000, status: "CLOSED_WON", ago: 75, pays: [[72, 50000, B, "NEFT-2890"], [45, 45000, B, "NEFT-3502"]] },
  { emp: "priya.nair", client: "Suresh Babu", course: "Cloud DevOps", value: 54000, status: "CLOSED_LOST", ago: 30 },
  { emp: "priya.nair", client: "Lakshmi Iyer", course: "Data Analytics Starter", value: 22000, status: "CLOSED_WON", ago: 6, pays: [[3, 22000, U, "UPI-90233"]] },
  { emp: "priya.nair", client: "Farhan Ali", course: "Cyber Security Track", value: 71000, status: "LEAD", ago: 2 }
];

type LeaveSeed = { emp: string; type: LeaveType; from: Date; to: Date; status: LeaveStatus; reason: string };

function leaveSeeds(): LeaveSeed[] {
  return [
    { emp: "ananya.rao", type: "CASUAL", from: daysAgo(31), to: daysAgo(30), status: "APPROVED", reason: "Family function out of town" },
    { emp: "ananya.rao", type: "SICK", from: daysAgo(60), to: daysAgo(60), status: "APPROVED", reason: "Fever and doctor's appointment" },
    { emp: "ananya.rao", type: "EARNED", from: daysFromNow(10), to: daysFromNow(12), status: "PENDING", reason: "Short trip planned with family" },
    { emp: "rahul.mehta", type: "SICK", from: daysAgo(21), to: daysAgo(20), status: "APPROVED", reason: "Recovering from a viral infection" },
    { emp: "rahul.mehta", type: "CASUAL", from: daysFromNow(5), to: daysFromNow(6), status: "PENDING", reason: "Personal work at the bank and registrar office" },
    { emp: "priya.nair", type: "EARNED", from: daysAgo(46), to: daysAgo(43), status: "APPROVED", reason: "Annual vacation" },
    { emp: "priya.nair", type: "CASUAL", from: daysAgo(15), to: daysAgo(15), status: "REJECTED", reason: "Needed a day off during the cohort launch week" }
  ];
}

async function seedDemoData() {
  const users = await prisma.user.findMany({ where: { isActive: true } });
  const byHandle = new Map(users.map((u) => [u.email.split("@")[0], u]));

  // --- Sales + payments (only when the table is empty, so re-running never duplicates) ---
  if ((await prisma.salesReport.count()) === 0) {
    for (const d of DEALS) {
      const owner = byHandle.get(d.emp);
      if (!owner) continue;
      await prisma.salesReport.create({
        data: {
          userId: owner.id,
          clientName: d.client,
          courseOrPlan: d.course,
          dealValue: d.value,
          status: d.status,
          reportDate: daysAgo(d.ago),
          remarks: d.status === "CLOSED_LOST" ? "Went with a competitor on price" : null,
          payments: {
            create: (d.pays ?? []).map(([ago, amount, method, ref]) => ({
              amount,
              method,
              paidOn: daysAgo(ago),
              reference: ref ?? null
            }))
          }
        }
      });
    }
    console.log(`Seeded ${DEALS.length} sales reports with payments.`);
  } else {
    console.log("Sales reports already exist — skipping demo sales data.");
  }

  // --- Leaves ---
  const seeds = leaveSeeds();
  if ((await prisma.leave.count()) === 0) {
    for (const l of seeds) {
      const owner = byHandle.get(l.emp);
      if (!owner) continue;
      await prisma.leave.create({
        data: {
          userId: owner.id,
          type: l.type,
          startDate: l.from,
          endDate: l.to,
          reason: l.reason,
          status: l.status,
          reviewedBy: l.status === "APPROVED" || l.status === "REJECTED" ? byHandle.get("hr")?.id : null
        }
      });
    }
    console.log(`Seeded ${seeds.length} leave requests.`);
  } else {
    console.log("Leaves already exist — skipping demo leave data.");
  }

  // --- Attendance for the last ~5 weeks of weekdays (today is left empty so you can check in live) ---
  const approvedLeaveDays = new Map<string, Set<string>>();
  for (const l of seeds.filter((s) => s.status === "APPROVED")) {
    const owner = byHandle.get(l.emp);
    if (!owner) continue;
    const set = approvedLeaveDays.get(owner.id) ?? new Set<string>();
    for (let t = l.from.getTime(); t <= l.to.getTime(); t += DAY) set.add(key(new Date(t)));
    approvedLeaveDays.set(owner.id, set);
  }

  let attendanceRows = 0;
  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    for (let ago = 1; ago <= 35; ago++) {
      const date = daysAgo(ago);
      const weekday = date.getUTCDay();
      if (weekday === 0 || weekday === 6) continue;

      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      if (approvedLeaveDays.get(user.id)?.has(key(date))) {
        status = AttendanceStatus.ON_LEAVE;
      } else {
        const roll = (u * 31 + ago * 17) % 23;
        if (roll === 0) status = AttendanceStatus.ABSENT;
        else if (roll <= 3) status = AttendanceStatus.LATE;
        else if (roll === 4) status = AttendanceStatus.HALF_DAY;
      }

      const y = date.getUTCFullYear();
      const m = date.getUTCMonth();
      const d = date.getUTCDate();
      const at = (h: number, min: number) => new Date(Date.UTC(y, m, d, h, min) - IST_OFFSET_MS);

      const hasTimes = status === "PRESENT" || status === "LATE" || status === "HALF_DAY";
      const loginMin = (u * 7 + ago * 3) % 25;
      const loginAt = !hasTimes ? null : status === "LATE" ? at(10, 20 + (loginMin % 30)) : at(9, 5 + loginMin);
      const logoutAt = !hasTimes ? null : status === "HALF_DAY" ? at(13, 30) : at(18, 10 + ((u + ago) % 40));
      const hoursLogged =
        loginAt && logoutAt ? Math.round(((logoutAt.getTime() - loginAt.getTime()) / 3_600_000) * 100) / 100 : null;

      await prisma.attendance.upsert({
        where: { userId_date: { userId: user.id, date } },
        update: {},
        create: { userId: user.id, date, status, loginAt, logoutAt, hoursLogged }
      });
      attendanceRows++;
    }
  }
  console.log(`Ensured ${attendanceRows} historical attendance rows.`);
}

async function main() {
  await seedUsers();
  console.log("Users ready:");
  console.log("  admin@arzonglobal.com / Arzon@123           (ADMIN)");
  console.log("  hr@arzonglobal.com / Employee@123           (HR)");
  console.log("  ananya.rao@ / rahul.mehta@ / priya.nair@arzonglobal.com / Employee@123 (EMPLOYEE)");

  if (process.env.SEED_DEMO === "false") {
    console.log("SEED_DEMO=false — skipping demo sales, leave and attendance data.");
    return;
  }
  await seedDemoData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
